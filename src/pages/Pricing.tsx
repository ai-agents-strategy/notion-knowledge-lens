
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { usePlans } from '@/hooks/usePlans';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Loader2 } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();
  const { plans, loading: plansLoading, formatPrice } = usePlans();
  const { subscription, createCheckoutSession, openCustomerPortal, startFreeTrial } = useSubscriptions();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);

  const handleSubscribe = async (planId: string, priceCents: number) => {
    if (priceCents === 0) {
      // It's a free trial
      setTrialLoading(true);
      await startFreeTrial();
      setTrialLoading(false);
    } else {
      // It's a paid plan
      setCheckoutLoading(planId);
      try {
        const url = await createCheckoutSession(planId);
        if (url) {
          window.open(url, '_blank');
        }
      } finally {
        setCheckoutLoading(null);
      }
    }
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-notion-blue" />
      </div>
    );
  }

  const freePlan = plans.find(p => p.price_cents === 0);
  const monthlyPlan = plans.find(p => p.interval === 'month');
  const yearlyPlan = plans.find(p => p.interval === 'year');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Start with our 7-day free trial - no credit card required
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 dark:text-green-200 font-medium">
              🎉 Free Trial includes full access to all features for 7 days!
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {freePlan && (
            <PricingCard
              key={freePlan.id}
              plan={freePlan}
              formatPrice={formatPrice}
              onSubscribe={() => handleSubscribe(freePlan.id, freePlan.price_cents)}
              isLoading={trialLoading}
              isCurrentPlan={subscription?.plan_id === freePlan.id}
              isSubscribedToSomething={!!subscription}
            />
          )}
          {monthlyPlan && (
            <PricingCard
              key={monthlyPlan.id}
              plan={monthlyPlan}
              formatPrice={formatPrice}
              onSubscribe={() => handleSubscribe(monthlyPlan.id, monthlyPlan.price_cents)}
              isLoading={checkoutLoading === monthlyPlan.id}
              isCurrentPlan={subscription?.plan_id === monthlyPlan.id}
              isSubscribedToSomething={!!subscription}
            />
          )}
          {yearlyPlan && (
            <PricingCard
              key={yearlyPlan.id}
              plan={yearlyPlan}
              formatPrice={formatPrice}
              onSubscribe={() => handleSubscribe(yearlyPlan.id, yearlyPlan.price_cents)}
              isLoading={checkoutLoading === yearlyPlan.id}
              isCurrentPlan={subscription?.plan_id === yearlyPlan.id}
              isSubscribedToSomething={!!subscription}
              monthlyPriceCents={monthlyPlan?.price_cents}
            />
          )}
        </div>

        <div className="text-center mt-12">
          <SignedOut>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-black dark:text-white mb-4">Sign up to start your free trial</p>
              <SignInButton mode="modal">
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Sign Up for Free Trial
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            {subscription && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-black dark:text-white mb-4">Need to manage your subscription?</p>
                <Button 
                  onClick={openCustomerPortal}
                  variant="outline" 
                  className="bg-white text-black hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </SignedIn>
        </div>

        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
