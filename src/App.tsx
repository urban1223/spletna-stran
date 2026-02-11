import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ui/scrolltotop";
import MainLayout from "./layouts/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/o-nas" element={<About />} />
              <Route path="/clani" element={<Members />} />
              <Route path="/dogodki" element={<Events />} />
              <Route path="/projekti" element={<Projects />} />
              <Route path="/galerija" element={<Gallery />} />
              <Route path="/podprite-nas" element={<Support />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);


export default App;
