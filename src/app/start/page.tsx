'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FirebaseClientProvider, useUser, useFirestore, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function AuthForm() {
    const router = useRouter();
    const { setUser } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            const userRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(userRef, {
                id: user.uid,
                name: name,
                email: user.email,
                createdAt: serverTimestamp(),
                summary: {
                    totalTasks: 0,
                    completedToday: 0,
                    overdue: 0,
                    lastUpdated: serverTimestamp()
                }
            }, { merge: true });

            setUser(user);
            router.push('/dashboard');
            toast({
                title: `Welcome, ${name}!`,
                description: "Your account has been created successfully.",
            });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Sign-up failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            router.push('/dashboard');
            toast({
                title: 'Welcome back!',
                description: "You've successfully logged in.",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login failed',
                description: 'Please check your email and password.',
            });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
         <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <Clock className="h-10 w-10 text-primary" />
            </Link>
          <h1 className="text-3xl font-bold font-headline">Welcome to Chronos AI</h1>
          <p className="text-muted-foreground">Your intelligent assistant for tasks and teams.</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <form onSubmit={handleLogin}>
                        <CardHeader>
                            <CardTitle>Log In</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" name="email" type="email" placeholder="name@example.com" required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" name="password" type="password" required disabled={isLoading} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="signup">
                <Card>
                  <form onSubmit={handleSignUp}>
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" name="name" type="text" placeholder="Alex Doe" required disabled={isLoading} />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" name="email" type="email" placeholder="name@example.com" required disabled={isLoading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" name="password" type="password" required disabled={isLoading} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function StartPage() {
    return (
        <FirebaseClientProvider>
            <AuthForm />
        </FirebaseClientProvider>
    )
}
