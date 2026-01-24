-- Create a secure sessions table to store API credentials server-side
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sid TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '8 hours')
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- No public access - only service role can access this table
-- This ensures credentials are never exposed to clients

-- Create index for faster lookups
CREATE INDEX idx_user_sessions_sid ON public.user_sessions(sid);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;