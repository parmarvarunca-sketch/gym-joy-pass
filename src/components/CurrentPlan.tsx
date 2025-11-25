import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Crown } from "lucide-react";
import { toast } from "sonner";

interface CurrentPlanProps {
  userId: string;
}

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  subscription_plans: {
    name: string;
    description: string;
    price: number;
    features: string[] | any;
  };
}

export const CurrentPlan = ({ userId }: CurrentPlanProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSubscription();
  }, [userId]);

  const fetchCurrentSubscription = async () => {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        subscription_plans (
          name,
          description,
          price,
          features
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error(error);
      toast.error("Error loading your subscription");
    } else if (data) {
      const formattedData = {
        ...data,
        subscription_plans: {
          ...data.subscription_plans,
          features: Array.isArray(data.subscription_plans.features) 
            ? data.subscription_plans.features 
            : JSON.parse(data.subscription_plans.features as string)
        }
      };
      setSubscription(formattedData as Subscription);
    }
    setLoading(false);
  };

  if (loading) {
    return null;
  }

  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-muted-foreground" />
            No Active Plan
          </CardTitle>
          <CardDescription>
            Choose a membership plan below to get started on your fitness journey
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const endDate = new Date(subscription.end_date);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-6 w-6 text-primary" />
              {subscription.subscription_plans.name} Plan
            </CardTitle>
            <CardDescription className="mt-2">
              {subscription.subscription_plans.description}
            </CardDescription>
          </div>
          <Badge variant="default">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {daysRemaining} days remaining • Renews on {endDate.toLocaleDateString()}
          </span>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-foreground">Your Benefits:</div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {subscription.subscription_plans.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
