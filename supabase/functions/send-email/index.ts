import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Log environment variables (without exposing sensitive data)
console.log('Environment check:', {
  hasSendGridKey: !!Deno.env.get('SENDGRID_API_KEY'),
  hasFromEmail: !!Deno.env.get('FROM_EMAIL'),
})

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required')
}

const FROM_EMAIL = Deno.env.get('FROM_EMAIL')
if (!FROM_EMAIL) {
  throw new Error('FROM_EMAIL is required')
}

const templates = {
  'ticket-confirmation': (data: any) => ({
    subject: `[Ticket #${data.ticketId}] We've received your support request`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for contacting our support team.</h2>

        <p>We've received your ticket with the following details:</p>
        
        <ul>
          <li><strong>Ticket ID:</strong> ${data.ticketId}</li>
          <li><strong>Subject:</strong> ${data.subject}</li>
        </ul>
        
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <strong>Your message:</strong><br>
          ${data.description}
        </div>
        
        <p>You can reply directly to this email to add more information to your ticket.</p>
        
        <p>Best regards,<br>Support Team</p>
      </div>
    `
  }),
  
  'ticket-response': (data: any) => ({
    subject: `[Ticket #${data.ticketId}] Response to your support request`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>We've responded to your support ticket</h2>
        
        <p>Regarding: "${data.subject}"</p>
        
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <strong>Response from ${data.responderName}:</strong><br>
          ${data.response}
        </div>
        
        <p>You can reply directly to this email to continue the conversation.</p>
        
        <p>Best regards,<br>Support Team</p>
      </div>
    `
  })
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the incoming request
    console.log('Received request:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    })

    const body = await req.json()
    console.log('Request body:', body)

    const { to, template, data } = body
    
    // Validate required fields
    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Recipient email (to) is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Template data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const templateFn = templates[template as keyof typeof templates]
    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: `Invalid template: ${template}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const emailTemplate = templateFn(data)
    console.log('Sending email with:', {
      from: FROM_EMAIL,
      to,
      subject: emailTemplate.subject,
      templateName: template
    })

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }]
          }],
          from: { email: FROM_EMAIL },
          subject: emailTemplate.subject,
          content: [{
            type: 'text/html',
            value: emailTemplate.html
          }],
          reply_to: { email: `${data.ticketId}@inbound.chatgenius.rocks` },
          custom_args: {
            ticket_id: data.ticketId
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`SendGrid API error: ${JSON.stringify(error)}`)
      }

      console.log('Email sent successfully')

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } catch (error) {
      console.error('SendGrid API error:', error)
      return new Response(
        JSON.stringify({ 
          error: {
            message: error instanceof Error ? error.message : 'Failed to send email',
            details: error
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
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