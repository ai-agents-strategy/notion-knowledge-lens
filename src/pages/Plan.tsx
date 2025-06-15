
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Calendar, CreditCard, ExternalLink, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { PricingCard } from "@/components/PricingCard";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-black dark:text-white text-lg">Loading subscription details...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex w-full">
        {/* Background Pattern - Notion inspired */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(35,131,226,0.05),transparent_50%)]" />
        
        {/* Sidebar */}
        <Sidebar side="left" className="border-r">
          <SidebarContent className="p-6 bg-slate-50">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Settings Navigation</h2>
              <div className="space-y-2">
                <Link to="/settings" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Key className="w-4 h-4 mr-2" />
                    Integrations
                  </Button>
                </Link>
                <Link to="/plan" className="block">
                  <Button variant="default" size="sm" className="w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    Plan
                  </Button>
                </Link>
                <Link to="/organization" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Organization
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <SidebarTrigger />
          
          <div className="relative z-10 p-6 bg-zinc-50 min-h-full">
            <SettingsHeader title="Subscription Plan" description="Manage your subscription and billing" />

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              <div className="space-y-8">
                {/* Current Subscription */}
                {subscription && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-black dark:text-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-notion-blue dark:text-blue-400">
                        <Crown className="w-5 h-5" />
                        Current Subscription
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Your active subscription details
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white">{subscription.plan?.name}</h3>
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
                        <Button 
                          onClick={openCustomerPortal}
                          className="bg-notion-blue hover:bg-blue-700 text-white"
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
                  <h2 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Plan;
