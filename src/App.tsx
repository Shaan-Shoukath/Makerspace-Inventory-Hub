import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import InventoryPage from "@/pages/InventoryPage";
import BorrowPage from "@/pages/BorrowPage";
import ReturnPage from "@/pages/ReturnPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Pitch black background with subtle ambient glow orbs */}
        <div className="fixed inset-0 -z-10 bg-[#080808] overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[140px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-400/[0.02] blur-[100px]" />
        </div>

        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/return" element={<ReturnPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
