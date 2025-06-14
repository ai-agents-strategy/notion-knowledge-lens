
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscriptions } from "@/hooks/useSubscriptions";

interface SubscriptionGateProps {
  children: ReactNode;
  feature: string;
  description: string;
}

export const SubscriptionGate = ({ children, feature, description }: SubscriptionGateProps) => {
  const { subscription, loading } = useSubscriptions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400">Loading subscription status...</div>
      </div>
    );
  }

  // Allow access if user has any active subscription (not free trial)
  const hasActiveSubscription = subscription && subscription.plan?.price_cents && subscription.plan.price_cents > 0;

  if (!hasActiveSubscription) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Premium Feature: {feature}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-slate-200 mb-2">What you get with a subscription:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Real-time Notion integration</li>
              <li>• Unlimited knowledge graphs</li>
              <li>• Public sharing capabilities</li>
              <li>• Priority support</li>
            </ul>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Link to="/pricing">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
            <Link to="/plan">
              <Button variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50">
                View Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
