
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, User } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export function AdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAdminStore();
  
  const [role, setRole] = useState<'owner' | 'manager' | 'developer'>('owner');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    const success = login(role, password, mobileNumber);
    if (success) {
        toast({ title: 'Login Successful', description: `Welcome, ${role}!` });
        router.push('/admin/dashboard');
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid credentials. Please try again.' });
    }
  };

  if (isAuthenticated) {
    return null; // Don't render anything if already authenticated and redirecting
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <RadioGroup defaultValue="owner" onValueChange={(value) => setRole(value as any)} className="grid grid-cols-3 gap-4">
                <div>
                    <RadioGroupItem value="owner" id="owner" className="peer sr-only" />
                    <Label htmlFor="owner" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        Owner
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="manager" id="manager" className="peer sr-only" />
                    <Label htmlFor="manager" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        Manager
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="developer" id="developer" className="peer sr-only" />
                    <Label htmlFor="developer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        Developer
                    </Label>
                </div>
            </RadioGroup>

            {role === 'developer' && (
                <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            id="mobileNumber" 
                            type="tel" 
                            placeholder="10-digit number"
                            className="pl-10"
                            maxLength={10}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    </div>
                </div>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="Password" 
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
