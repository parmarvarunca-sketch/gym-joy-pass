
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all plans"
ON public.subscription_plans FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
