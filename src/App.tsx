
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import News from "./pages/News";
import LearningHub from "./pages/LearningHub";
import Tools from "./pages/Tools";
import AIMentor from "./pages/AIMentor";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import { AdminNews } from "./pages/admin/AdminNews";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminTools } from "./pages/admin/AdminTools";
import { AdminPrompts } from "./pages/admin/AdminPrompts";
import { AdminLearningPlans } from "./pages/admin/AdminLearningPlans";
import AdminLearningModules from "./pages/admin/AdminLearningModules";
import { AdminCohorts } from "./pages/admin/AdminCohorts";
import AdminSystemSetup from "./pages/admin/AdminSystemSetup";
import { AdminProfile } from "./pages/admin/AdminProfile";
import Plan from "./pages/Plan";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="alberta-ai-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/news" element={<News />} />
            <Route path="/learning-hub" element={<LearningHub />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/ai-mentor" element={<AIMentor />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<ProtectedRoute requireFacilitator><Admin /></ProtectedRoute>} />
            <Route path="/admin/news" element={<ProtectedRoute requireFacilitator><AdminNews /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/tools" element={<ProtectedRoute requireFacilitator><AdminTools /></ProtectedRoute>} />
            <Route path="/admin/prompts" element={<ProtectedRoute requireFacilitator><AdminPrompts /></ProtectedRoute>} />
            <Route path="/admin/learning/plans" element={<ProtectedRoute requireFacilitator><AdminLearningPlans /></ProtectedRoute>} />
            <Route path="/admin/learning/modules" element={<ProtectedRoute requireFacilitator><AdminLearningModules /></ProtectedRoute>} />
            <Route path="/admin/learning/cohorts" element={<ProtectedRoute requireFacilitator><AdminCohorts /></ProtectedRoute>} />
            <Route path="/admin/setup" element={<ProtectedRoute requireAdmin><AdminSystemSetup /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute requireFacilitator><AdminProfile /></ProtectedRoute>} />
            <Route path="/plan/:planId" element={<Plan />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
