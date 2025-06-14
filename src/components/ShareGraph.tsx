
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy, XCircle, Globe, GlobeLock, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareGraphProps {
  publicId: string | null;
  onGenerateLink: () => Promise<string | null>;
  onRevokeLink: () => Promise<void>;
}

export const ShareGraph = ({ publicId, onGenerateLink, onRevokeLink }: ShareGraphProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    const link = await onGenerateLink();
    if (link) {
      setPublicLink(link);
    }
    setIsLoading(false);
  };

  const handleRevoke = async () => {
    setIsLoading(true);
    await onRevokeLink();
    setPublicLink(null);
    setIsOpen(false);
    setIsLoading(false);
  };
  
  const handleCopyToClipboard = () => {
    const linkToCopy = publicLink || (publicId ? `${window.location.origin}/public/graph/${publicId}` : '');
    if (!linkToCopy) return;
    navigator.clipboard.writeText(linkToCopy);
    setHasCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const effectivePublicId = publicId || (publicLink ? new URL(publicLink).pathname.split('/').pop() : null);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-purple-800/50 border-purple-700/50 text-purple-200 hover:bg-purple-700/50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-slate-800 border-slate-700 text-white">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-lg">Share Knowledge Graph</h4>
            <p className="text-sm text-slate-400">
              {effectivePublicId ? 'Share this link with others to view your graph.' : 'Generate a public link to share your graph.'}
            </p>
          </div>
          
          {effectivePublicId ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input readOnly value={publicLink || `${window.location.origin}/public/graph/${effectivePublicId}`} className="bg-slate-700 border-slate-600" />
                <Button size="icon" variant="ghost" onClick={handleCopyToClipboard}>
                  {hasCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-green-400 flex items-center gap-1"><Globe className="w-3 h-3" /> Public access is enabled.</p>
              <Button onClick={handleRevoke} variant="destructive" size="sm" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                {isLoading ? 'Revoking...' : 'Revoke Public Access'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-yellow-400 flex items-center gap-1"><GlobeLock className="w-3 h-3" /> Your graph is currently private.</p>
              <Button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                {isLoading ? 'Generating...' : 'Generate Public Link'}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
