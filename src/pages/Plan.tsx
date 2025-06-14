
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { PricingCard } from "@/components/PricingCard";
import { SettingsHeader } from "@/components/SettingsHeader";

const Plan = () => {
  const { plans, loading: plansLoading, formatPrice } = usePlans();
  const { subscription, loading: subscriptionLoading, createCheckoutSession, openCustomerPortal } = useSubscriptions();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const url = await createCheckoutSession(planId);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const loading = plansLoading || subscriptionLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading subscription details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <SettingsHeader title="Subscription Plan" description="Manage your subscription and billing" />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-12">
        <div className="space-y-8">
          {/* Current Subscription */}
          {subscription && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  <Crown className="w-5 h-5" />
                  Current Subscription
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Your active subscription details
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{subscription.plan?.name}</h3>
                    <p className="text-slate-400">{subscription.plan?.description}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {subscription.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CreditCard className="w-4 h-4" />
                    <span>{formatPrice(subscription.plan?.price_cents || 0, subscription.plan?.currency)}/{subscription.plan?.interval}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {subscription.current_period_end 
                        ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                        : 'No renewal date'
                      }
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={openCustomerPortal}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Plans */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {subscription ? 'Upgrade or Change Plan' : 'Choose Your Plan'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  formatPrice={formatPrice}
                  onSubscribe={handleSubscribe}
                  isLoading={checkoutLoading === plan.id}
                  isCurrentPlan={subscription?.plan_id === plan.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;
