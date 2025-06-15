
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Organization from "./pages/Organization";
import PublicGraph from "./pages/PublicGraph";
import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import SyncClerkToSupabase from "./components/SyncClerkToSupabase";

const queryClient = new QueryClient();

const RedirectToSignIn = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/auth/sign-in');
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Loader2 className="h-12 w-12 animate-spin text-notion-blue" />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SyncClerkToSupabase />
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/public/graph/:publicId" element={<PublicGraph />} />
        <Route
          path="/auth/sign-in"
          element={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
              <SignIn path="/auth/sign-in" routing="path" signUpUrl="/auth/sign-up" fallbackRedirectUrl="/" />
            </div>
          }
        />
        <Route
          path="/auth/sign-up"
          element={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
              <SignUp path="/auth/sign-up" routing="path" signInUrl="/auth/sign-in" fallbackRedirectUrl="/" />
            </div>
          }
        />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          path="/settings"
          element={
            <>
              <SignedIn>
                <Settings />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/organization/*"
          element={
            <>
              <SignedIn>
                <Organization />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
