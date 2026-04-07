import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DailyTip = () => {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTip = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-tip");
      if (error) throw error;
      setTip(data.tip || "Stay active and consistent! 💪");
    } catch (e) {
      console.error(e);
      setTip("Drink at least 8 glasses of water today and stretch for 10 minutes! 💧");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Daily Fitness Tip
          </span>
          <Button variant="ghost" size="icon" onClick={fetchTip} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Getting your tip...
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">{tip}</p>
        )}
      </CardContent>
    </Card>
  );
};
