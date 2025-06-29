import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, Eye, EyeOff, LogIn, UserPlus, GalleryVertical as Gallery } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserButton } from "@/components/UserButton";
import { ShareGraph } from "@/components/ShareGraph";

interface GraphHeaderProps {
  usingRealData: boolean;
  realDataExists: boolean;
  onToggleDataSource: () => void;
  isRealData: boolean;
  hasNotionApiKey?: boolean;
  // Public sharing props
  publicId: string | null;
  isPublic: boolean;
  shareLoading: boolean;
  onTogglePublicSharing: (enabled: boolean) => Promise<void>;
  onRevokePublicLink: () => Promise<void>;
}

export const GraphHeader = ({
  usingRealData,
  realDataExists,
  onToggleDataSource,
  isRealData,
  hasNotionApiKey = false,
  publicId,
  isPublic,
  shareLoading,
  onTogglePublicSharing,
  onRevokePublicLink,
}: GraphHeaderProps) => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const getDataSourceText = () => {
    if (!hasNotionApiKey) {
      return "Sample Data";
    }
    return usingRealData ? "Real Data" : "Sample Data";
  };

  const getDataSourceDescription = () => {
    if (!hasNotionApiKey) {
      return "Configure your Notion API key in settings to view real data";
    }
    return usingRealData ? "Showing your actual Notion database relationships" : realDataExists ? "Real data available - sync to update" : "No real data available yet";
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-notion-blue" />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2">
            <Badge variant={usingRealData ? "default" : "secondary"} className={`flex items-center gap-1 ${usingRealData ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
              {usingRealData ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {getDataSourceText()}
            </Badge>
            <span className="text-sm text-gray-600">
              {getDataSourceDescription()}
            </span>
          </div>

          {/* Only show toggle button if API key is configured */}
          {hasNotionApiKey && (
            <Button variant="outline" size="sm" onClick={onToggleDataSource} className="flex items-center gap-2" disabled={!realDataExists && !usingRealData}>
              {usingRealData ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  View Sample
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  View Real Data
                </>
              )}
            </Button>
          )}

          {/* Gallery Button */}
          <Button variant="outline" size="sm" onClick={() => navigate('/gallery')} className="flex items-center gap-2">
            <Gallery className="w-4 h-4" />
            Gallery
          </Button>

          {/* Share Graph Button - only show for signed in users */}
          {isSignedIn && (
            <ShareGraph
              publicId={publicId}
              isPublic={isPublic}
              onTogglePublic={onTogglePublicSharing}
              onRevokeLink={onRevokePublicLink}
              isLoading={shareLoading}
            />
          )}

          <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/sign-in')} className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/sign-up')} className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};