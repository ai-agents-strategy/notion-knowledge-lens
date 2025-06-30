import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Loader2, Info } from 'lucide-react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get any message passed from sign-up page
  const locationState = location.state as { message?: string; email?: string } | null;

  // Pre-fill email if passed from sign-up
  useState(() => {
    if (locationState?.email) {
      setEmail(locationState.email);
    }
  });

  const ensureUserProfile = async (user: any) => {
    try {
      console.log('👤 Ensuring user profile exists for:', user.id);
      
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        console.log('➕ Creating new user profile...');
        
        // Extract user info from metadata or email
        const userName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        '';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            user_name: userName,
            user_email: user.email || '',
          });

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError);
        } else {
          console.log('✅ User profile created successfully');
        }
      } else {
        console.log('✅ User profile already exists');
      }
    } catch (error) {
      console.error('❌ Unexpected error in ensureUserProfile:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting email/password sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        }
        
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.id);
        
        // Ensure user profile exists
        await ensureUserProfile(data.user);
        
        toast({
          title: "Welcome back! 👋",
          description: "You have been signed in successfully.",
        });
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred during sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      console.log('🔐 Attempting Google OAuth sign in...');
      
      // Get the current origin (works for both localhost and production)
      const redirectTo = `${window.location.origin}/`;
      
      console.log('🔗 Google OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('🔗 Google OAuth initiated successfully');
      
      toast({
        title: "Redirecting to Google...",
        description: "You'll be redirected to Google to complete sign in.",
      });
      
      // The redirect will happen automatically
      
    } catch (error) {
      console.error('❌ Unexpected Google OAuth error:', error);
      toast({
        title: "Google Sign In Error",
        description: "An unexpected error occurred with Google sign-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to access your knowledge graphs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show message from sign-up if available */}
          {locationState?.message && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {locationState.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isGoogleLoading || !email.trim() || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-blue-600 hover:underline font-medium">
              Create one here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;