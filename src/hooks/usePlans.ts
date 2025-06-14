
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval: string;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  features: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to fetch subscription plans",
          variant: "destructive",
        });
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Unexpected error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceCents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(priceCents / 100);
  };

  return {
    plans,
    loading,
    formatPrice,
    refetch: fetchPlans,
  };
};
