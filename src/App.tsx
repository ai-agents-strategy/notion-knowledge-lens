
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const RedirectToSignIn = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/auth/sign-in');
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/auth/sign-in"
          element={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <SignIn path="/auth/sign-in" routing="path" signUpUrl="/auth/sign-up" fallbackRedirectUrl="/settings" />
            </div>
          }
        />
        <Route
          path="/auth/sign-up"
          element={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <SignUp path="/auth/sign-up" routing="path" signInUrl="/auth/sign-in" fallbackRedirectUrl="/settings" />
            </div>
          }
        />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
