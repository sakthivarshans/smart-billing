'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserCog } from 'lucide-react';

export function CustomerLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useCustomerStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Mobile Number',
            description: 'Please enter a valid 10-digit mobile number.',
        });
        return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const success = login(mobileNumber, password);
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Redirecting to the billing dashboard...',
        });
        router.push('/billing');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Incorrect mobile number or password.',
        });
        setPassword('');
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative">
       <div className="absolute top-4 right-4">
            <Link href="/admin/login" passHref>
                <Button variant="ghost" size="sm">
                    <UserCog className="mr-2 h-4 w-4" />
                    Admin
                </Button>
            </Link>
        </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your mobile number and password to begin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="mobile-number">Mobile Number</Label>
                <Input
                    id="mobile-number"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    disabled={isProcessing}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                    id="password-signin"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    disabled={isProcessing}
                />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleSignIn} className="w-full" disabled={isProcessing}>
                {isProcessing ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
            </Button>
            <div className="text-sm text-center w-full flex justify-between">
                <Link href="/forgot-password" passHref>
                    <span className="text-sm text-muted-foreground hover:text-primary underline">Forgot Password?</span>
                </Link>
                <Link href="/signup" passHref>
                    <span className="text-sm text-muted-foreground hover:text-primary">Don't have an account? <span className="font-semibold underline">Sign Up</span></span>
                </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
