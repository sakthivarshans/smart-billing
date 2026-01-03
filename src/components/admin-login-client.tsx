
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

export function AdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasBeenSetup, login, setPassword: setupInitialAdmin, isAuthenticated } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In State
  const [signInMobile, setSignInMobile] = useState('');
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
    const isSetup = useAdminStore.getState().hasBeenSetup;
    if (!isSetup) {
      setActiveTab('signup');
    } else {
      setActiveTab('signin');
    }
  }, []);

  const handleSignIn = () => {
    const success = login(signInMobile, signInPassword);
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
        description: 'Incorrect mobile number or password.',
      });
      setSignInPassword('');
    }
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
    if (signUpPassword.length < 4) {
        toast({
          variant: 'destructive',
          title: 'Password Too Short',
          description: 'Password must be at least 4 characters long.',
        });
        return;
    }

    setupInitialAdmin(signUpPassword);
    toast({
      title: 'Setup Complete!',
      description: 'The default admin accounts have been configured. You can now sign in.',
      duration: 9000,
    });
    setActiveTab('signin');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (activeTab === 'signin') handleSignIn();
      if (activeTab === 'signup') handleSignUp();
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl relative">
        <div className="absolute top-4 left-4">
          <Link href="/" passHref>
              <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
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
                    <Label htmlFor="mobile-signin">Mobile Number</Label>
                    <Input
                      id="mobile-signin"
                      type="tel"
                      value={signInMobile}
                      onChange={(e) => setSignInMobile(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="10-digit number"
                      maxLength={10}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signin">Password</Label>
                    <Input
                      id="password-signin"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                    />
                </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button onClick={handleSignIn} className="w-full">
                        <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                    <div className="text-sm text-center w-full">
                        <Link href="/forgot-password" passHref>
                            <span className="text-sm text-muted-foreground hover:text-primary underline">Forgot Password?</span>
                        </Link>
                    </div>
                </CardFooter>
            </TabsContent>
            <TabsContent value="signup">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Admin Accounts</CardTitle>
                    <CardDescription>Set the password for the default admin accounts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password-signup">New Admin Password</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Admin Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                    />
                </div>
                <Button onClick={handleSignUp} className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" /> Create Accounts
                </Button>
                </CardContent>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
