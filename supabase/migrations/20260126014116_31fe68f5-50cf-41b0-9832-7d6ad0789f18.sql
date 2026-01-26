-- RLS policies for user_sessions table
-- This table stores server-side session data (api_key, api_secret) and should only be accessible via service role

-- Policy: Deny all direct access from clients (only service role can access)
-- Since the edge functions use service role key, they bypass RLS
-- We add restrictive policies to prevent any client-side access

-- Allow SELECT only for sessions matching the user's own sid (for potential future use)
CREATE POLICY "Users cannot read session data directly"
ON public.user_sessions
FOR SELECT
USING (false);

-- Deny INSERT from clients (only service role via edge functions)
CREATE POLICY "Users cannot insert sessions directly"
ON public.user_sessions
FOR INSERT
WITH CHECK (false);

-- Deny UPDATE from clients
CREATE POLICY "Users cannot update sessions directly"
ON public.user_sessions
FOR UPDATE
USING (false);

-- Deny DELETE from clients
CREATE POLICY "Users cannot delete sessions directly"
ON public.user_sessions
FOR DELETE
USING (false);