'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FirebaseClientProvider, useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';

function StartPageContent() {
    const router = useRouter();
    const { setUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleStart = async (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;

        if (!name) {
            toast({
                variant: 'destructive',
                title: 'Name is required',
                description: 'Please enter your name to continue.',
            });
            return;
        }

        const uid = uuidv4();
        const newUser = {
            uid: uid,
            displayName: name,
        };

        const userRef = doc(firestore, 'users', uid);
        setDocumentNonBlocking(userRef, {
            id: uid,
            name: name,
            email: `${uid}@example.com`,
            createdAt: serverTimestamp(),
            summary: {
                totalTasks: 0,
                completedToday: 0,
                overdue: 0,
                lastUpdated: serverTimestamp()
            }
        }, { merge: true });

        setUser(newUser);
        router.push('/dashboard');
        
        toast({
            title: `Welcome, ${name}!`,
            description: "You're all set. Let's get productive.",
        });
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
         <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <Clock className="h-10 w-10 text-primary" />
            </Link>
          <h1 className="text-3xl font-bold font-headline">Welcome to Chronos AI</h1>
          <p className="text-muted-foreground">Just enter your name to get started.</p>
        </div>
        <Card>
          <form onSubmit={handleStart}>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" name="name" type="text" placeholder="e.g. Alex Doe" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Let's Go!
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function StartPage() {
    return (
        <FirebaseClientProvider>
            <StartPageContent />
        </FirebaseClientProvider>
    )
}
