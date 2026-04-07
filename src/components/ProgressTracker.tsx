import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProgressLog {
  id: string;
  logged_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_percentage: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  notes: string | null;
}

interface ProgressTrackerProps {
  userId: string;
}

export const ProgressTracker = ({ userId }: ProgressTrackerProps) => {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    weight_kg: "",
    height_cm: "",
    body_fat_percentage: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    notes: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setLogs(data || []);
    }
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("progress_logs").insert({
      user_id: userId,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      body_fat_percentage: form.body_fat_percentage ? parseFloat(form.body_fat_percentage) : null,
      chest_cm: form.chest_cm ? parseFloat(form.chest_cm) : null,
      waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
      hips_cm: form.hips_cm ? parseFloat(form.hips_cm) : null,
      notes: form.notes || null,
    });

    if (error) {
      toast.error("Error saving progress");
      console.error(error);
    } else {
      toast.success("Progress logged!");
      setForm({ weight_kg: "", height_cm: "", body_fat_percentage: "", chest_cm: "", waist_cm: "", hips_cm: "", notes: "" });
      setOpen(false);
      fetchLogs();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("progress_logs").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting log");
    } else {
      toast.success("Log deleted");
      fetchLogs();
    }
  };

  const chartData = logs.map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: log.weight_kg,
    bodyFat: log.body_fat_percentage,
    waist: log.waist_cm,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Tracking
            </CardTitle>
            <CardDescription>Track your body metrics over time</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Log Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Today's Progress</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="75" />
                </div>
                <div className="space-y-1">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="175" />
                </div>
                <div className="space-y-1">
                  <Label>Body Fat %</Label>
                  <Input type="number" value={form.body_fat_percentage} onChange={(e) => setForm({ ...form, body_fat_percentage: e.target.value })} placeholder="20" />
                </div>
                <div className="space-y-1">
                  <Label>Waist (cm)</Label>
                  <Input type="number" value={form.waist_cm} onChange={(e) => setForm({ ...form, waist_cm: e.target.value })} placeholder="80" />
                </div>
                <div className="space-y-1">
                  <Label>Chest (cm)</Label>
                  <Input type="number" value={form.chest_cm} onChange={(e) => setForm({ ...form, chest_cm: e.target.value })} placeholder="95" />
                </div>
                <div className="space-y-1">
                  <Label>Hips (cm)</Label>
                  <Input type="number" value={form.hips_cm} onChange={(e) => setForm({ ...form, hips_cm: e.target.value })} placeholder="90" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Feeling great today!" maxLength={200} />
              </div>
              <Button onClick={handleSubmit} className="w-full">Save Progress</Button>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} name="Weight (kg)" dot={{ fill: 'hsl(var(--primary))' }} />
                  <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--accent))" strokeWidth={2} name="Body Fat %" dot={{ fill: 'hsl(var(--accent))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Recent Logs</h4>
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex items-center gap-4">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{new Date(log.logged_at).toLocaleDateString()}</span>
                    {log.weight_kg && <span>{log.weight_kg} kg</span>}
                    {log.body_fat_percentage && <span>{log.body_fat_percentage}% BF</span>}
                    {log.waist_cm && <span>{log.waist_cm} cm waist</span>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Activity className="mx-auto mb-2 h-8 w-8" />
            <p>No progress logged yet. Start tracking your journey!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
