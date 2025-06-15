
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SimplePricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
}

export const PricingCard = ({ 
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  onSubscribe,
  isLoading
}: SimplePricingCardProps) => {
  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 border-2' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-3xl font-bold">
          {price}
          <span className="text-lg font-normal text-muted-foreground">
            /{period}
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
          onClick={onSubscribe}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
};
