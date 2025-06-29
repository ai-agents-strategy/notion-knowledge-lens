import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Eye, EyeOff, ExternalLink, Globe, Lock, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ShareGraphProps {
  publicId: string | null;
  isPublic: boolean;
  onTogglePublic: (enabled: boolean) => Promise<void>;
  onRevokeLink: () => Promise<void>;
  isLoading: boolean;
}

type VisibilityLevel = 'private' | 'unlisted' | 'gallery';

export const ShareGraph = ({ 
  publicId, 
  isPublic, 
  onTogglePublic, 
  onRevokeLink,
  isLoading 
}: ShareGraphProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [visibility, setVisibility] = useState<VisibilityLevel>('private');
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const publicUrl = publicId ? `${window.location.origin}/public/graph/${publicId}` : '';

  // Load current visibility when opening
  const loadCurrentVisibility = async () => {
    if (!user || !publicId) return;

    try {
      const { data, error } = await supabase
        .from('graphs')
        .select('visibility')
        .eq('user_id', user.id)
        .eq('public_id', publicId)
        .single();

      if (error) {
        console.error('Error loading visibility:', error);
        return;
      }

      if (data) {
        setVisibility(data.visibility as VisibilityLevel);
      }
    } catch (error) {
      console.error('Error loading visibility:', error);
    }
  };

  const updateVisibility = async (newVisibility: VisibilityLevel) => {
    if (!user) return;

    setIsUpdatingVisibility(true);
    try {
      const { error } = await supabase
        .from('graphs')
        .update({ visibility: newVisibility })
        .eq('user_id', user.id);

      if (error) throw error;

      setVisibility(newVisibility);
      
      const visibilityLabels = {
        private: 'Private',
        unlisted: 'Unlisted',
        gallery: 'Gallery'
      };

      toast({
        title: "Visibility updated",
        description: `Graph is now ${visibilityLabels[newVisibility].toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

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

  const handlePopoverOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadCurrentVisibility();
    }
  };

  const getVisibilityIcon = (level: VisibilityLevel) => {
    switch (level) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'unlisted':
        return <Eye className="w-4 h-4" />;
      case 'gallery':
        return <Globe className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityDescription = (level: VisibilityLevel) => {
    switch (level) {
      case 'private':
        return 'Only you can see this graph';
      case 'unlisted':
        return 'Anyone with the link can view this graph';
      case 'gallery':
        return 'Public in gallery + anyone with link can view';
      default:
        return '';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpen}>
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
              Control who can access your knowledge graph.
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Enable/Disable Public Sharing */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Public Access</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Generate a shareable link for your graph
                </p>
              </div>
              <Button
                size="sm"
                variant={isPublic ? "destructive" : "default"}
                onClick={() => isPublic ? onRevokeLink() : onTogglePublic(true)}
                disabled={isLoading}
              >
                {isPublic ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
            </div>

            {isPublic && publicUrl && (
              <>
                {/* Visibility Level Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility Level</Label>
                  <Select 
                    value={visibility} 
                    onValueChange={(value: VisibilityLevel) => updateVisibility(value)}
                    disabled={isUpdatingVisibility}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Private</div>
                            <div className="text-xs text-gray-500">Only you can see this</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Unlisted</div>
                            <div className="text-xs text-gray-500">Anyone with link can view</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="gallery">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Gallery</div>
                            <div className="text-xs text-gray-500">Public showcase + link sharing</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {getVisibilityDescription(visibility)}
                  </p>
                </div>

                {/* Public Link */}
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

                {/* Status Indicator */}
                <div className={`p-3 rounded-lg ${
                  visibility === 'gallery' 
                    ? 'bg-green-50 dark:bg-green-950' 
                    : visibility === 'unlisted'
                    ? 'bg-blue-50 dark:bg-blue-950'
                    : 'bg-gray-50 dark:bg-gray-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon(visibility)}
                    <p className={`text-xs ${
                      visibility === 'gallery' 
                        ? 'text-green-800 dark:text-green-200' 
                        : visibility === 'unlisted'
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {visibility === 'gallery' && 'Your graph is featured in the public gallery and accessible via link.'}
                      {visibility === 'unlisted' && 'Your graph is accessible to anyone with the link.'}
                      {visibility === 'private' && 'Your graph is private and only visible to you.'}
                    </p>
                  </div>
                  
                  {visibility === 'gallery' && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('/gallery', '_blank')}
                        className="text-xs"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        View in Gallery
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isPublic && (
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <Lock className="w-3 h-3 inline mr-1" />
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