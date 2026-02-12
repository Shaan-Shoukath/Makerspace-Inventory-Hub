import { useEffect, useState } from "react";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchComponents, Component } from "@/lib/api";
import ComponentCard from "@/components/ComponentCard";

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
      c.case.toLowerCase().includes(search.toLowerCase())
  );

  const cases = [...new Set(filtered.map((c) => c.case))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search components or cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="mb-3 h-12 w-12" />
          <p className="text-lg font-medium">No components found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {cases.map((caseName) => (
            <section key={caseName}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {caseName}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered
                  .filter((c) => c.case === caseName)
                  .map((component) => (
                    <ComponentCard key={component.id} component={component} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
