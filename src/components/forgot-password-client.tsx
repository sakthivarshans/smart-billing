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
import { KeyRound, ShieldCheck, Send, ArrowLeft } from 'lucide-react';

export function ForgotPasswordClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { users } = useCustomerStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter number, 2: Enter OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Mobile Number',
            description: 'Please enter a valid 10-digit mobile number.',
        });
        return;
    }
    if (!users.find(u => u.mobileNumber === mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'Unregistered Number',
            description: 'This mobile number is not registered. Please sign up.',
          });
          return;
    }

    setIsProcessing(true);
    // Simulate sending OTP
    setTimeout(() => {
        toast({
            title: 'OTP Sent!',
            description: 'An OTP has been sent to your mobile number (mocked).',
        });
        setStep(2);
        setIsProcessing(false);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setIsProcessing(true);
    // Simulate verifying OTP
    setTimeout(() => {
        // In a real app, you would verify the OTP here.
        // For this mock, any 4-digit OTP is accepted.
        if (otp.length === 4) {
            toast({
                title: 'Password Reset Successful',
                description: 'You can now log in with your new (mock) password.',
            });
            // In a real app, you would redirect to a password reset page.
            // Here, we just go back to the login page.
            router.push('/');
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid OTP',
                description: 'The OTP entered is incorrect. Please try again.',
            });
        }
        setIsProcessing(false);
    }, 1000);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
                {step === 1 
                    ? 'Enter your registered mobile number to receive an OTP.' 
                    : 'Enter the 4-digit OTP sent to your mobile.'}
            </CardDescription>
        </CardHeader>

        {step === 1 ? (
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
            </CardContent>
        ) : (
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password (OTP)</Label>
                    <Input
                        id="otp"
                        type="tel"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="_ _ _ _"
                        maxLength={4}
                        disabled={isProcessing}
                        className="text-center tracking-[1em]"
                    />
                </div>
            </CardContent>
        )}

        <CardFooter className="flex flex-col gap-4">
            {step === 1 ? (
                 <Button onClick={handleSendOtp} className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send OTP</>}
                </Button>
            ) : (
                <Button onClick={handleVerifyOtp} className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Verifying...' : <><ShieldCheck className="mr-2 h-4 w-4" /> Verify OTP</>}
                </Button>
            )}
           
            <Link href="/" passHref>
                 <Button variant="link" className="text-sm text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Login
                 </Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
