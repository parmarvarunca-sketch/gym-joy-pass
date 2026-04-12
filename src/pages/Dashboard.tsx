import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Loader2, UserCircle, ArrowLeft } from "lucide-react";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { CurrentPlan } from "@/components/CurrentPlan";
import { DailyTip } from "@/components/DailyTip";
import { ProgressTracker } from "@/components/ProgressTracker";
import { WorkoutNotes } from "@/components/WorkoutNotes";
import { SubscriptionHistory } from "@/components/SubscriptionHistory";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Error signing out");
    else navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">FitLife Gym</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <UserCircle className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Daily Tip + Current Plan */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DailyTip />
          <CurrentPlan userId={user.id} />
        </div>

        {/* Progress Tracking */}
        <ProgressTracker userId={user.id} />

        {/* Notes + History */}
        <div className="grid gap-6 lg:grid-cols-2">
          <WorkoutNotes userId={user.id} />
          <SubscriptionHistory userId={user.id} />
        </div>

        {/* All Plans Section */}
        <div>
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">Choose Your Plan</h2>
            <p className="text-muted-foreground">
              Select the membership that best fits your fitness journey
            </p>
          </div>
          <SubscriptionPlans userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
