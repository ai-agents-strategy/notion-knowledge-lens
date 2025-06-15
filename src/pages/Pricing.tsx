
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Loader2 } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();
  const { subscription, createCheckoutSession, openCustomerPortal } = useSubscriptions();
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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Monthly Plan"
            price="$29"
            period="month"
            description="Perfect for individuals and small teams"
            features={monthlyFeatures}
            onSubscribe={() => handleSubscribe('monthly')}
            isLoading={checkoutLoading === 'monthly'}
          />
          
          <PricingCard
            title="Yearly Plan"
            price="$290"
            period="year"
            description="Best value for growing teams and businesses"
            features={yearlyFeatures}
            isPopular={true}
            onSubscribe={() => handleSubscribe('yearly')}
            isLoading={checkoutLoading === 'yearly'}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-green-600 font-semibold">
            Save $58 per year with the yearly plan!
          </p>
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
