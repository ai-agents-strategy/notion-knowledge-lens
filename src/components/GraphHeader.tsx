
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
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
  onRevokeLink
}: GraphHeaderProps) => {
  const {
    isSignedIn,
    isLoaded
  } = useUser();
  const {
    subscription
  } = useSubscriptions();
  const authIsLoading = !isLoaded;

  // Allow access for any subscription (including free trial)
  const hasAccess = subscription && subscription.plan;
  
  return (
    <div className="flex items-center justify-between p-4">
      <ShareGraph
        publicId={publicId}
        onGenerateLink={onGenerateLink}
        onRevokeLink={onRevokeLink}
      />
    </div>
  );
};
