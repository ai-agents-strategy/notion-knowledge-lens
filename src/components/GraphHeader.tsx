
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, Eye, EyeOff, Share2, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareGraph } from "./ShareGraph";
import { useState } from "react";

interface GraphHeaderProps {
  usingRealData: boolean;
  realDataExists: boolean;
  onToggleDataSource: () => void;
  isRealData: boolean;
  publicId: string | null;
  onGenerateLink: () => Promise<string | null>;
  onRevokeLink: () => Promise<void>;
  hasNotionApiKey?: boolean;
}

export const GraphHeader = ({ 
  usingRealData, 
  realDataExists, 
  onToggleDataSource, 
  isRealData, 
  publicId, 
  onGenerateLink, 
  onRevokeLink,
  hasNotionApiKey = false
}: GraphHeaderProps) => {
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);

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
    return usingRealData 
      ? "Showing your actual Notion database relationships" 
      : (realDataExists ? "Real data available - sync to update" : "No real data available yet");
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-notion-blue" />
            <h1 className="text-2xl font-bold text-notion-black">Knowledge Graph</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={usingRealData ? "default" : "secondary"} 
              className={`flex items-center gap-1 ${
                usingRealData 
                  ? "bg-green-100 text-green-700 border-green-200" 
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}
            >
              {usingRealData ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {getDataSourceText()}
            </Badge>
            <span className="text-sm text-gray-600">
              {getDataSourceDescription()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Only show toggle button if API key is configured */}
          {hasNotionApiKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDataSource}
              className="flex items-center gap-2"
              disabled={!realDataExists && !usingRealData}
            >
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <ShareGraph
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        publicId={publicId}
        onGenerateLink={onGenerateLink}
        onRevokeLink={onRevokeLink}
      />
    </div>
  );
};
