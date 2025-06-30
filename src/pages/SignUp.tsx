import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const createUserProfile = async (userId: string, email: string, name?: string) => {
    try {
      console.log('👤 Creating user profile for:', userId);
      
      const profileData = {
        user_id: userId,
        user_email: email,
        user_name: name || email.split('@')[0] || '',
        created_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Don't throw error, just log it - user can still use the app
        toast({
          title: "Profile Setup",
          description: "Account created successfully. You can complete your profile later in settings.",
          variant: "default"
        });
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (error) {
      console.error('❌ Unexpected error creating profile:', error);
      // Don't throw error, just log it
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Starting email/password sign up process...');
      
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || email.split('@')[0],
            email: email.trim(),
          }
        }
      });

      if (authError) {
        console.error('❌ Auth sign up error:', authError);
        toast({
          title: "Sign Up Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        console.error('❌ No user returned from sign up');
        toast({
          title: "Sign Up Failed",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Step 2: Create user profile with auth_id
      await createUserProfile(
        authData.user.id, 
        email.trim(), 
        fullName.trim() || email.split('@')[0]
      );

      // Step 3: Handle different confirmation scenarios
      if (authData.user.email_confirmed_at) {
        // Email is already confirmed (auto-confirm enabled)
        console.log('✅ Email auto-confirmed, user can sign in immediately');
        toast({
          title: "Account Created Successfully! 🎉",
          description: "Your account has been created and is ready to use. You can now sign in.",
        });
        
        // Small delay to show success message
        setTimeout(() => {
          navigate('/sign-in', { 
            state: { 
              message: 'Account created successfully! Please sign in with your credentials.',
              email: email.trim()
            }
          });
        }, 1500);
      } else {
        // Email confirmation required
        console.log('📧 Email confirmation required');
        toast({
          title: "Check Your Email 📧",
          description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
        });
        
        setTimeout(() => {
          navigate('/sign-in', { 
            state: { 
              message: 'Please check your email and confirm your account before signing in.',
              email: email.trim()
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);

    try {
      console.log('🔐 Starting Google OAuth sign up...');
      
      // Get the current origin for redirect
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
          title: "Google Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('🔗 Google OAuth initiated successfully');
      
      toast({
        title: "Redirecting to Google...",
        description: "You'll be redirected to Google to complete sign up.",
      });
      
      // The redirect will happen automatically
      
    } catch (error) {
      console.error('❌ Unexpected Google OAuth error:', error);
      toast({
        title: "Google Sign Up Error",
        description: "An unexpected error occurred with Google sign-up. Please try again.",
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up to start creating and sharing knowledge graphs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
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
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (Optional)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading || isGoogleLoading}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-blue-600 hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;