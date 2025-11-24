'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    const handleSignup = (event: React.FormEvent) => {
        event.preventDefault();
        // In a real app, you'd handle Firebase auth here.
        // For this prototype, we'll just redirect.
        router.push('/dashboard');
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
         <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <Clock className="h-10 w-10 text-primary" />
            </Link>
          <h1 className="text-3xl font-bold font-headline">Create your Account</h1>
          <p className="text-muted-foreground">Start organizing your life with the power of AI.</p>
        </div>
        <Card>
          <form onSubmit={handleSignup}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Sarah Lee" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="sarah@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Create Account
              </Button>
               <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
