# API Design Documentation

## Overview
RESTful API endpoints for the help desk platform. The API serves two types of users:
1. Internal users (admins, agents) authenticated via Supabase
2. External users (customers) authenticated via customer-system JWT tokens

## Authentication Methods

### Internal Users (Supabase)
Internal users (admins and agents) authenticate using Supabase auth:
```http
POST /login
POST /signup
POST /logout
```

### External Users (Customer Integration)
Customers from external systems authenticate using JWT tokens:
```http
POST /customer/auth
# Generate JWT token for customer access
Body: {
  "customerId": string,    // Customer's ID in their system
  "email": string,        // Customer's email
  "name": string,         // Customer's name
  "timestamp": number,    // Current timestamp
  "signature": string     // HMAC signature for verification
}

Response: {
  "token": string        // JWT token for API access
}
```

Example customer integration:
```typescript
// On customer's system
const timestamp = Date.now()
const signature = createHmac('sha256', SHARED_SECRET)
  .update(`${customerId}${email}${timestamp}`)
  .digest('hex')

const response = await fetch('your-helpdesk/customer/auth', {
  method: 'POST',
  body: JSON.stringify({
    customerId,
    email,
    name,
    timestamp,
    signature
  })
})

const { token } = await response.json()
```

## Authorization
All authenticated endpoints require a valid JWT token in the Authorization header:
`Authorization: Bearer {token}`

## Response Format
Standard response format:
```json
{
  "data": {}, // Main response data
  "error": null, // Error message if applicable
  "meta": {} // Pagination, counts, etc.
}
```

## Endpoints

### Sprint 1: Authentication & User Management

#### Authentication
```http
POST /customer/auth
# Generate customer access token
Body: {
  "customerId": string,
  "email": string,
  "name": string,
  "timestamp": number,
  "signature": string
}
Response: {
  "token": string,
  "expiresIn": number
}

POST /login
# Internal user authentication (Supabase)
Body: {
  "email": string,
  "password": string
}
Response: {
  "token": string,
  "user": {
    "id": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "role": string
  }
}

POST /signup
# Internal user registration (Supabase)
Body: {
  "email": string,
  "password": string,
  "firstName": string,
  "lastName": string,
  "role": "admin" | "agent"
}
Response: {
  "user": {
    "id": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "role": string
  }
}

POST /logout
# End current session
Response: {
  "success": true
}
```

#### Profile Management
```http
GET /profile
# Get current user's profile (internal or customer)
Response: {
  "data": {
    "id": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "role": string,
    "avatarUrl": string,
    "settings": object
  }
}

PATCH /profile
# Update current user's profile (internal only)
Body: {
  "firstName": string,
  "lastName": string,
  "avatarUrl": string,
  "settings": object
}
Response: {
  "data": {
    "id": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "role": string,
    "avatarUrl": string,
    "settings": object
  }
}

GET /users
# List all users (Admin only)
Query params:
  - role: string
  - search: string
  - page: number
  - limit: number
Response: {
  "data": [{
    "id": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "role": string,
    "avatarUrl": string
  }],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

GET /users/:id
# Get specific user details (Admin only)
Response: {
  "data": {
    "id": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "role": string,
    "avatarUrl": string,
    "settings": object
  }
}

PATCH /users/:id
# Update user role/status (Admin only)
Body: {
  "role": "admin" | "agent" | "customer",
  "status": "active" | "inactive"
}
Response: {
  "data": {
    "id": string,
    "role": string,
    "status": string
  }
}

DELETE /users/:id
# Remove user (Admin only)
Response: {
  "success": true
}

POST /users/invite
# Send user invitation (Admin only)
Body: {
  "email": string,
  "role": "agent" | "admin"
}
Response: {
  "data": {
    "id": string,
    "email": string,
    "role": string,
    "inviteToken": string
  }
}
```

### Sprint 2: Core Ticketing System

