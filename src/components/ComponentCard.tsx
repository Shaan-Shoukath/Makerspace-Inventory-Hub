import { Component } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Cpu, Radio, Cog, Cable, Monitor, Zap, CircuitBoard, Box } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  sensor: Radio,
  motor: Cog,
  module: Cpu,
  wire: Cable,
  display: Monitor,
  power: Zap,
  board: CircuitBoard,
  other: Box,
};

const ComponentCard = ({ component }: { component: Component }) => {
  const Icon = categoryIcons[component.category] || Box;
  const stockRatio = component.availableStock / component.totalStock;
  const stockColor =
    stockRatio === 0
      ? "text-destructive"
      : stockRatio < 0.3
      ? "text-secondary"
      : "text-success";

  return (
    <div className="card-hover group rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight text-card-foreground">
              {component.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{component.case}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 font-mono text-xs ${stockColor} border-current/20`}
        >
          {component.availableStock}/{component.totalStock}
        </Badge>
      </div>
    </div>
  );
};

export default ComponentCard;
