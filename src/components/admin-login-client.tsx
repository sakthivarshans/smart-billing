'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

// In a real app, this should never be hardcoded on the client.
const ADMIN_PASSWORD = 'password';

export function AdminLoginClient() {
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { login } = useAdminStore();
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoggingIn(true);
    // Simulate a network request
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        login();
        toast({
          title: 'Login Successful',
          description: 'Redirecting to admin dashboard...',
        });
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Incorrect password. Please try again.',
        });
        setPassword('');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter the password to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              disabled={isLoggingIn}
            />
          </div>
          <Button onClick={handleLogin} className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
