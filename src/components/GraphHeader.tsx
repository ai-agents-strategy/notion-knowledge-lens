
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { ShareGraph } from './ShareGraph';

interface GraphHeaderProps {
  usingRealData: boolean;
  isSyncing: boolean;
  onSync: () => void;
  realDataExists: boolean;
  onToggleDataSource: () => void;
  isRealData: boolean;
  publicId: string | null;
  onGenerateLink: () => Promise<string | null>;
  onRevokeLink: () => Promise<void>;
}

export const GraphHeader = ({
  usingRealData,
  isSyncing,
  onSync,
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
          <h1 className="text-4xl font-bold text-notion-black mb-2 bg-gradient-to-r from-notion-blue to-notion-blue bg-clip-text text-transparent">
            SEO Knowledge Graph
          </h1>
          <p className="text-notion-gray-600 text-lg">
            Visualize semantic relationships between pages and content
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-notion-gray-500">
              {usingRealData ? "Real Notion Pages" : "Sample SEO Data"}
            </span>
            <div className={`w-2 h-2 rounded-full ${usingRealData ? "bg-notion-green" : "bg-notion-blue"}`} />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={onSync}
            disabled={isSyncing || !isSignedIn || authIsLoading || !hasAccess}
            variant="outline"
            size="sm"
            className="bg-notion-green/10 border-notion-green text-notion-green hover:bg-notion-green/20 disabled:opacity-50"
            title={!hasAccess ? "Sign up for free trial to use Notion sync" : ""}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Notion
              </>
            )}
          </Button>
          {realDataExists && (
            <Button
              onClick={onToggleDataSource}
              variant="outline"
              size="sm"
              className="bg-notion-blue/10 border-notion-blue text-notion-blue hover:bg-notion-blue/20"
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
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-notion-gray-100 border-notion-gray-300 text-notion-black hover:bg-notion-gray-200"
            onClick={() => navigate('/settings')}
            disabled={!isSignedIn || authIsLoading}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          {authIsLoading ? (
            <div className="w-8 h-8 bg-notion-gray-200 rounded-full animate-pulse" />
          ) : isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-notion-blue/10 border-notion-blue text-notion-blue hover:bg-notion-blue/20"
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
