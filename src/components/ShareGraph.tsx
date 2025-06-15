
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, GlobeLock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ShareGraphProps {
  publicId: string | null;
  onRevokeLink: () => Promise<void>;
}

export const ShareGraph = ({ publicId, onRevokeLink }: ShareGraphProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-purple-800/50 border-purple-700/50 text-purple-200 hover:bg-purple-700/50"
          disabled
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
              Public sharing is not currently available.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-yellow-400 flex items-center gap-1">
              <GlobeLock className="w-3 h-3" /> 
              Your graph is currently private.
            </p>
            <p className="text-sm text-slate-400">
              Public link generation is not available.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
