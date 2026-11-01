import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "./components/ui/scrolltotop";
import MainLayout from "./layouts/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Members = lazy(() => import("./pages/Members"));
const Events = lazy(() => import("./pages/Events"));
const Projects = lazy(() => import("./pages/Projects"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Support = lazy(() => import("./pages/Support"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const MemberDetail = lazy(() => import("./pages/MemberDetail"));
const Tools = lazy(() => import("./pages/Tools"));
const AdminDodajaj = lazy(() => import("./pages/AdminDodajaj"));
const NewsArchive = lazy(() => import("./pages/NewsArchive"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Terms = lazy(() => import("./pages/Legal").then((module) => ({ default: module.Terms })));
const Privacy = lazy(() => import("./pages/Legal").then((module) => ({ default: module.Privacy })));
const Cookies = lazy(() => import("./pages/Legal").then((module) => ({ default: module.Cookies })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <MainLayout>
            <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Nalaganje strani …</div>}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/o-nas" element={<About />} />
              <Route path="/clani" element={<Members />} />
              <Route path="/dogodki" element={<Events />} />
              <Route path="/projekti" element={<Projects />} />
              <Route path="/orodja" element={<Tools />} />
              <Route path="/galerija" element={<Gallery />} />
              <Route path="/podprite-nas" element={<Support />} />
              <Route path="/admin-dodajaj" element={<AdminDodajaj />} />
              <Route path="/aktualno" element={<NewsArchive />} />
              <Route path="/aktualno/:slug" element={<NewsDetail />} />
              <Route path="/pogoji-uporabe" element={<Terms />} />
              <Route path="/zasebnost" element={<Privacy />} />
              <Route path="/piskotki" element={<Cookies />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/dogodki/:slug" element={<EventDetail />} />
              <Route path="/clani/:slug" element={<MemberDetail />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);


export default App;
