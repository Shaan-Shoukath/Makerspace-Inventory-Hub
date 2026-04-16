import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldX,
  Package,
  ChevronRight,
  Wrench,
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
  fetchCases,
  fetchComponentsByCase,
  borrowComponent,
  validateUserActive,
} from "@/lib/api";
import { toast } from "sonner";

const BorrowPage = () => {
  const [cases, setCases] = useState<string[]>([]);
  const [components, setComponents] = useState<string[]>([]);
  const [userHubId, setUserHubId] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{
    active: boolean;
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    setLoadingCases(true);
    fetchCases()
      .then(setCases)
      .catch(() => toast.error("Failed to load cases."))
      .finally(() => setLoadingCases(false));
  }, []);

  useEffect(() => {
    if (selectedCase) {
      setLoadingComponents(true);
      setSelectedComponent("");
      setComponents([]);
      fetchComponentsByCase(selectedCase)
        .then(setComponents)
        .catch(() => toast.error("Failed to load components."))
        .finally(() => setLoadingComponents(false));
    } else {
      setComponents([]);
      setSelectedComponent("");
    }
  }, [selectedCase]);

  useEffect(() => {
    setVerified(null);
  }, [userHubId]);

  const handleVerify = async () => {
    if (!userHubId.trim()) {
      toast.error("Please enter your Hub ID.");
      return;
    }
    setVerifying(true);
    try {
      const result = await validateUserActive(userHubId.trim());
      setVerified(result);
      if (result.active) {
        toast.success(`Welcome, ${result.name}! You're checked in.`);
      } else {
        toast.error(
          `${result.name}, you are not checked in at the Hub. Please check in first.`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
      setVerified(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified?.active) {
      toast.error("Please verify your Hub ID first.");
      return;
    }
    if (!selectedCase) {
      toast.error("Please select a case.");
      return;
    }
    if (!selectedComponent) {
      toast.error("Please select a component.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Quantity must be a positive integer.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await borrowComponent(
        userHubId.trim(),
        selectedCase,
        selectedComponent,
        quantity,
      );
      if (result.success) {
        toast.success(result.message, {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        setUserHubId("");
        setSelectedCase("");
        setSelectedComponent("");
        setQuantity(1);
        setVerified(null);
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
          <span className="text-white/60 font-medium">Borrow</span>
        </div>

        {/* Hero header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl glass-amber p-6">
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 ring-1 ring-secondary/25 shadow-[0_0_20px_rgba(245,160,32,0.15)]">
              <Wrench className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-handwritten text-lg text-secondary/80 mb-0.5">Maker vibes</p>
              <h1 className="text-2xl font-extrabold text-white">Borrow a Component</h1>
              <p className="mt-1 text-sm text-white/45">
                Grab what you need to tinker, experiment, and create. Happy making!
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6 space-y-5">

          {/* Step 1 — Verify Hub ID */}
          <div className="space-y-2">
            <Label
              htmlFor="hubId"
              className="text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Step 1 — Your Hub ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="hubId"
                placeholder="e.g. dev_devadath"
                value={userHubId}
                onChange={(e) => setUserHubId(e.target.value)}
                maxLength={30}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus-visible:ring-secondary/40 focus-visible:border-secondary/30"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <Button
                type="button"
                onClick={handleVerify}
                disabled={verifying || !userHubId.trim()}
                className="shrink-0 bg-secondary/15 text-secondary border border-secondary/25 hover:bg-secondary/25 hover:border-secondary/35 disabled:opacity-40"
              >
                {verifying ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                )}
                Verify
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
                    — checked in and ready to borrow!
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

          {/* Step 2 — Borrow form (shown only when active) */}
          {isActive && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Step 2 — Select Component
                </p>
              </div>

              {/* Case */}
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Case</Label>
                <Select
                  value={selectedCase}
                  onValueChange={setSelectedCase}
                  disabled={loadingCases}
                >
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white focus:ring-secondary/40 focus:border-secondary/30">
                    <SelectValue
                      placeholder={
                        loadingCases ? "Loading cases…" : "Select a case"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/[0.08] text-white">
                    {cases.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="focus:bg-white/[0.06] focus:text-white"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Component */}
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Component</Label>
                <Select
                  value={selectedComponent}
                  onValueChange={setSelectedComponent}
                  disabled={!selectedCase || loadingComponents}
                >
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white focus:ring-secondary/40 focus:border-secondary/30">
                    <SelectValue
                      placeholder={
                        !selectedCase
                          ? "Select a case first"
                          : loadingComponents
                            ? "Loading components…"
                            : "Select component"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/[0.08] text-white">
                    {components.map((name) => (
                      <SelectItem
                        key={name}
                        value={name}
                        className="focus:bg-white/[0.06] focus:text-white"
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="qty" className="text-sm text-white/70">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-secondary/40 focus-visible:border-secondary/30"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-secondary/15 text-secondary border border-secondary/25 hover:bg-secondary/25 hover:border-secondary/35 font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,160,32,0.15)] disabled:opacity-40 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Borrowing…
                  </>
                ) : (
                  <>
                    <Wrench className="mr-2 h-4 w-4" />
                    Borrow Component
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowPage;
