import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface ShareGraphProps {
  publicId: string | null;
  isPublic: boolean;
  onTogglePublic: (enabled: boolean) => Promise<void>;
  onRevokeLink: () => Promise<void>;
  isLoading: boolean;
}

export const ShareGraph = ({ 
  publicId, 
  isPublic, 
  onTogglePublic, 
  onRevokeLink,
  isLoading 
}: ShareGraphProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const publicUrl = publicId ? `${window.location.origin}/public/graph/${publicId}` : '';

  const copyToClipboard = async () => {
    if (!publicUrl) return;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Link copied!",
        description: "Public graph link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    if (!publicUrl) return;
    window.open(publicUrl, '_blank');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-gray-300 text-black hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-white border-gray-200 text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-lg">Share Knowledge Graph</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Make your graph publicly accessible with a shareable link.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Public Access</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Allow anyone with the link to view your graph
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={onTogglePublic}
                disabled={isLoading}
              />
            </div>

            {isPublic && publicUrl && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Public Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openInNewTab}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <Eye className="w-3 h-3 inline mr-1" />
                    Your graph is now publicly accessible. Anyone with this link can view it.
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRevokeLink}
                  disabled={isLoading}
                  className="w-full"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Revoke Public Access
                </Button>
              </div>
            )}

            {!isPublic && (
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <EyeOff className="w-3 h-3 inline mr-1" />
                  Your graph is currently private. Enable public access to generate a shareable link.
                </p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};