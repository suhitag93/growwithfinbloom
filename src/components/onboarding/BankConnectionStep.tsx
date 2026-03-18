import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft, Building2, Shield, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { usePlaid } from "@/hooks/usePlaid";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const BankConnectionStep = ({ data, update, onNext, onBack }: Props) => {
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const { startPlaidLink, loading, syncing } = usePlaid(() => {
    update({ connectedBank: true });
  });

  const handleSampleData = async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      const { error } = await supabase.functions.invoke("seed-personalized-data");
      if (error) throw error;
      update({ useSampleData: true });
      onNext();
    } catch {
      setSeedError("Something went wrong building your snapshot. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  // Success state after Plaid connects
  if (data.connectedBank) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-80px)]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-xl font-semibold text-foreground">Connect your accounts</h2>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 rounded-2xl bg-card border border-primary/20 space-y-3 w-full">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-foreground">Accounts connected successfully</p>
            <p className="text-sm text-muted-foreground">Your real transactions and balances are syncing.</p>
          </div>
        </div>

        <div className="pt-4 pb-safe">
          <Button variant="hero" size="lg" className="w-full" onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">How would you like to get started?</h2>
          <p className="text-sm text-muted-foreground mt-1">You can always connect your bank later from Settings.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {/* ── Option A: Plaid ──────────────────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-card border-2 border-primary/30 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-sage flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">Connect your bank</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                  Most personalized
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Sync real balances and transactions for the most accurate picture of your finances.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Read-only access", "256-bit encryption", "Never stores credentials"].map((f) => (
              <div key={f} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-light/60">
                <Shield className="w-3 h-3 text-primary shrink-0" />
                <span className="text-xs text-foreground">{f}</span>
              </div>
            ))}
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={startPlaidLink}
            disabled={loading || syncing}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Initializing…</>
            ) : syncing ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Syncing accounts…</>
            ) : (
              <><Building2 className="w-4 h-4 mr-2" />Connect with Plaid</>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Option B: Personalized snapshot ──────────────────────────── */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-foreground">Start with a personalized snapshot</span>
              <p className="text-sm text-muted-foreground mt-1">
                We'll build your dashboard from what you've already shared with us. No bank account needed to explore.
              </p>
            </div>
          </div>

          {seedError && (
            <p className="text-sm text-destructive">{seedError}</p>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleSampleData}
            disabled={seeding}
          >
            {seeding ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Building your snapshot…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Build my personalized snapshot</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BankConnectionStep;
