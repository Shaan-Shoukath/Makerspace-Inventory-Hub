import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchUserHoldings,
  returnComponent,
  validateUserActive,
  Holding,
} from "@/lib/api";
import { toast } from "sonner";

const ReturnPage = () => {
  const [userHubId, setUserHubId] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [looking, setLooking] = useState(false);
  const [looked, setLooked] = useState(false);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{
    active: boolean;
    name: string;
    avatar: string;
  } | null>(null);

  const selectedHolding = holdings.find(
    (h) => h.component === selectedComponent,
  );

  // Reset verification and holdings when Hub ID changes
  useEffect(() => {
    setVerified(null);
    setLooked(false);
    setHoldings([]);
    setSelectedComponent("");
  }, [userHubId]);

  const handleVerifyAndLookup = async () => {
    if (!userHubId.trim()) {
      toast.error("Enter your Hub ID first.");
      return;
    }

    setVerifying(true);
    try {
      // Step 1: Verify the user is checked in
      const result = await validateUserActive(userHubId.trim());
      setVerified(result);

      if (!result.active) {
        toast.error(
          `${result.name}, you are not checked in at the Hub. Please check in first.`,
        );
        return;
      }

      toast.success(`Welcome, ${result.name}! You're checked in.`);

      // Step 2: If active, also fetch their holdings
      setLooking(true);
      const data = await fetchUserHoldings(userHubId.trim());
      setHoldings(data);
      setSelectedComponent("");
      setQuantity(1);
      setLooked(true);
      if (data.length === 0) {
        toast.info("No active borrows found for this Hub ID.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed.";
      toast.error(message);
      setVerified(null);
    } finally {
      setVerifying(false);
      setLooking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Must be verified and active
    if (!verified?.active) {
      toast.error("Please verify your Hub ID first.");
      return;
    }
    if (!selectedComponent) {
      toast.error("Please select a component to return.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Quantity must be a positive integer.");
      return;
    }
    if (selectedHolding && quantity > selectedHolding.outstanding) {
      toast.error(`You only have ${selectedHolding.outstanding} borrowed.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await returnComponent(
        userHubId.trim(),
        selectedComponent,
        quantity,
      );

      if (result.success) {
        toast.success(result.message, {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        // Refresh holdings
        const data = await fetchUserHoldings(userHubId.trim());
        setHoldings(data);
        setSelectedComponent("");
        setQuantity(1);
      } else {
        toast.error(result.message, {
          icon: <AlertCircle className="h-4 w-4" />,
        });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isActive = verified?.active === true;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-success/10 via-accent to-primary/5 p-6 border border-success/10">
          <p className="text-sm font-handwritten text-success text-lg mb-1">
            Keep the cycle going
          </p>
          <h1 className="text-2xl font-extrabold text-foreground">
            Return Component
          </h1>
          <p className="text-muted-foreground mt-1">
            Done building? Return components so others can tinker too.
          </p>
        </div>

        <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
          {/* Hub ID + Verify */}
          <div className="space-y-2">
            <Label htmlFor="hubIdReturn">Your Hub ID</Label>
            <div className="flex gap-2">
              <Input
                id="hubIdReturn"
                placeholder="e.g. dev_devadath"
                value={userHubId}
                onChange={(e) => setUserHubId(e.target.value)}
                maxLength={30}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVerifyAndLookup}
                className="shrink-0"
                disabled={verifying || looking || !userHubId.trim()}
              >
                {verifying || looking ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-1 h-4 w-4" />
                )}
                Verify & Lookup
              </Button>
            </div>
          </div>

          {/* Verification status */}
          {verified && (
            <div
              className={`flex items-center gap-3 rounded-lg p-3 text-sm ${
                isActive
                  ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              }`}
            >
              {verified.avatar && (
                <img
                  src={verified.avatar}
                  alt={verified.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              {isActive ? (
                <ShieldCheck className="h-4 w-4 shrink-0" />
              ) : (
                <ShieldX className="h-4 w-4 shrink-0" />
              )}
              <span>
                {isActive ? (
                  <>
                    <strong>{verified.name}</strong> — checked in and verified!
                  </>
                ) : (
                  <>
                    <strong>{verified.name}</strong> — not checked in. Please
                    check in at the Hub first.
                  </>
                )}
              </span>
            </div>
          )}

          {/* Holdings list — only shown when user is verified active */}
          {isActive && looked && holdings.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Your Current Holdings
                </Label>
                <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                  {holdings.map((h) => (
                    <div
                      key={h.component}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-card-foreground">
                        {h.component}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        x{h.outstanding}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Component */}
                <div className="space-y-2">
                  <Label>Component to Return</Label>
                  <Select
                    value={selectedComponent}
                    onValueChange={(val) => {
                      setSelectedComponent(val);
                      setQuantity(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select component to return" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdings.map((h) => (
                        <SelectItem key={h.component} value={h.component}>
                          {h.component} (x{h.outstanding})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="returnQty">Quantity to Return</Label>
                  <Input
                    id="returnQty"
                    type="number"
                    min={1}
                    max={selectedHolding?.outstanding || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  {selectedHolding && (
                    <p className="text-xs text-muted-foreground">
                      You have {selectedHolding.outstanding} borrowed
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-success text-success-foreground hover:bg-success/90"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Returning...
                    </>
                  ) : (
                    "Return Component"
                  )}
                </Button>
              </form>
            </>
          )}

          {isActive && looked && holdings.length === 0 && (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              No active borrows found for <strong>{userHubId}</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnPage;
