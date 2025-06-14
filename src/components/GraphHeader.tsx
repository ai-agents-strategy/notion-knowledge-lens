
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
  
  // Check if user has active subscription (not free trial)
  const hasActiveSubscription = subscription && subscription.plan?.price_cents && subscription.plan.price_cents > 0;

  return (
    <div className="relative z-10 p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SEO Knowledge Graph
          </h1>
          <p className="text-slate-300 text-lg">
            Visualize semantic relationships between pages and content
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-slate-400">
              {usingRealData ? "Real Notion Pages" : "Sample SEO Data"}
            </span>
            <div className={`w-2 h-2 rounded-full ${usingRealData ? "bg-green-400" : "bg-blue-400"}`} />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={onSync}
            disabled={isSyncing || !isSignedIn || authIsLoading || !hasActiveSubscription}
            variant="outline"
            size="sm"
            className="bg-green-800/50 border-green-700/50 text-green-200 hover:bg-green-700/50 disabled:opacity-50"
            title={!hasActiveSubscription ? "Upgrade to use Notion sync" : ""}
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
              className="bg-blue-800/50 border-blue-700/50 text-blue-200 hover:bg-blue-700/50"
              disabled={!isSignedIn || authIsLoading}
            >
              {isRealData ? "Show Sample" : "Show Real Data"}
            </Button>
          )}

          {realDataExists && isSignedIn && hasActiveSubscription && (
            <ShareGraph 
              publicId={publicId}
              onGenerateLink={onGenerateLink}
              onRevokeLink={onRevokeLink}
            />
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50"
            onClick={() => navigate('/settings')}
            disabled={!isSignedIn || authIsLoading}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          {authIsLoading ? (
            <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
          ) : isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-sky-800/50 border-sky-700/50 text-sky-200 hover:bg-sky-700/50"
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
