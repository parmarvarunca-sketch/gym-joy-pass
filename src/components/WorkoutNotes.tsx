import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkoutNotesProps {
  userId: string;
}

export const WorkoutNotes = ({ userId }: WorkoutNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("workout_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setNotes(data || []);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (editingNote) {
      const { error } = await supabase
        .from("workout_notes")
        .update({ title: title.trim(), content: content.trim() || null, updated_at: new Date().toISOString() })
        .eq("id", editingNote.id);
      if (error) toast.error("Error updating note");
      else toast.success("Note updated!");
    } else {
      const { error } = await supabase
        .from("workout_notes")
        .insert({ user_id: userId, title: title.trim(), content: content.trim() || null });
      if (error) toast.error("Error saving note");
      else toast.success("Note saved!");
    }

    setTitle("");
    setContent("");
    setEditingNote(null);
    setOpen(false);
    fetchNotes();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("workout_notes").delete().eq("id", id);
    if (error) toast.error("Error deleting note");
    else { toast.success("Note deleted"); fetchNotes(); }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingNote(null);
      setTitle("");
      setContent("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary" />
              Workout Notes
            </CardTitle>
            <CardDescription>Keep track of your thoughts and goals</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Note</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "New Note"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leg day routine" maxLength={100} />
                </div>
                <div className="space-y-1">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Notes about your workout..." rows={4} maxLength={1000} />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingNote ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{note.title}</h4>
                    {note.content && <p className="mt-1 text-sm text-muted-foreground">{note.content}</p>}
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <StickyNote className="mx-auto mb-2 h-8 w-8" />
            <p>No notes yet. Start jotting down your workout thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
