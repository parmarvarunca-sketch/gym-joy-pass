import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  user_id: string;
  user_email: string | null;
  display_name: string | null;
  signed_up_at: string;
  plan_name: string | null;
  plan_active: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch signup logs and subscriptions in parallel
      const [signupsRes, subsRes] = await Promise.all([
        supabase.from("signup_logs").select("*").order("signed_up_at", { ascending: false }),
        supabase.from("user_subscriptions").select("user_id, is_active, subscription_plans(name)"),
      ]);

      if (signupsRes.error) {
        toast.error("Failed to load signup data");
        setLoading(false);
        return;
      }

      // Build a map of user_id -> subscription info
      const subMap = new Map<string, { plan_name: string; is_active: boolean }>();
      if (subsRes.data) {
        for (const sub of subsRes.data) {
          const plan = sub.subscription_plans as any;
          // Keep the most recent / active one
          if (!subMap.has(sub.user_id) || sub.is_active) {
            subMap.set(sub.user_id, {
              plan_name: plan?.name || "Unknown",
              is_active: sub.is_active ?? false,
            });
          }
        }
      }

      const merged: UserRow[] = (signupsRes.data || []).map((log) => {
        const sub = subMap.get(log.user_id);
        return {
          id: log.id,
          user_id: log.user_id,
          user_email: log.user_email,
          display_name: log.display_name,
          signed_up_at: log.signed_up_at,
          plan_name: sub?.plan_name || null,
          plan_active: sub?.is_active ?? false,
        };
      });

      setUsers(merged);
      setLoading(false);
    };

    checkAdminAndLoad();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">You don't have admin privileges to view this page.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Registered Users</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total: {users.length} user{users.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No signups yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Signed Up</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, i) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{user.display_name || "—"}</TableCell>
                        <TableCell>{user.user_email || "—"}</TableCell>
                        <TableCell>
                          {user.plan_name ? (
                            <Badge variant={user.plan_active ? "default" : "secondary"}>
                              {user.plan_name} {user.plan_active ? "(Active)" : "(Expired)"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No plan</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.signed_up_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
