
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { PricingCard } from "@/components/PricingCard";
import { SettingsSidebar } from "@/components/SettingsSidebar";

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-lg">Loading subscription details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Global Sidebar */}
      <SettingsSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Plan</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your subscription and billing
            </p>
          </div>

          <div className="space-y-8">
            {/* Current Subscription */}
            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription>
                    Your active subscription details
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{subscription.plan?.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{subscription.plan?.description}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CreditCard className="w-4 h-4" />
                      <span>{formatPrice(subscription.plan?.price_cents || 0, subscription.plan?.currency)}/{subscription.plan?.interval}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
                    <Button onClick={openCustomerPortal}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Plans */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {subscription ? 'Upgrade or Change Plan' : 'Choose Your Plan'}
              </h3>
              
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
    </div>
  );
};

export default Plan;
