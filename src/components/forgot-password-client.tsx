
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
import { KeyRound, ShieldCheck, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { sendEmail } from '@/ai/flows/email-flow';

type UserAccount = {
  emailId: string;
  userType: 'operator' | 'admin' | 'developer';
}

export function ForgotPasswordClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { users: customerUsers, updateUserPassword } = useCustomerStore();
  const { developers, apiKeys, updateDeveloperPassword } = useAdminStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter number, 2: Enter OTP, 3: Reset password
  const [mobileNumber, setMobileNumber] = useState('');
  const [account, setAccount] = useState<UserAccount | null>(null);
  
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const findUserAccount = (number: string): UserAccount | null => {
    const operator = customerUsers.find(u => u.operatorMobileNumber === number);
    if (operator) return { emailId: operator.emailId, userType: 'operator' };
    
    const admin = customerUsers.find(u => u.adminMobileNumber === number);
    if (admin) return { emailId: admin.emailId, userType: 'admin' };

    const developer = developers.find(d => d.mobileNumber === number);
    if (developer) return { emailId: developer.emailId, userType: 'developer' };

    return null;
  }

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Mobile Number',
            description: 'Please enter a valid 10-digit mobile number.',
        });
        return;
    }
    
    const userAccount = findUserAccount(mobileNumber);

    if (!userAccount) {
        toast({
            variant: 'destructive',
            title: 'Unregistered Number',
            description: 'This mobile number is not registered for any account.',
        });
        return;
    }
    setAccount(userAccount);

    setIsProcessing(true);
    
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    
    // If no Email API key, use mock OTP
    if (!apiKeys.emailApiKey) {
        setGeneratedOtp('1234');
        toast({
            title: 'OTP Sent (Mocked)',
            description: 'No Email API key is set. Use OTP: 1234 to proceed.',
            duration: 9000,
        });
        setStep(2);
        setIsProcessing(false);
        return;
    }

    const subject = 'Your Password Reset OTP';
    const body = `Your One-Time Password (OTP) to reset your password is: ${randomOtp}`;

    try {
        const result = await sendEmail({
            apiUrl: 'https://api.botbee.ai/v1/emails', 
            to: userAccount.emailId,
            subject,
            body,
            apiKey: apiKeys.emailApiKey,
        });

        if (result.success) {
            toast({
                title: 'OTP Sent!',
                description: `An OTP has been sent to your registered email: ${userAccount.emailId}.`,
            });
            setStep(2);
        } else {
            throw new Error(result.message);
        }
    } catch (err: any) {
        toast({
            variant: "destructive",
            title: "Failed to Send OTP",
            description: err.message || "Could not send the OTP. Please ensure the Email API key is correct.",
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
        toast({
            title: 'OTP Verified',
            description: 'You can now set a new password.',
        });
        setStep(3);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid OTP',
            description: 'The OTP entered is incorrect. Please try again.',
        });
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 4) {
        toast({
            variant: 'destructive',
            title: 'Password Too Short',
            description: 'Your new password must be at least 4 characters long.',
        });
        return;
    }
    if (newPassword !== confirmPassword) {
        toast({
            variant: 'destructive',
            title: 'Passwords Do Not Match',
            description: 'Please ensure both passwords are the same.',
        });
        return;
    }

    if (!account) {
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'User account not found.'});
        return;
    }

    setIsProcessing(true);
    try {
        if (account.userType === 'operator' || account.userType === 'admin') {
            updateUserPassword(mobileNumber, newPassword, account.userType);
        } else if (account.userType === 'developer') {
            updateDeveloperPassword(mobileNumber, newPassword);
        }
        
        toast({
            title: 'Password Reset Successfully!',
            description: 'You can now log in with your new password.',
        });
        router.push('/');

    } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to Reset Password', description: 'An unexpected error occurred.'});
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
                {step === 1 && 'Enter your registered mobile number to receive an OTP.'}
                {step === 2 && `Enter the 4-digit OTP sent to ${account?.emailId}.`}
                {step === 3 && 'Create a new password for your account.'}
            </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
            {step === 1 && (
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
            )}
            {step === 2 && (
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
            )}
            {step === 3 && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 4 characters"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isProcessing}
                        />
                    </div>
                </>
            )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
            {step === 1 && (
                 <Button onClick={handleSendOtp} className="w-full" disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send OTP</>}
                </Button>
            )}
            {step === 2 && (
                <Button onClick={handleVerifyOtp} className="w-full" disabled={isProcessing}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Verify OTP
                </Button>
            )}
            {step === 3 && (
                 <Button onClick={handleResetPassword} className="w-full" disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><KeyRound className="mr-2 h-4 w-4" /> Reset Password</>}
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
