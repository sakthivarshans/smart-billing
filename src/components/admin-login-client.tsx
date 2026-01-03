

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
import { LogIn, UserPlus, ArrowLeft, ShieldQuestion } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export function AdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasBeenSetup, login, setPassword: setupInitialAdmin, isAuthenticated } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In State
  const [signInRole, setSignInRole] = useState<'owner' | 'manager' | 'developer'>('owner');
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
    // The mobile number is now hardcoded for the default owner/manager/developer roles
    const success = login(signInRole, signInPassword);
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
        description: 'Incorrect role or password.',
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
      description: 'The default admin account has been configured. You can now sign in.',
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
                    <CardDescription>Select your role and enter your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup
                    defaultValue="owner"
                    onValueChange={(value: 'owner' | 'manager' | 'developer') => setSignInRole(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="r-owner" />
                      <Label htmlFor="r-owner">Owner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manager" id="r-manager" />
                      <Label htmlFor="r-manager">Manager</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="developer" id="r-developer" />
                      <Label htmlFor="r-developer">Developer</Label>
                    </div>
                  </RadioGroup>
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
                <CardFooter>
                    <Button onClick={handleSignIn} className="w-full">
                        <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                </CardFooter>
            </TabsContent>
            <TabsContent value="signup">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Initial Admin Setup</CardTitle>
                    <CardDescription>Set the password for the primary admin account.</CardDescription>
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
                    <UserPlus className="mr-2 h-4 w-4" /> Create Account
                </Button>
                </CardContent>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
