
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";

interface GraphHeaderProps {
  usingRealData: boolean;
  isSyncing: boolean;
  onSync: () => void;
  realDataExists: boolean;
  onToggleDataSource: () => void;
  isRealData: boolean; // To determine button text
}

export const GraphHeader = ({
  usingRealData,
  isSyncing,
  onSync,
  realDataExists,
  onToggleDataSource,
  isRealData,
}: GraphHeaderProps) => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    navigate('/auth/sign-in');
  };
  
  const authIsLoading = !isLoaded;

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
            disabled={isSyncing || !isSignedIn || authIsLoading}
            variant="outline"
            size="sm"
            className="bg-green-800/50 border-green-700/50 text-green-200 hover:bg-green-700/50"
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
