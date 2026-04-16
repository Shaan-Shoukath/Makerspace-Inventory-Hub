import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Wrench,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchLiveStock,
  getCachedLiveStock,
  invalidateCache,
  StockItem,
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

const LOW_STOCK_THRESHOLD = 3;
const ITEMS_PER_PAGE = 15;

const InventoryPage = () => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadStock = (forceRefresh = false) => {
    if (forceRefresh) {
      invalidateCache("getLiveStock");
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    fetchLiveStock()
      .then(setStock)
      .catch(() => toast.error("Failed to load inventory."))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  // Stale-while-revalidate: show cached data instantly, refresh behind
  useEffect(() => {
    const stale = getCachedLiveStock();
    if (stale && stale.length > 0) {
      setStock(stale);
      setLoading(false);
      setRefreshing(true);
      fetchLiveStock()
        .then(setStock)
        .catch(() => {/* keep showing stale */})
        .finally(() => setRefreshing(false));
    } else {
      loadStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = stock.filter((item) =>
    item.component.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">

      {/* ── Hero Banner ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl glass-cyan p-6 md:p-8">
        {/* Decorative glow blob */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <p className="mb-1 font-handwritten text-lg text-primary/80">
              est 2021 · Kochi
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Maker Station Inventory
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-white/50 leading-relaxed">
              A playground for builders — browse every component at TinkerSpace.
              Packed with tools for tinkering, experimenting, and creating
              something extraordinary.
            </p>

            {/* Quick-action CTAs */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/borrow"
                className="flex items-center gap-2 rounded-lg border border-secondary/25 bg-secondary/10 px-4 py-2.5 text-sm font-semibold text-secondary transition-all duration-200 hover:bg-secondary/20 hover:border-secondary/35 hover:shadow-[0_0_16px_rgba(245,160,32,0.14)]"
              >
                <Wrench className="h-4 w-4" />
                Borrow a Component
                <span className="text-secondary/50">→</span>
              </Link>
              <Link
                to="/return"
                className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-4 py-2.5 text-sm font-semibold text-success transition-all duration-200 hover:bg-success/20 hover:border-success/35 hover:shadow-[0_0_16px_rgba(34,197,94,0.14)]"
              >
                <RotateCcw className="h-4 w-4" />
                Return a Component
                <span className="text-success/50">→</span>
              </Link>
            </div>
          </div>

          <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25 shadow-[0_0_24px_rgba(0,212,255,0.18)]">
            <Package className="h-7 w-7 text-primary" />
          </div>
        </div>
      </div>

      {/* ── Search + Refresh bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search by component name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:ring-primary/40 focus-visible:border-primary/30"
          />
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <p className="text-xs text-white/35 whitespace-nowrap">
              {filtered.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length} items
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadStock(true)}
            disabled={refreshing}
            className="shrink-0 border-white/[0.09] bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white hover:border-white/15"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Table / Loading ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-28">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-base font-semibold text-white">Loading inventory…</p>
          <p className="mt-1 text-sm text-white/40">
            Fetching latest stock from the database
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl glass-card overflow-hidden relative">
            {/* Shimmer progress bar while background-refreshing */}
            {refreshing && (
              <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] bg-primary/70 rounded-full" />
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="w-12 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                      #
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                      Component
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                      Case
                    </TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider text-white/35">
                      Stock
                    </TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider text-white/35">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow className="border-white/[0.04]">
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-white/35"
                      >
                        No components found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item, i) => {
                      const isLow = item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD;
                      const isOut = item.stock === 0;

                      return (
                        <TableRow
                          key={item.component}
                          className="border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                        >
                          <TableCell className="text-[11px] text-white/25 font-mono">
                            {startIndex + i + 1}
                          </TableCell>
                          <TableCell className="font-medium text-white/90">
                            {item.component}
                          </TableCell>
                          <TableCell className="text-sm text-white/40">
                            {item.caseName}
                          </TableCell>
                          <TableCell
                            className={`text-center font-mono text-sm font-semibold tabular-nums ${
                              isOut
                                ? "text-destructive"
                                : isLow
                                  ? "text-secondary"
                                  : "text-success"
                            }`}
                          >
                            {item.stock}
                          </TableCell>
                          <TableCell className="text-center">
                            {isOut ? (
                              <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-medium">
                                Out of stock
                              </Badge>
                            ) : isLow ? (
                              <Badge className="bg-secondary/10 text-secondary border border-secondary/20 text-[11px] font-medium">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Low stock
                              </Badge>
                            ) : (
                              <Badge className="bg-success/10 text-success border border-success/20 text-[11px] font-medium">
                                Available
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-30"
                          : "cursor-pointer text-white/60 hover:text-white hover:bg-white/[0.05] border-white/[0.08]"
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, idx) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis className="text-white/30" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                          className={`cursor-pointer ${
                            page === currentPage
                              ? "bg-primary/15 text-primary border-primary/25"
                              : "text-white/50 hover:text-white hover:bg-white/[0.05] border-white/[0.07]"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-30"
                          : "cursor-pointer text-white/60 hover:text-white hover:bg-white/[0.05] border-white/[0.08]"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryPage;