#### Tickets
```http
GET /tickets
# List tickets
# - Internal users: See all assigned/relevant tickets
# - Customers: See only their own tickets
Query params:
  - status: string
  - priority: string
  - assigneeId: string
  - search: string
  - page: number
  - limit: number
Response: {
  "data": [{
    "id": string,
    "subject": string,
    "status": string,
    "priority": string,
    "requesterId": string,
    "assigneeId": string,
    "teamId": string,
    "createdAt": string,
    "updatedAt": string
  }],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

POST /tickets
# Create new ticket
# - Internal users: Can create for any customer
# - Customers: Can only create their own tickets
Body: {
  "subject": string,
  "description": string,
  "priority": "low" | "normal" | "high" | "urgent",
  "customerId": string,  // Required for internal users creating customer tickets
  "attachments": File[]  // Optional
}
Response: {
  "data": {
    "id": string,
    "subject": string,
    "description": string,
    "status": "new",
    "priority": string,
    "requesterId": string,
    "createdAt": string
  }
}

GET /tickets/:ticketId
# Get ticket details
# - Internal users: Any ticket
# - Customers: Only their own tickets
Response: {
  "data": {
    "id": string,
    "subject": string,
    "description": string,
    "status": string,
    "priority": string,
    "requesterId": string,
    "assigneeId": string,
    "teamId": string,
    "createdAt": string,
    "updatedAt": string,
    "comments": [{
      "id": string,
      "content": string,
      "authorId": string,
      "isInternal": boolean,
      "createdAt": string
    }],
    "attachments": [{
      "id": string,
      "filename": string,
      "url": string,
      "contentType": string,
      "size": number
    }]
  }
}

PUT /tickets/:ticketId
# Update ticket
# - Internal users: Full update capabilities
# - Customers: Can only update description
Body: {
  "subject": string,      // Internal only
  "description": string,  // Both
  "status": string,      // Internal only
  "priority": string     // Internal only
}
Response: {
  "data": {
    "id": string,
    "subject": string,
    "description": string,
    "status": string,
    "priority": string,
    "updatedAt": string
  }
}

DELETE /tickets/:ticketId
# Delete ticket (Admin only)
Response: {
  "success": true
}
```

#### Comments
```http
GET /tickets/:ticketId/comments
# List ticket comments
# - Internal users: All comments
# - Customers: Only non-internal comments
Query params:
  - page: number
  - limit: number
Response: {
  "data": [{
    "id": string,
    "content": string,
    "authorId": string,
    "isInternal": boolean,
    "createdAt": string
  }],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

POST /tickets/:ticketId/comments
# Add comment
# - Internal users: Can create internal comments
# - Customers: Only public comments
Body: {
  "content": string,
  "isInternal": boolean,  // Internal users only
  "attachments": File[]   // Optional
}
Response: {
  "data": {
    "id": string,
    "content": string,
    "authorId": string,
    "isInternal": boolean,
    "createdAt": string
  }
}

PUT /tickets/:ticketId/comments/:commentId
# Update comment
# - Internal users: Any comment
# - Customers: Only their own comments, within time limit
Body: {
  "content": string
}
Response: {
  "data": {
    "id": string,
    "content": string,
    "updatedAt": string
  }
}

DELETE /tickets/:ticketId/comments/:commentId
# Delete comment
# - Internal users: Any comment
# - Customers: Only their own comments, within time limit
Response: {
  "success": true
}
```

#### Attachments
```http
GET /tickets/:ticketId/attachments
# List attachments
# - Internal users: All attachments
# - Customers: Only attachments from their tickets
Response: {
  "data": [{
    "id": string,
    "filename": string,
    "url": string,
    "contentType": string,
    "size": number,
    "createdAt": string
  }]
}

POST /tickets/:ticketId/attachments
# Upload attachment
Body: FormData
Response: {
  "data": {
    "id": string,
    "filename": string,
    "url": string,
    "contentType": string,
    "size": number
  }
}

GET /attachments/:attachmentId
# Get attachment details/download
# - Internal users: Any attachment
# - Customers: Only from their tickets
Response: File

DELETE /attachments/:attachmentId
# Remove attachment
# - Internal users: Any attachment
# - Customers: Only their own, within time limit
Response: {
  "success": true
}
```

### Sprint 3: Team Management

