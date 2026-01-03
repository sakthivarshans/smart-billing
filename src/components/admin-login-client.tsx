
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, User, LogOut } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export function AdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated, logout } = useAdminStore();
  
  const [role, setRole] = useState<'owner' | 'manager'>('owner');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    const success = login(role);
    if (success) {
        toast({ title: 'Login Successful', description: `Welcome, ${role}!` });
        router.push('/admin/dashboard');
    } else {
        // This case should ideally not be hit with the new logic
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Could not log in.' });
    }
  };

  const handleLogoutAndRedirect = () => {
    logout();
    router.push('/billing');
  };

  if (isAuthenticated) {
    return null; // Don't render anything if already authenticated and redirecting
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm shadow-2xl relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogoutAndRedirect} className="absolute top-4 right-4">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <RadioGroup defaultValue="owner" onValueChange={(value) => setRole(value as any)} className="grid grid-cols-2 gap-4">
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
            </RadioGroup>
            
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
