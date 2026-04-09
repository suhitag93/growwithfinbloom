import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GoalsDashboard from "@/components/settings/GoalsDashboard";
import GoalFormModal from "@/components/settings/GoalFormModal";
import { useGoals } from "@/hooks/useGoals";

const GoalsBucketsTab = () => {
  const { goals, loading, createGoal } = useGoals();
  const [showAdd, setShowAdd] = useState(false);

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Goals</h2>
          <p className="text-muted-foreground text-sm">Track your financial goals</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="shrink-0 gap-1.5">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      <GoalsDashboard />

      {goals.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🌱</span>
          <p className="text-muted-foreground text-sm mb-4">No goals yet. Let's plant your first one.</p>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add your first goal
          </Button>
        </div>
      )}

      <GoalFormModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        mode="create"
        onSubmit={async (form) => {
          await createGoal({
            goal_type: form.goal_type,
            title: form.title,
            description: null,
            target_amount: Number(form.target_amount),
            current_amount: Number(form.current_amount),
            monthly_contribution: form.monthly_contribution ? Number(form.monthly_contribution) : null,
            target_date: form.target_date || null,
            linked_account_id: form.linked_account_id || null,
            status: "active",
            coach_notes: null,
          });
        }}
      />
    </div>
  );
};

export default GoalsBucketsTab;
