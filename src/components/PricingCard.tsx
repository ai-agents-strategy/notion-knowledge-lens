import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    currency: string;
    interval: string;
    features: any;
  };
  formatPrice: (priceCents: number, currency: string) => string;
  onSubscribe: () => void;
  isLoading: boolean;
  isCurrentPlan?: boolean;
  isSubscribedToSomething?: boolean;
  monthlyPriceCents?: number;
}

export const PricingCard = ({ 
  plan, 
  formatPrice, 
  onSubscribe, 
  isLoading,
  isCurrentPlan = false,
  isSubscribedToSomething = false, 
  monthlyPriceCents,
}: PricingCardProps) => {
  const features = Array.isArray(plan.features) ? plan.features : [];
  const isYearlyPlan = plan.interval === 'year';
  const isFreeTrial = plan.price_cents === 0;
  
  // Calculate monthly equivalent for yearly plan
  const monthlyEquivalent = isYearlyPlan ? plan.price_cents / 12 : plan.price_cents;
  const savings = isYearlyPlan && monthlyPriceCents ? (monthlyPriceCents * 12) - plan.price_cents : 0;

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isFreeTrial) {
      if (isSubscribedToSomething) return 'Already Subscribed';
      return 'Start Free Trial';
    }
    return 'Subscribe';
  }

  const isButtonDisabled = isLoading || isCurrentPlan || (isFreeTrial && isSubscribedToSomething);

  return (
    <Card className={`relative ${isCurrentPlan ? 'border-green-500 border-2' : ''} ${isYearlyPlan ? 'border-blue-500 border-2' : ''}`}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
          Current Plan
        </Badge>
      )}
      {isYearlyPlan && !isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Best Value
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="text-3xl font-bold">
          {isFreeTrial ? (
            <span>Free</span>
          ) : isYearlyPlan ? (
            <div>
              <div>{formatPrice(monthlyEquivalent, plan.currency)}/month</div>
              <div className="text-sm text-muted-foreground">
                {formatPrice(plan.price_cents, plan.currency)} billed yearly
              </div>
            </div>
          ) : (
            <span>{formatPrice(plan.price_cents, plan.currency)}/month</span>
          )}
        </div>
        {isYearlyPlan && savings > 0 && (
          <div className="text-sm text-green-600 font-semibold">
            Save {formatPrice(savings, plan.currency)} compared to monthly!
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onSubscribe}
          disabled={isButtonDisabled}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};
