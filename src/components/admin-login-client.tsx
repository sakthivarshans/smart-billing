
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function AdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasBeenSetup, login, setPassword: setupInitialAdmin, isAuthenticated } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('signin');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sign In State
  const [signInRole, setSignInRole] = useState('manager');
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
    setIsProcessing(true);
    const mobileNumber = signInRole === 'owner' ? '0000000000' : '1111111111';

    const success = login(mobileNumber, signInPassword);
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
    setIsProcessing(false);
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
    setupInitialAdmin(signUpPassword);
    toast({
      title: 'Setup Complete!',
      description: 'Your initial owner account has been created. Please sign in.',
    });
    setActiveTab('signin');
    setIsProcessing(false);
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
                    <Label htmlFor="role-signin">Role</Label>
                    <Select value={signInRole} onValueChange={setSignInRole}>
                        <SelectTrigger id="role-signin">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <CardTitle className="text-2xl">Create Initial Admin</CardTitle>
                    <CardDescription>Set up a secure password for the first admin account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password-signup">New Password</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
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
                      onKeyPress={handleKeyPress}
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
