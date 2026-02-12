import { useEffect, useState } from "react";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchComponents, Component } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const InventoryPage = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComponents().then((data) => {
      setComponents(data);
      setLoading(false);
    });
  }, []);

  const filtered = components.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.case.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Available Components</h1>
        </div>
        <p className="text-muted-foreground">
          Browse all components in our makerspace. Check availability before borrowing.
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, case, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Case</TableHead>
                <TableHead className="font-semibold text-center">Total</TableHead>
                <TableHead className="font-semibold text-center">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No components found.
                      </TableCell>
                    </TableRow>
                  )
                : filtered.map((c, i) => {
                    const stockRatio = c.availableStock / c.totalStock;
                    const stockColor =
                      stockRatio === 0
                        ? "text-destructive"
                        : stockRatio < 0.3
                        ? "text-secondary"
                        : "text-success";

                    return (
                      <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell className="font-medium text-card-foreground">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {c.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.case}</TableCell>
                        <TableCell className="text-center font-mono text-sm">{c.totalStock}</TableCell>
                        <TableCell className={`text-center font-mono text-sm font-semibold ${stockColor}`}>
                          {c.availableStock}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
