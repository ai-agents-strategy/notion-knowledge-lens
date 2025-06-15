
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { ShareGraph } from './ShareGraph';

interface GraphHeaderProps {
  usingRealData: boolean;
  realDataExists: boolean;
  onToggleDataSource: () => void;
  isRealData: boolean;
  publicId: string | null;
  onGenerateLink: () => Promise<string | null>;
  onRevokeLink: () => Promise<void>;
}

export const GraphHeader = ({
  usingRealData,
  realDataExists,
  onToggleDataSource,
  isRealData,
  publicId,
  onGenerateLink,
  onRevokeLink,
}: GraphHeaderProps) => {
  const { isSignedIn, isLoaded } = useUser();
  const { subscription } = useSubscriptions();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    navigate('/auth/sign-in');
  };
  
  const authIsLoading = !isLoaded;
  
  // Allow access for any subscription (including free trial)
  const hasAccess = subscription && subscription.plan;

  return (
    <div className="relative z-10 p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
            SEO Knowledge Graph
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualize semantic relationships between pages and content
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">
              {usingRealData ? "Real Notion Pages" : "Sample SEO Data"}
            </span>
            <div className={`w-2 h-2 rounded-full ${usingRealData ? "bg-green-500" : "bg-primary"}`} />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {realDataExists && (
            <Button
              onClick={onToggleDataSource}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
              disabled={!isSignedIn || authIsLoading}
            >
              {isRealData ? "Show Sample" : "Show Real Data"}
            </Button>
          )}

          {realDataExists && isSignedIn && hasAccess && (
            <ShareGraph 
              publicId={publicId}
              onGenerateLink={onGenerateLink}
              onRevokeLink={onRevokeLink}
            />
          )}

          {authIsLoading ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          ) : isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={handleAuthAction}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login / Sign Up
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