#### Teams
```http
GET /teams
# List all teams (Internal only)
Query params:
  - search: string
  - page: number
  - limit: number
Response: {
  "data": [{
    "id": string,
    "name": string,
    "description": string,
    "memberCount": number,
    "createdAt": string
  }],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

POST /teams
# Create team (Admin only)
Body: {
  "name": string,
  "description": string,
  "settings": object
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "settings": object,
    "createdAt": string
  }
}

GET /teams/:teamId
# Get team details (Internal only)
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "settings": object,
    "members": [{
      "id": string,
      "userId": string,
      "role": string,
      "joinedAt": string
    }],
    "createdAt": string,
    "updatedAt": string
  }
}

PUT /teams/:teamId
# Update team (Admin only)
Body: {
  "name": string,
  "description": string,
  "settings": object
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "settings": object,
    "updatedAt": string
  }
}

DELETE /teams/:teamId
# Delete team (Admin only)
Response: {
  "success": true
}
```

#### Team Members
```http
GET /teams/:teamId/members
# List team members (Internal only)
Query params:
  - role: string
  - page: number
  - limit: number
Response: {
  "data": [{
    "id": string,
    "userId": string,
    "role": string,
    "joinedAt": string
  }],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

POST /teams/:teamId/members
# Add team member (Admin only)
Body: {
  "userId": string,
  "role": "leader" | "member"
}
Response: {
  "data": {
    "id": string,
    "userId": string,
    "role": string,
    "joinedAt": string
  }
}

PATCH /teams/:teamId/members/:userId
# Update member role (Admin only)
Body: {
  "role": "leader" | "member"
}
Response: {
  "data": {
    "id": string,
    "userId": string,
    "role": string,
    "updatedAt": string
  }
}

DELETE /teams/:teamId/members/:userId
# Remove team member (Admin only)
Response: {
  "success": true
}
```

#### Ticket Assignment
```http
PUT /tickets/:ticketId/assignee
# Assign ticket (Internal only)
Body: {
  "assigneeId": string,
  "teamId": string
}
Response: {
  "data": {
    "id": string,
    "assigneeId": string,
    "teamId": string,
    "updatedAt": string
  }
}
```

### Sprint 4: Custom Fields & Tags

#### Custom Fields
```http
GET /custom-fields
# List custom fields (Internal only)
Response: {
  "data": [{
    "id": string,
    "name": string,
    "fieldType": string,
    "options": object,
    "isRequired": boolean,
    "createdAt": string
  }]
}

POST /custom-fields
# Create custom field (Admin only)
Body: {
  "name": string,
  "fieldType": "text" | "number" | "date" | "list",
  "options": object,
  "isRequired": boolean
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "fieldType": string,
    "options": object,
    "isRequired": boolean,
    "createdAt": string
  }
}

GET /custom-fields/:fieldId
# Get field details (Internal only)
Response: {
  "data": {
    "id": string,
    "name":
    "name": string,
    "fieldType": string,
    "options": object,
    "isRequired": boolean,
    "createdAt": string,
    "updatedAt": string
  }
}

PUT /custom-fields/:fieldId
# Update field (Admin only)
Body: {
  "name": string,
  "options": object,
  "isRequired": boolean
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "fieldType": string,
    "options": object,
    "isRequired": boolean,
    "updatedAt": string
  }
}

DELETE /custom-fields/:fieldId
# Delete field (Admin only)
Response: {
  "success": true
}
```

#### Field Values
```http
GET /tickets/:ticketId/custom-fields
# Get ticket's custom field values
# - Internal users: Any ticket
# - Customers: Only their tickets
Response: {
  "data": [{
    "fieldId": string,
    "value": any,
    "updatedAt": string
  }]
}

POST /tickets/:ticketId/custom-fields/:fieldId
# Set field value
# - Internal users: Any ticket
# - Customers: Only their tickets, only allowed fields
Body: {
  "value": any
}
Response: {
  "data": {
    "fieldId": string,
    "value": any,
    "updatedAt": string
  }
}

DELETE /tickets/:ticketId/custom-fields/:fieldId
# Remove field value (Internal only)
Response: {
  "success": true
}
```

#### Tags
```http
GET /tags
# List all tags (Internal only)
Response: {
  "data": [{
    "id": string,
    "name": string,
    "description": string,
    "color": string,
    "createdAt": string
  }]
}

POST /tags
# Create tag (Internal only)
Body: {
  "name": string,
  "description": string,
  "color": string
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "color": string,
    "createdAt": string
  }
}

GET /tags/:tagId
# Get tag details (Internal only)
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "color": string,
    "createdAt": string,
    "updatedAt": string
  }
}

PUT /tags/:tagId
# Update tag (Internal only)
Body: {
  "name": string,
  "description": string,
  "color": string
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "color": string,
    "updatedAt": string
  }
}

DELETE /tags/:tagId
# Delete tag (Internal only)
Response: {
  "success": true
}
```

