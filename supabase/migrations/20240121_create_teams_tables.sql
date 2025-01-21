-- Create team_member_role enum
CREATE TYPE team_member_role AS ENUM ('leader', 'member');

-- Create teams table
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role team_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Add RLS policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by authenticated users"
    ON teams FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Teams can be created by authenticated users"
    ON teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Teams can be updated by team leaders and workplace admins"
    ON teams FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = id
            AND tm.user_id = auth.uid()
            AND tm.role = 'leader'
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Teams can be deleted by team leaders and workplace admins"
    ON teams FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = id
            AND tm.user_id = auth.uid()
            AND tm.role = 'leader'
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Add RLS policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are viewable by authenticated users"
    ON team_members FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Team members can be added by team leaders and workplace admins"
    ON team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'leader'
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Team members can be updated by team leaders and workplace admins"
    ON team_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'leader'
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Team members can be deleted by team leaders and workplace admins"
    ON team_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'leader'
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Add updated_at trigger for teams
CREATE TRIGGER set_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Agents and admins can view all tickets
CREATE POLICY "Tickets are viewable by agents and admins"
    ON tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'agent' OR p.role = 'admin')
        )
    );

-- Customers can only view their own tickets
CREATE POLICY "Customers can view their own tickets"
    ON tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'customer'
            AND requester_id = auth.uid()
        )
    );

-- Agents and admins can create tickets
CREATE POLICY "Tickets can be created by agents and admins"
    ON tickets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'agent' OR p.role = 'admin')
        )
    );

-- Customers can create their own tickets
CREATE POLICY "Customers can create their own tickets"
    ON tickets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'customer'
            AND requester_id = auth.uid()
        )
    );

-- Agents and admins can update tickets
CREATE POLICY "Tickets can be updated by agents and admins"
    ON tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'agent' OR p.role = 'admin')
        )
    );

-- Customers can update their own tickets' descriptions
CREATE POLICY "Customers can update their own tickets"
    ON tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'customer'
            AND requester_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Only allow updating the description field
        (OLD.description IS DISTINCT FROM NEW.description)
        AND (
            OLD.subject = NEW.subject
            AND OLD.status = NEW.status
            AND OLD.priority = NEW.priority
            AND OLD.category = NEW.category
            AND OLD.requester_id = NEW.requester_id
            AND OLD.assignee_id = NEW.assignee_id
            AND OLD.team_id = NEW.team_id
        )
    );

-- Only admins can delete tickets
CREATE POLICY "Only admins can delete tickets"
    ON tickets FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    ); 