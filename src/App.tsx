import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import OnboardingPage from "./pages/OnboardingPage";
import PhotoUploadPage from "./pages/PhotoUploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import EvolutionPage from "./pages/EvolutionPage";
import CheckinPage from "./pages/CheckinPage";
import GuidesPage from "./pages/GuidesPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/upload" element={<PhotoUploadPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/evolution" element={<EvolutionPage />} />
            <Route path="/checkin" element={<CheckinPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