#### Ticket Tags
```http
POST /tickets/:ticketId/tags
# Add tags to ticket (Internal only)
Body: {
  "tagIds": string[]
}
Response: {
  "data": [{
    "tagId": string,
    "name": string,
    "color": string
  }]
}

DELETE /tickets/:ticketId/tags/:tagId
# Remove tag from ticket (Internal only)
Response: {
  "success": true
}
```

### Sprint 5: Reporting & Analytics

#### Basic Reports
```http
GET /reports/dashboard
# Get dashboard metrics (Internal only)
Response: {
  "data": {
    "newTickets": number,
    "openTickets": number,
    "resolvedTickets": number,
    "avgResponseTime": number,
    "customerSatisfaction": number
  }
}

GET /reports/tickets
# Get ticket statistics (Internal only)
Query params:
  - startDate: string
  - endDate: string
  - groupBy: string
Response: {
  "data": {
    "total": number,
    "byStatus": {
      "new": number,
      "open": number,
      "pending": number,
      "resolved": number
    },
    "byPriority": {
      "low": number,
      "normal": number,
      "high": number,
      "urgent": number
    },
    "timeline": [{
      "date": string,
      "count": number
    }]
  }
}

GET /reports/performance
# Get agent performance metrics (Internal only)
Query params:
  - startDate: string
  - endDate: string
  - agentId: string
Response: {
  "data": {
    "ticketsHandled": number,
    "avgResponseTime": number,
    "resolutionRate": number,
    "customerRating": number
  }
}

GET /reports/trends
# Get trend analysis (Internal only)
Query params:
  - period: string
  - metric: string
Response: {
  "data": [{
    "date": string,
    "value": number
  }]
}
```

#### Advanced Analytics
```http
GET /reports/custom-fields
# Get custom field statistics (Internal only)
Query params:
  - fieldId: string
  - startDate: string
  - endDate: string
Response: {
  "data": {
    "distribution": [{
      "value": any,
      "count": number
    }]
  }
}

GET /reports/sla
# Get SLA compliance data (Internal only)
Query params:
  - startDate: string
  - endDate: string
Response: {
  "data": {
    "overall": number,
    "byPriority": {
      "low": number,
      "normal": number,
      "high": number,
      "urgent": number
    },
    "timeline": [{
      "date": string,
      "compliance": number
    }]
  }
}

GET /reports/team
# Get team analytics (Internal only)
Query params:
  - teamId: string
  - startDate: string
  - endDate: string
Response: {
  "data": {
    "ticketsHandled": number,
    "avgResponseTime": number,
    "memberPerformance": [{
      "userId": string,
      "metrics": {
        "ticketsHandled": number,
        "avgResponseTime": number
      }
    }]
  }
}

POST /reports/custom
# Generate custom report (Internal only)
Body: {
  "metrics": string[],
  "dimensions": string[],
  "filters": object,
  "dateRange": {
    "start": string,
    "end": string
  }
}
Response: {
  "data": {
    "results": [object],
    "summary": object
  }
}

GET /reports/export
# Export report data (Internal only)
Query params:
  - format: "csv" | "xlsx"
  - reportType: string
  - startDate: string
  - endDate: string
Response: File
```

### Sprint 6: Knowledge Base

#### Articles
```http
GET /kb/articles
# List articles
# - Internal users: All articles
# - Customers: Only public articles
Query params:
  - status: string
  - category: string
  - search: string
  - page: number
  - limit: number
Response: {
  "data": [{
    "id": string,
    "title": string,
    "excerpt": string,
    "status": string,
    "isInternal": boolean,
    "createdAt": string
  }],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

POST /kb/articles
# Create article (Internal only)
Body: {
  "title": string,
  "content": string,
  "categoryIds": string[],
  "isInternal": boolean,
  "status": "draft" | "published"
}
Response: {
  "data": {
    "id": string,
    "title": string,
    "content": string,
    "status": string,
    "isInternal": boolean,
    "createdAt": string
  }
}

GET /kb/articles/:articleId
# Get article details
# - Internal users: Any article
# - Customers: Only public articles
Response: {
  "data": {
    "id": string,
    "title": string,
    "content": string,
    "status": string,
    "isInternal": boolean,
    "categories": [{
      "id": string,
      "name": string
    }],
    "createdAt": string,
    "updatedAt": string
  }
}

PATCH /kb/articles/:articleId
# Update article (Internal only)
Body: {
  "title": string,
  "content": string,
  "status": string,
  "isInternal": boolean
}
Response: {
  "data": {
    "id": string,
    "title": string,
    "content": string,
    "status": string,
    "isInternal": boolean,
    "updatedAt": string
  }
}

DELETE /kb/articles/:articleId
# Delete/archive article (Internal only)
Response: {
  "success": true
}
```

