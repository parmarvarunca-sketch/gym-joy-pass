import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[] | any;
}

interface SubscriptionPlansProps {
  userId: string;
}

export const SubscriptionPlans = ({ userId }: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      toast.error("Error loading plans");
      console.error(error);
    } else {
      const formattedPlans = data?.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string)
      })) || [];
      setPlans(formattedPlans);
    }
    setLoading(false);
  };

  const handleSubscribe = async (_planId: string, _durationMonths: number) => {
    toast.info("Checkout coming soon. Subscriptions must be created via secure payment flow.");
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading plans...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan, index) => (
        <Card
          key={plan.id}
          className={`relative ${
            index === 1 ? "border-2 border-primary shadow-xl" : ""
          }`}
        >
          {index === 1 && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-4xl font-bold text-foreground">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={index === 1 ? "default" : "outline"}
              onClick={() => handleSubscribe(plan.id, plan.duration_months)}
            >
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
