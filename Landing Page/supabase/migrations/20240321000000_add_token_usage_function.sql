-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.update_token_usage;

-- Enable real-time for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime for the users table
alter table users replica all;

-- Add subscription-related columns to users table
alter table users
add column if not exists subscription_status text default 'free',
add column if not exists subscription_id text,
add column if not exists subscription_end_date timestamp with time zone;

-- Create function to update token usage
CREATE OR REPLACE FUNCTION public.update_token_usage(
    p_user_id UUID,
    p_action TEXT,
    p_tokens INTEGER
)
RETURNS void AS $$
DECLARE
    current_usage INTEGER;
    new_usage INTEGER;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Get current token usage
    SELECT COALESCE(token_usage, 0) INTO current_usage
    FROM public.users
    WHERE id = p_user_id;

    -- Calculate new usage based on action
    IF p_action = 'add' THEN
        new_usage := current_usage + p_tokens;
    ELSIF p_action = 'subtract' THEN
        new_usage := GREATEST(current_usage - p_tokens, 0);
    ELSE
        new_usage := p_tokens;
    END IF;

    -- Update token usage
    UPDATE public.users
    SET token_usage = new_usage
    WHERE id = p_user_id;

    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update token usage';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_token_usage TO authenticated;

-- Grant usage on the users table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated; 