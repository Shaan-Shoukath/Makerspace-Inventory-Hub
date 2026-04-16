import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  ShieldCheck,
  ShieldX,
  Package,
  ChevronRight,
  RotateCcw,
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

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{
    active: boolean;
    name: string;
    avatar: string;
  } | null>(null);

  const selectedHolding = holdings.find((h) => h.component === selectedComponent);

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
      const result = await validateUserActive(userHubId.trim());
      setVerified(result);

      if (!result.active) {
        toast.error(
          `${result.name}, you are not checked in at the Hub. Please check in first.`,
        );
        return;
      }

      toast.success(`Welcome, ${result.name}! You're checked in.`);

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
      toast.error(err instanceof Error ? err.message : "Verification failed.");
      setVerified(null);
    } finally {
      setVerifying(false);
      setLooking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-white/35">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-white/60 transition-colors"
          >
            <Package className="h-3.5 w-3.5" />
            Inventory
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/60 font-medium">Return</span>
        </div>

        {/* Hero header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl glass-emerald p-6">
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-success/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 ring-1 ring-success/25 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
              <RotateCcw className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-handwritten text-lg text-success/80 mb-0.5">Keep the cycle going</p>
              <h1 className="text-2xl font-extrabold text-white">Return a Component</h1>
              <p className="mt-1 text-sm text-white/45">
                Done building? Return components so others can tinker too.
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6 space-y-5">

          {/* Step 1 — Verify Hub ID */}
          <div className="space-y-2">
            <Label
              htmlFor="hubIdReturn"
              className="text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Step 1 — Your Hub ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="hubIdReturn"
                placeholder="e.g. dev_devadath"
                value={userHubId}
                onChange={(e) => setUserHubId(e.target.value)}
                maxLength={30}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus-visible:ring-success/40 focus-visible:border-success/30"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyAndLookup()}
              />
              <Button
                type="button"
                onClick={handleVerifyAndLookup}
                disabled={verifying || looking || !userHubId.trim()}
                className="shrink-0 bg-success/15 text-success border border-success/25 hover:bg-success/25 hover:border-success/35 disabled:opacity-40"
              >
                {verifying || looking ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-1.5 h-4 w-4" />
                )}
                {verifying ? "Verifying…" : looking ? "Looking up…" : "Verify & Lookup"}
              </Button>
            </div>
          </div>

          {/* Verification status badge */}
          {verified && (
            <div
              className={`flex items-center gap-3 rounded-xl p-3.5 text-sm ${
                isActive
                  ? "bg-success/8 border border-success/20 text-success"
                  : "bg-destructive/8 border border-destructive/20 text-destructive"
              }`}
            >
              {verified.avatar && (
                <img
                  src={verified.avatar}
                  alt={verified.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                />
              )}
              {isActive ? (
                <ShieldCheck className="h-4 w-4 shrink-0" />
              ) : (
                <ShieldX className="h-4 w-4 shrink-0" />
              )}
              <span className="leading-snug">
                {isActive ? (
                  <>
                    <strong className="font-semibold">{verified.name}</strong>{" "}
                    — checked in and verified!
                  </>
                ) : (
                  <>
                    <strong className="font-semibold">{verified.name}</strong>{" "}
                    — not checked in. Please check in at the Hub first.
                  </>
                )}
              </span>
            </div>
          )}

          {/* Step 2 — Holdings + return form */}
          {isActive && looked && holdings.length > 0 && (
            <>
              {/* Current holdings */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Step 2 — Your Active Borrows
                </p>
                <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-3 space-y-1.5">
                  {holdings.map((h) => (
                    <div
                      key={h.component}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/75">{h.component}</span>
                      <span className="font-mono text-xs text-white/35 tabular-nums">
                        ×{h.outstanding}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Step 3 — Return Details
                </p>

                {/* Component to return */}
                <div className="space-y-2">
                  <Label className="text-sm text-white/70">Component to Return</Label>
                  <Select
                    value={selectedComponent}
                    onValueChange={(val) => {
                      setSelectedComponent(val);
                      setQuantity(1);
                    }}
                  >
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white focus:ring-success/40 focus:border-success/30">
                      <SelectValue placeholder="Select component to return" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-white/[0.08] text-white">
                      {holdings.map((h) => (
                        <SelectItem
                          key={h.component}
                          value={h.component}
                          className="focus:bg-white/[0.06] focus:text-white"
                        >
                          {h.component} (×{h.outstanding})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="returnQty" className="text-sm text-white/70">
                    Quantity to Return
                  </Label>
                  <Input
                    id="returnQty"
                    type="number"
                    min={1}
                    max={selectedHolding?.outstanding || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-success/40 focus-visible:border-success/30"
                  />
                  {selectedHolding && (
                    <p className="text-xs text-white/35">
                      You have <span className="font-mono">{selectedHolding.outstanding}</span> borrowed
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-success/15 text-success border border-success/25 hover:bg-success/25 hover:border-success/35 font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] disabled:opacity-40 mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Returning…
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Return Component
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Empty borrows state */}
          {isActive && looked && holdings.length === 0 && (
            <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-5 text-center">
              <RotateCcw className="mx-auto mb-2 h-7 w-7 text-white/20" />
              <p className="text-sm text-white/45">
                No active borrows found for{" "}
                <span className="font-mono font-semibold text-white/60">{userHubId}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnPage;
