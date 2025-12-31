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
import { UserPlus } from 'lucide-react';

export function CustomerSignupClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup, users } = useCustomerStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Mobile Number',
            description: 'Please enter a valid 10-digit mobile number.',
        });
        return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords are the same.',
      });
      return;
    }
    if (password.length < 6) {
        toast({
          variant: 'destructive',
          title: 'Password Too Short',
          description: 'Password must be at least 6 characters long.',
        });
        return;
    }
    if (users.find(u => u.mobileNumber === mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'User Already Exists',
            description: 'This mobile number is already registered. Please sign in.',
          });
          return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      signup(mobileNumber, password);
      toast({
        title: 'Sign Up Successful!',
        description: 'Your account has been created. Please sign in to continue.',
      });
      router.push('/');
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Customer Account</CardTitle>
            <CardDescription>Sign up with your mobile number to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="mobile-number">Mobile Number</Label>
                <Input
                    id="mobile-number"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    disabled={isProcessing}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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
                    placeholder="Re-enter your password"
                    disabled={isProcessing}
                />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleSignUp} className="w-full" disabled={isProcessing}>
                {isProcessing ? 'Creating Account...' : <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>}
            </Button>
            <Link href="/" passHref>
                 <span className="text-sm text-muted-foreground hover:text-primary">Already have an account? <span className="font-semibold underline">Sign In</span></span>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
