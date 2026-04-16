import { Link, useLocation } from "react-router-dom";
import { Wrench, Package, RotateCcw, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isInventory = location.pathname === "/";
  const isBorrow = location.pathname === "/borrow";
  const isReturn = location.pathname === "/return";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/80 border-b border-white/[0.07] shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/icon.jpg"
            alt="TinkerSpace"
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10 shadow-lg"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors duration-200">
              TinkerSpace
            </span>
            <span className="text-[11px] font-handwritten text-white/35 -mt-0.5 hidden sm:block">
              we learn, create &amp; grow together
            </span>
          </div>
        </Link>

        {/* Desktop — Inventory centre link */}
        <div className="hidden md:flex items-center">
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isInventory
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package className="h-4 w-4" />
            Inventory
          </Link>
        </div>

        {/* Desktop — Borrow & Return CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/borrow"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isBorrow
                ? "bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_18px_rgba(245,160,32,0.18)]"
                : "bg-secondary/10 text-secondary/80 border border-secondary/15 hover:bg-secondary/20 hover:text-secondary hover:border-secondary/25 hover:shadow-[0_0_14px_rgba(245,160,32,0.12)]"
            }`}
          >
            <Wrench className="h-4 w-4" />
            Borrow
          </Link>
          <Link
            to="/return"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isReturn
                ? "bg-success/20 text-success border border-success/30 shadow-[0_0_18px_rgba(34,197,94,0.18)]"
                : "bg-success/10 text-success/80 border border-success/15 hover:bg-success/20 hover:text-success hover:border-success/25 hover:shadow-[0_0_14px_rgba(34,197,94,0.12)]"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            Return
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 md:hidden hover:bg-white/[0.06] hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] backdrop-blur-2xl bg-black/90 px-4 pb-4 pt-2 md:hidden space-y-1">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              isInventory
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" />
            Inventory
          </Link>
          <Link
            to="/borrow"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              isBorrow
                ? "bg-secondary/20 text-secondary border border-secondary/25"
                : "bg-secondary/10 text-secondary/75 border border-secondary/10 hover:bg-secondary/15 hover:text-secondary"
            }`}
          >
            <Wrench className="h-4 w-4" />
            Borrow a Component
          </Link>
          <Link
            to="/return"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              isReturn
                ? "bg-success/20 text-success border border-success/25"
                : "bg-success/10 text-success/75 border border-success/10 hover:bg-success/15 hover:text-success"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            Return a Component
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
