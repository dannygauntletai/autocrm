# Help Desk Database Schema Documentation

## Sprint 1: User Management & Authentication
Focus: Basic user system and authentication

### profiles
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key, links to auth.users |
| email         | TEXT        | User's email address           |
| first_name    | TEXT        | User's first name              |
| last_name     | TEXT        | User's last name               |
| role          | TEXT        | 'admin', 'agent', 'customer'   |
| avatar_url    | TEXT        | URL to user's avatar           |
| settings      | JSONB       | User preferences and settings  |

**Indexes:**
- `idx_profiles_email`: Index on email column
- `idx_profiles_role`: Index on role column

## Sprint 2: Basic Ticketing System
Focus: Essential ticket management and communication

### tickets
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| subject       | TEXT        | Ticket subject                 |
| description   | TEXT        | Ticket description             |
| status        | TEXT        | 'new','open','pending','solved'|
| priority      | TEXT        | 'low','normal','high','urgent' |
| category      | TEXT        | Ticket category                |
| requester_id  | UUID        | FK to profiles.id              |
| assignee_id   | UUID        | FK to profiles.id              |
| team_id       | UUID        | FK to teams.id                 |
| created_at    | TIMESTAMPTZ | Creation timestamp             |
| updated_at    | TIMESTAMPTZ | Last update timestamp          |

**Indexes:**
- `idx_tickets_requester`: Index on requester_id
- `idx_tickets_assignee`: Index on assignee_id
- `idx_tickets_team`: Index on team_id
- `idx_tickets_status`: Index on status
- `idx_tickets_priority`: Index on priority

### comments
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| ticket_id     | UUID        | FK to tickets.id               |
| author_id     | UUID        | FK to profiles.id              |
| content       | TEXT        | Comment content                |
| is_internal   | BOOLEAN     | Internal note flag             |
| created_at    | TIMESTAMPTZ | Creation timestamp             |
| updated_at    | TIMESTAMPTZ | Last update timestamp          |

**Indexes:**
- `idx_comments_ticket`: Index on ticket_id
- `idx_comments_author`: Index on author_id

### attachments
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| ticket_id     | UUID        | FK to tickets.id               |
| comment_id    | UUID        | FK to comments.id              |
| filename      | TEXT        | Original filename              |
| file_url      | TEXT        | Storage URL                    |
| content_type  | TEXT        | MIME type                      |
| size          | INTEGER     | File size in bytes             |
| created_at    | TIMESTAMPTZ | Creation timestamp             |

**Indexes:**
- `idx_attachments_ticket`: Index on ticket_id
- `idx_attachments_comment`: Index on comment_id

## Sprint 3: Team Management & Assignment
Focus: Team organization and ticket routing

### teams
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| name          | TEXT        | Team name                      |
| description   | TEXT        | Team description               |
| settings      | JSONB       | Team settings and preferences  |
| created_at    | TIMESTAMPTZ | Creation timestamp             |
| updated_at    | TIMESTAMPTZ | Last update timestamp          |

**Indexes:**
- `idx_teams_name`: Index on name

### team_members
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| team_id       | UUID        | FK to teams.id                 |
| user_id       | UUID        | FK to profiles.id              |
| role          | TEXT        | 'leader', 'member'             |
| settings      | JSONB       | Member-specific settings       |
| joined_at     | TIMESTAMPTZ | Join timestamp                 |

**Indexes:**
- `idx_team_members_team`: Index on team_id
- `idx_team_members_user`: Index on user_id
- Unique constraint on (team_id, user_id)

## Relationships

### Sprint 1
- No relationships in initial sprint (just profiles)

### Sprint 2
- profiles → tickets (requester)
- profiles → tickets (assignee)
- tickets → comments (one-to-many)
- profiles → comments (author)
- tickets → attachments (one-to-many)
- comments → attachments (one-to-many)

### Sprint 3
- teams ↔ profiles (many-to-many via team_members)
- teams → tickets (one-to-many via team_id)
- profiles → tickets (assignee via assignee_id)

