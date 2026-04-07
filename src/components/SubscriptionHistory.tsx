import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

interface SubscriptionRecord {
  id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  subscription_plans: {
    name: string;
    price: number;
  };
}

interface SubscriptionHistoryProps {
  userId: string;
}

export const SubscriptionHistory = ({ userId }: SubscriptionHistoryProps) => {
  const [records, setRecords] = useState<SubscriptionRecord[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id, start_date, end_date, is_active, subscription_plans(name, price)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) setRecords(data as unknown as SubscriptionRecord[]);
    };
    fetchHistory();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Subscription History
        </CardTitle>
        <CardDescription>Your past and current plans</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <span className="font-medium text-foreground">{record.subscription_plans.name}</span>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(record.start_date).toLocaleDateString()} — {new Date(record.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">${record.subscription_plans.price}/mo</span>
                  <Badge variant={record.is_active ? "default" : "secondary"}>
                    {record.is_active ? "Active" : "Expired"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <History className="mx-auto mb-2 h-8 w-8" />
            <p>No subscription history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
