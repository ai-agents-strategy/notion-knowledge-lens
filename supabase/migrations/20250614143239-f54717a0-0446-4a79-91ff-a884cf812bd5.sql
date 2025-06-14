
-- Create plans table for Stripe subscription plans
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL, -- Price in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL, -- 'month', 'year', etc.
  stripe_price_id TEXT UNIQUE, -- Stripe price ID
  stripe_product_id TEXT, -- Stripe product ID
  features JSONB, -- Plan features as JSON
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table to track user subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  plan_id UUID REFERENCES public.plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one active subscription per user
  UNIQUE(user_id, stripe_subscription_id)
);

-- Add Row Level Security for plans table (public read access)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to view plans
CREATE POLICY "Anyone can view plans" 
  ON public.plans 
  FOR SELECT 
  USING (is_active = true);

-- Add Row Level Security for user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions table
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can create their own subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (user_id = get_clerk_user_id());

-- Insert some sample plans
INSERT INTO public.plans (name, description, price_cents, interval, features) VALUES 
('Basic', 'Basic plan with essential features', 999, 'month', '["Up to 5 projects", "Basic support"]'),
('Pro', 'Professional plan with advanced features', 1999, 'month', '["Unlimited projects", "Priority support", "Advanced analytics"]'),
('Enterprise', 'Enterprise plan with all features', 4999, 'month', '["Everything in Pro", "Custom integrations", "Dedicated support"]');
