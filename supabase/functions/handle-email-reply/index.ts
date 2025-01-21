import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the incoming request
    const contentType = req.headers.get('content-type')
    console.log('Received SendGrid webhook:', {
      method: req.method,
      contentType,
      headers: Object.fromEntries(req.headers.entries())
    })

    const rawBody = await req.text()
    console.log('Raw request body length:', rawBody.length)
    console.log('Raw request body preview:', rawBody.substring(0, 200))

    let body: any = {}
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart form data
      const boundary = contentType.split('boundary=')[1]
      console.log('Form boundary:', boundary)
      
      // Split the raw body into parts
      const parts = rawBody.split(`--${boundary}`)
      console.log('Number of parts:', parts.length)
      
      for (const part of parts) {
        if (part.includes('name="to"')) {
          body.to = part.split('\r\n\r\n')[1]?.trim()
        } else if (part.includes('name="from"')) {
          body.from = part.split('\r\n\r\n')[1]?.trim()
        } else if (part.includes('name="text"')) {
          body.text = part.split('\r\n\r\n')[1]?.trim()
        } else if (part.includes('name="email"')) {
          body.raw_email = part.split('\r\n\r\n')[1]?.trim()
        }
      }
    } else {
      // Try parsing as URL-encoded or JSON
      try {
        body = JSON.parse(rawBody)
      } catch {
        const formData = new URLSearchParams(rawBody)
        body = {
          to: formData.get('to'),
          from: formData.get('from'),
          text: formData.get('text'),
          email: formData.get('email')
        }
      }
    }

    console.log('Parsed body:', body)

    // Extract ticket ID from the email address
    const to = body.to || ''
    console.log('Extracted to:', to)
    
    const ticketId = to.split('@')[0]
    console.log('Extracted ticket ID:', ticketId)

    if (!ticketId) {
      console.error('No ticket ID found in recipient:', to)
      return new Response(
        JSON.stringify({ error: 'No ticket ID found in recipient' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get the ticket and requester profile to verify the sender
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        requester_email,
        status
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError)
      return new Response(
        JSON.stringify({ error: 'Ticket not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Verify the sender is the ticket requester
    const fromEmail = body.from.match(/<(.+)>/)?.[1] || body.from.trim()
    console.log('Extracted from email:', fromEmail)
    
    if (fromEmail !== ticket.requester_email) {
      console.error('Email not from ticket requester:', {
        from: body.from,
        fromEmail,
        requester: ticket.requester_email
      })
      return new Response(
        JSON.stringify({ error: 'Unauthorized sender' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Extract the email content (prefer text version)
    let content = body.text || body.html || body.raw_email
    console.log('Raw content:', {
      hasText: !!body.text,
      hasHtml: !!body.html,
      hasRawEmail: !!body.raw_email,
      contentLength: content?.length
    })
    
    // If we have raw email, try to extract the content from multipart
    if (body.raw_email && !body.text && !body.html) {
      const boundaryMatch = body.raw_email.match(/boundary="([^"]+)"/);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        console.log('Found boundary:', boundary);
        
        // Split by boundary and look for text/plain part
        const parts = body.raw_email.split('--' + boundary);
        for (const part of parts) {
          if (part.includes('Content-Type: text/plain')) {
            // Extract content after headers (double newline)
            const contentMatch = part.split('\r\n\r\n')[1];
            if (contentMatch) {
              // Remove any trailing boundaries or MIME parts
              content = contentMatch.split('--' + boundary)[0].trim();
              console.log('Extracted content from multipart:', content);
              break;
            }
          }
        }
      }
    }
    
    if (!content) {
      console.error('No content found in email:', body)
      return new Response(
        JSON.stringify({ error: 'No content found in email' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Clean up the content - remove quoted text, signatures, and email headers
    const cleanContent = content
      .split('\n')
      .filter(line => {
        const trimmedLine = line.trim();
        // Filter out common email artifacts
        return !line.startsWith('>')  // Quoted text
          && !line.startsWith('On ')  // Reply headers
          && !line.match(/^[A-Za-z-]+:/)  // Email headers
          && !line.match(/^>+\s/) // Nested quotes
          && !line.match(/^-{3,}/) // Signature separators
          && !line.match(/^_{3,}/) // Signature separators
          && trimmedLine !== '' // Empty lines
          && !trimmedLine.match(/^Sent from/) // Email client signatures
          && !trimmedLine.match(/^[A-Za-z-]+:.*@.*\.[A-Za-z]{2,}/) // Email addresses in headers
      })
      .join('\n')
      .trim();

    if (!cleanContent) {
      console.error('No content found after cleaning:', { original: content, cleaned: cleanContent })
      return new Response(
        JSON.stringify({ error: 'No content found after removing quotes' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create a comment from the email
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        content: cleanContent,
        is_internal: false,
        author_id: null // Set to null for customer replies via email
      })
      .select()
      .single()

    if (commentError) {
      console.error('Failed to create comment:', commentError)
      return new Response(
        JSON.stringify({ error: 'Failed to create comment' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // If ticket was closed, reopen it
    if (ticket.status === 'closed') {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'open' })
        .eq('id', ticketId)

      if (updateError) {
        console.error('Failed to reopen ticket:', updateError)
      }
    }

    console.log('Successfully processed email reply:', {
      ticketId,
      commentId: comment.id
    })

    return new Response(
      JSON.stringify({ success: true, commentId: comment.id }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          details: error
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}) 