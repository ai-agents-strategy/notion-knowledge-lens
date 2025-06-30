import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Organization from "./pages/Organization";
import PublicGraph from "./pages/PublicGraph";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import {
  UserButton,
  useUser,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const App = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/public/graph/:publicId" element={<PublicGraph />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route
            path="/settings"
            element={<Settings />}
          />
          <Route
            path="/profile"
            element={<Profile />}
          />
          <Route
            path="/organization"
            element={<Organization />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
