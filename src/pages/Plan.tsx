import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { PricingCard } from "@/components/PricingCard";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsNavigation } from "@/components/SettingsNavigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const Plan = () => {
  const { subscription, loading: subscriptionLoading, createCheckoutSession, openCustomerPortal } = useSubscriptions();
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'yearly' | null>(null);

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setCheckoutLoading(planType);
    try {
      // This would normally use the actual plan ID from your database
      const mockPlanId = planType === 'monthly' ? 'monthly-plan-id' : 'yearly-plan-id';
      const url = await createCheckoutSession(mockPlanId);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const monthlyFeatures = [
    "Knowledge Graph Visualization",
    "Basic Notion Integration",
    "Up to 1,000 nodes",
    "Email Support",
    "Export to PNG/SVG"
  ];

  const yearlyFeatures = [
    "Everything in Monthly",
    "Advanced Notion Integration",
    "Unlimited nodes",
    "Priority Support",
    "Advanced Analytics",
    "Custom Integrations",
    "Team Collaboration"
  ];

  if (subscriptionLoading) {
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
            <SettingsNavigation />
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
                          <span>${subscription.plan?.price_cents ? (subscription.plan.price_cents / 100).toFixed(2) : '0.00'}/{subscription.plan?.interval}</span>
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
                  
                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <PricingCard
                      title="Monthly Plan"
                      price="$5"
                      period="month"
                      description="Perfect for individuals and small teams"
                      features={monthlyFeatures}
                      onSubscribe={() => handleSubscribe('monthly')}
                      isLoading={checkoutLoading === 'monthly'}
                    />
                    
                    <PricingCard
                      title="Yearly Plan"
                      price="$3"
                      period="month"
                      description="Best value for growing teams and businesses"
                      features={yearlyFeatures}
                      isPopular={true}
                      onSubscribe={() => handleSubscribe('yearly')}
                      isLoading={checkoutLoading === 'yearly'}
                      promotionalMessage="Save 40% with the yearly plan!"
                    />
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
