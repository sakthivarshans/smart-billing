'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

export function AdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasBeenSetup, login, setPassword: setAdminPassword, isAuthenticated } = useAdminStore();
  
  // Initialize state to 'signin' to avoid SSR issues with hasBeenSetup
  const [activeTab, setActiveTab] = useState('signin');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sign In State
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up State
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // This effect runs on the client and sets the correct tab
    if (!hasBeenSetup) {
      setActiveTab('signup');
    } else {
      setActiveTab('signin');
    }
  }, [hasBeenSetup]);

  const handleSignIn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const success = login(signInPassword, signInUsername);
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Redirecting to admin dashboard...',
        });
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Incorrect username or password. Please try again.',
        });
        setSignInPassword('');
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleSignUp = () => {
    if (signUpPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords are the same.',
      });
      return;
    }
    if (signUpPassword.length < 6) {
        toast({
          variant: 'destructive',
          title: 'Password Too Short',
          description: 'Password must be at least 6 characters long.',
        });
        return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setAdminPassword(signUpPassword);
      toast({
        title: 'Setup Complete!',
        description: 'Your admin account has been created. Please sign in.',
      });
      setActiveTab('signin');
      setIsProcessing(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: 'signin' | 'signup') => {
    if (e.key === 'Enter') {
      if (action === 'signin') handleSignIn();
      if (action === 'signup') handleSignUp();
    }
  }

  if (isAuthenticated) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl relative">
        <div className="absolute top-4 left-4">
          <Link href="/billing" passHref>
              <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Billing
              </Button>
          </Link>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-12">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" disabled={!hasBeenSetup}>Sign In</TabsTrigger>
                <TabsTrigger value="signup" disabled={hasBeenSetup}>Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username-signin">Admin Username (Optional)</Label>
                    <Input
                    id="username-signin"
                    type="text"
                    value={signInUsername}
                    onChange={(e) => setSignInUsername(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'signin')}
                    placeholder="e.g. 9655952985 for developer"
                    disabled={isProcessing}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signin">Password</Label>
                    <Input
                    id="password-signin"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'signin')}
                    placeholder="••••••••"
                    disabled={isProcessing}
                    />
                </div>
                <Button onClick={handleSignIn} className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
                </Button>
                </CardContent>
            </TabsContent>
            <TabsContent value="signup">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Admin Account</CardTitle>
                    <CardDescription>Set up a secure password to manage your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password-signup">New Password</Label>
                    <Input
                    id="password-signup"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isProcessing}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'signup')}
                    placeholder="••••••••"
                    disabled={isProcessing}
                    />
                </div>
                <Button onClick={handleSignUp} className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Saving...' : <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>}
                </Button>
                </CardContent>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
