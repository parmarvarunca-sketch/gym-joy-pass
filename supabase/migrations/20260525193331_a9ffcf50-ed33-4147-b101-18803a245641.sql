
-- 1. Remove privilege escalation on user_subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;

-- 2. Add explicit UPDATE policy on progress_logs
CREATE POLICY "Users can update own logs"
ON public.progress_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Explicit deny policies for signup_logs writes (SECURITY DEFINER trigger bypasses RLS)
CREATE POLICY "No one can insert signup logs"
ON public.signup_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No one can update signup logs"
ON public.signup_logs
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No one can delete signup logs"
ON public.signup_logs
FOR DELETE
TO authenticated
USING (false);

-- 4. Revoke EXECUTE on SECURITY DEFINER functions from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.log_new_signup() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
-- has_role needs to remain callable by authenticated users for use in RLS policies via the policy itself,
-- but RLS policy evaluation uses the function owner's privileges. Keep authenticated execute for has_role
-- since it's used in client-evaluated policies and queries.
