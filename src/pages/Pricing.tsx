
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
  const { subscription, createCheckoutSession, openCustomerPortal } = useSubscriptions();
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

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-notion-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

        <div className="text-center mt-12">
          <SignedOut>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-black dark:text-white mb-4">Sign in to get started</p>
              <SignInButton mode="modal">
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Sign In
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
