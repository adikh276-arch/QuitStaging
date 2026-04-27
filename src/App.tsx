import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SubstancePage from "./pages/SubstancePage.tsx";
import NotFound from "./pages/NotFound.tsx";


import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    console.log('[App] Root App component mounted');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="theme-quit min-h-screen bg-background text-foreground">
          <BrowserRouter basename="/quit_staging">
            <AuthGuard>

              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/:slug" element={<SubstancePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthGuard>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
