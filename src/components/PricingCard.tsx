
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
  onSubscribe: (planId: string) => void;
  isLoading: boolean;
  isCurrentPlan?: boolean;
}

export const PricingCard = ({ 
  plan, 
  formatPrice, 
  onSubscribe, 
  isLoading,
  isCurrentPlan = false 
}: PricingCardProps) => {
  const features = Array.isArray(plan.features) ? plan.features : [];

  return (
    <Card className={`relative ${isCurrentPlan ? 'border-green-500 border-2' : ''}`}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
          Current Plan
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="text-3xl font-bold">
          {formatPrice(plan.price_cents, plan.currency)}
          <span className="text-lg font-normal text-muted-foreground">
            /{plan.interval}
          </span>
        </div>
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
          onClick={() => onSubscribe(plan.id)}
          disabled={isLoading || isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
};