## Sprint 4: Custom Fields & Tags
Focus: Extensible ticket attributes and categorization

### custom_fields
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| name          | TEXT        | Field name                     |
| description   | TEXT        | Field description              |
| field_type    | TEXT        | 'text','number','date','list'  |
| is_required   | BOOLEAN     | Whether field is required      |
| options       | JSONB       | Field options for list type    |
| default_value | JSONB       | Default value for field        |
| created_at    | TIMESTAMPTZ | Creation timestamp             |
| updated_at    | TIMESTAMPTZ | Last update timestamp          |

**Indexes:**
- `idx_custom_fields_name`: Index on name
- `idx_custom_fields_type`: Index on field_type

### field_values
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| field_id      | UUID        | FK to custom_fields.id         |
| ticket_id     | UUID        | FK to tickets.id               |
| value         | JSONB       | Field value                    |
| created_at    | TIMESTAMPTZ | Creation timestamp             |
| updated_at    | TIMESTAMPTZ | Last update timestamp          |

**Indexes:**
- `idx_field_values_field`: Index on field_id
- `idx_field_values_ticket`: Index on ticket_id
- Unique constraint on (field_id, ticket_id)

### tags
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| name          | TEXT        | Tag name                       |
| description   | TEXT        | Tag description                |
| color         | TEXT        | Tag color (hex code)           |
| created_at    | TIMESTAMPTZ | Creation timestamp             |

**Indexes:**
- `idx_tags_name`: Index on name

### ticket_tags
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| ticket_id     | UUID        | FK to tickets.id               |
| tag_id        | UUID        | FK to tags.id                  |
| created_at    | TIMESTAMPTZ | Creation timestamp             |

**Indexes:**
- `idx_ticket_tags_ticket`: Index on ticket_id
- `idx_ticket_tags_tag`: Index on tag_id
- Unique constraint on (ticket_id, tag_id)

## Sprint 5: Knowledge Base
Focus: Self-service documentation system

### kb_articles
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| title         | TEXT        | Article title                  |
| content       | TEXT        | Article content                |
| status        | TEXT        | 'draft','published','archived' |
| author_id     | UUID        | FK to profiles.id              |
| is_internal   | BOOLEAN     | Internal article flag          |
| created_at    | TIMESTAMPTZ | Creation timestamp             |
| updated_at    | TIMESTAMPTZ | Last update timestamp          |

**Indexes:**
- `idx_kb_articles_title`: Index on title
- `idx_kb_articles_status`: Index on status
- `idx_kb_articles_author`: Index on author_id

### kb_categories
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| id            | UUID        | Primary key                    |
| name          | TEXT        | Category name                  |
| description   | TEXT        | Category description           |
| parent_id     | UUID        | FK to kb_categories.id         |
| created_at    | TIMESTAMPTZ | Creation timestamp             |

**Indexes:**
- `idx_kb_categories_name`: Index on name
- `idx_kb_categories_parent`: Index on parent_id

### article_categories
| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| article_id    | UUID        | FK to kb_articles.id           |
| category_id   | UUID        | FK to kb_categories.id         |
| created_at    | TIMESTAMPTZ | Creation timestamp             |

**Indexes:**
- `idx_article_categories_article`: Index on article_id
- `idx_article_categories_category`: Index on category_id
- Unique constraint on (article_id, category_id)

## Notes
- All timestamps are in UTC
- UUID is used for all IDs to support future scaling
- JSONB types are used for flexible storage of configuration and options
- Indexes are created based on expected query patterns
- All foreign keys have appropriate cascading rules
- RLS policies will be implemented for all tables
- Full-text search will be enabled where appropriate

## Relationships

### Sprint 4
- custom_fields → field_values (one-to-many)
- tickets → field_values (one-to-many)
- tickets ↔ tags (many-to-many via ticket_tags)

### Sprint 5
- profiles → kb_articles (author)
- kb_articles ↔ kb_categories (many-to-many via article_categories)
- kb_categories → kb_categories (self-referential for hierarchy)