'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FirebaseClientProvider, useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

function SignupPageContent() {
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSignup = (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        auth.onAuthStateChanged(user => {
            if (user) {
                const userRef = doc(firestore, 'users', user.uid);
                setDocumentNonBlocking(userRef, {
                    id: user.uid,
                    name: name,
                    email: email,
                    createdAt: serverTimestamp(),
                    summary: {
                        totalTasks: 0,
                        completedToday: 0,
                        overdue: 0,
                        lastUpdated: serverTimestamp()
                    }
                }, { merge: true });

                router.push('/dashboard');
            }
        });

        initiateEmailSignUp(auth, email, password);

        toast({
            title: 'Creating account...',
            description: 'You will be redirected shortly.',
        });
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
                <Input id="name" name="name" type="text" placeholder="Sarah Lee" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="sarah@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
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

export default function SignupPage() {
    return (
        <FirebaseClientProvider>
            <SignupPageContent />
        </FirebaseClientProvider>
    )
}
