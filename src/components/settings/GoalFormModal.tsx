import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { Goal } from "@/hooks/useGoals";

const GOAL_TYPES = [
  { id: "emergency_fund", emoji: "🛡️", label: "Emergency Fund" },
  { id: "debt_payoff", emoji: "💳", label: "Debt Payoff" },
  { id: "investment", emoji: "📈", label: "Investment" },
  { id: "savings", emoji: "🌿", label: "Savings" },
  { id: "home", emoji: "🏡", label: "Home" },
  { id: "education", emoji: "🎓", label: "Education" },
  { id: "other", emoji: "✨", label: "Other" },
];

interface GoalFormData {
  title: string;
  goal_type: string;
  target_amount: string;
  current_amount: string;
  monthly_contribution: string;
  target_date: string;
  linked_account_id: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  initialData?: Goal | null;
  mode: "create" | "edit";
}

const GoalFormModal = ({ open, onClose, onSubmit, initialData, mode }: Props) => {
  const { accounts } = useAccounts();
  const [submitting, setSubmitting] = useState(false);

  const emptyForm: GoalFormData = {
    title: "",
    goal_type: "savings",
    target_amount: "",
    current_amount: "0",
    monthly_contribution: "",
    target_date: "",
    linked_account_id: "",
  };

  const [form, setForm] = useState<GoalFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          title: initialData.title,
          goal_type: initialData.goal_type,
          target_amount: String(initialData.target_amount),
          current_amount: String(initialData.current_amount),
          monthly_contribution: initialData.monthly_contribution ? String(initialData.monthly_contribution) : "",
          target_date: initialData.target_date ? initialData.target_date.slice(0, 10) : "",
          linked_account_id: initialData.linked_account_id || "",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, mode, initialData]);

  const set = (key: keyof GoalFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.title.trim().length > 0 && Number(form.target_amount) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = GOAL_TYPES.find((t) => t.id === form.goal_type);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {mode === "create" ? "Add a Goal 🌱" : "Edit Goal"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Goal type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Goal type</Label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("goal_type", t.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
                    form.goal_type === t.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border/50 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="leading-tight text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-title" className="text-xs text-muted-foreground">Goal name</Label>
            <Input
              id="goal-title"
              placeholder={`e.g. ${selectedType?.emoji} ${selectedType?.label}`}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Target + Current */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-target" className="text-xs text-muted-foreground">Target amount ($)</Label>
              <Input
                id="goal-target"
                type="number"
                placeholder="5000"
                min="1"
                value={form.target_amount}
                onChange={(e) => set("target_amount", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-current" className="text-xs text-muted-foreground">Current amount ($)</Label>
              <Input
                id="goal-current"
                type="number"
                placeholder="0"
                min="0"
                value={form.current_amount}
                onChange={(e) => set("current_amount", e.target.value)}
              />
            </div>
          </div>

          {/* Monthly + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-monthly" className="text-xs text-muted-foreground">Monthly contribution ($)</Label>
              <Input
                id="goal-monthly"
                type="number"
                placeholder="200"
                min="0"
                value={form.monthly_contribution}
                onChange={(e) => set("monthly_contribution", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-date" className="text-xs text-muted-foreground">Target date</Label>
              <Input
                id="goal-date"
                type="date"
                value={form.target_date}
                onChange={(e) => set("target_date", e.target.value)}
              />
            </div>
          </div>

          {/* Linked account */}
          {accounts.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Link an account (optional)</Label>
              <Select
                value={form.linked_account_id || "_none"}
                onValueChange={(v) => set("linked_account_id", v === "_none" ? "" : v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="No account linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">No account</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nickname} — ${a.balance.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!isValid || submitting}>
              {submitting ? "Saving…" : mode === "create" ? "Create goal" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalFormModal;
