import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GoalCoach from "@/components/settings/GoalCoach";
import GoalsDashboard from "@/components/settings/GoalsDashboard";
import { useGoals } from "@/hooks/useGoals";

const GoalsBucketsTab = () => {
  const [showCoach, setShowCoach] = useState(false);
  const { goals, loading } = useGoals();

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Goals</h2>
          <p className="text-muted-foreground text-sm">AI-coached goals tailored to your finances</p>
        </div>
        {!showCoach && (
          <Button size="sm" onClick={() => setShowCoach(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Goal
          </Button>
        )}
      </div>

      {showCoach && (
        <GoalCoach onComplete={() => setShowCoach(false)} />
      )}

      <GoalsDashboard />

      {!showCoach && goals.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🌱</span>
          <p className="text-muted-foreground text-sm mb-4">No goals yet. Let's create your first one!</p>
          <Button onClick={() => setShowCoach(true)}>Start with AI Coach</Button>
        </div>
      )}
    </div>
  );
};

export default GoalsBucketsTab;