#### Categories
```http
GET /kb/categories
# List categories
Response: {
  "data": [{
    "id": string,
    "name": string,
    "description": string,
    "parentId": string,
    "articleCount": number
  }]
}

POST /kb/categories
# Create category (Internal only)
Body: {
  "name": string,
  "description": string,
  "parentId": string
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "parentId": string,
    "createdAt": string
  }
}

PATCH /kb/categories/:categoryId
# Update category (Internal only)
Body: {
  "name": string,
  "description": string,
  "parentId": string
}
Response: {
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "parentId": string,
    "updatedAt": string
  }
}

DELETE /kb/categories/:categoryId
# Delete category (Internal only)
Response: {
  "success": true
}
```

#### AI Features
```http
GET /kb/ai/search
# Search articles with AI
Query params:
  - query: string
  - limit: number
Response: {
  "data": [{
    "id": string,
    "title": string,
    "excerpt": string,
    "relevanceScore": number
  }]
}

POST /kb/ai/suggest
# Get article suggestions
Body: {
  "content": string,
  "context": object
}
Response: {
  "data": [{
    "id": string,
    "title": string,
    "relevance": number,
    "excerpt": string
  }]
}

POST /kb/ai/answer
# Generate AI answer
Body: {
  "question": string,
  "context": object
}
Response: {
  "data": {
    "answer": string,
    "confidence": number,
    "sources": [{
      "articleId": string,
      "title": string,
      "relevance": number
    }]
  }
}
```

## Customer Integration Guide

### Setup Steps
1. Request API credentials (includes SHARED_SECRET)
2. Implement JWT token generation
3. Add token to all API requests
4. Handle token expiration and renewal

### Security Requirements
1. Sign all auth requests with HMAC
2. Include current timestamp
3. Renew tokens before expiration
4. Store SHARED_SECRET securely

### Sample Integration Code
```typescript
class HelpdeskAPI {
  constructor(
    private apiUrl: string,
    private customerId: string,
    private sharedSecret: string
  ) {}

  private async getToken() {
    const timestamp = Date.now()
    const signature = this.createSignature(timestamp)
    
    const response = await fetch(`${this.apiUrl}/customer/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: this.customerId,
        timestamp,
        signature
      })
    })
    
    const { token } = await response.json()
    return token
  }

  private createSignature(timestamp: number) {
    return createHmac('sha256', this.sharedSecret)
      .update(`${this.customerId}${timestamp}`)
      .digest('hex')
  }

  async createTicket(data: TicketData) {
    const token = await this.getToken()
    
    return fetch(`${this.apiUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": string,
    "message": string,
    "details": object
  }
}
```

### Common Error Codes
- 400: Bad Request - Invalid input
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 409: Conflict - Resource already exists
- 422: Unprocessable Entity - Valid input but logically incorrect
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Server-side error

### Error Examples
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "must be a valid email address"
    }
  }
}

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {
      "reason": "token_expired"
    }
  }
}
```

## Pagination
All list endpoints support pagination via query parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "data": [...],
  "meta": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

## Filtering
List endpoints support filtering via query parameters:
- sort: Field to sort by
- order: "asc" or "desc"
- search: Search term
- status: Filter by status
- startDate/endDate: Date range filters

Example:
```http
GET /tickets?status=open&priority=high&sort=createdAt&order=desc
```

## Rate Limiting
- Rate limits are applied per token
- Limits reset hourly
- Headers included in responses:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Versioning
- API version specified in URL: `/v1/`
- Current version: v1
- Breaking changes trigger version increment