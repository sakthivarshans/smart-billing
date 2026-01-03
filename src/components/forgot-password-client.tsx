
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerStore, useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ShieldCheck, Send, ArrowLeft } from 'lucide-react';

export function ForgotPasswordClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { users: customerUsers } = useCustomerStore();
  const { developers } = useAdminStore();
  
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
    
    const isRegistered = customerUsers.some(u => u.operatorMobileNumber === mobileNumber || u.adminMobileNumber === mobileNumber) || developers.some(d => d.mobileNumber === mobileNumber);

    if (!isRegistered) {
        toast({
            variant: 'destructive',
            title: 'Unregistered Number',
            description: 'This mobile number is not registered for any account.',
          });
          return;
    }

    setIsProcessing(true);
    // Simulate sending OTP
    setTimeout(() => {
        toast({
            title: 'OTP Sent!',
            description: 'An OTP has been sent to your mobile number (mocked as 1234).',
        });
        setStep(2);
        setIsProcessing(false);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setIsProcessing(true);
    // For this mock, the OTP is always '1234'.
    if (otp === '1234') {
        const customer = customerUsers.find(u => u.operatorMobileNumber === mobileNumber);
        const admin = customerUsers.find(u => u.adminMobileNumber === mobileNumber);
        const developer = developers.find(d => d.mobileNumber === mobileNumber);
        
        let passwordToShow = '';
        if (customer) {
            passwordToShow = customer.operatorPassword;
        } else if (admin) {
            passwordToShow = admin.adminPassword;
        } else if (developer) {
            passwordToShow = developer.passwordHash;
        }

        toast({
            title: 'Password Retrieved',
            description: `Your password is: ${passwordToShow}`,
            duration: 9000,
        });
        router.push('/');
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid OTP',
            description: 'The OTP entered is incorrect. Please try again.',
        });
    }
    setIsProcessing(false);
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
                    {isProcessing ? 'Verifying...' : <><ShieldCheck className="mr-2 h-4 w-4" /> Verify OTP & Get Password</>}
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
