'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DeleteAccountDialog } from '@/components/dashboard/delete-account-dialog';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.displayName || '',
      email: user?.email || '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }

      // Update Firestore user document
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { name: data.name });

      toast({
        title: 'Profile updated',
        description: 'Your name has been successfully updated.',
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not update your profile. Please try again.',
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // 1. Delete Firestore user document
      const userRef = doc(firestore, 'users', user.uid);
      await deleteDoc(userRef);

      // 2. Delete Firebase Auth user
      if(auth.currentUser) {
         await deleteUser(auth.currentUser);
      }
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });

      // Redirect is handled by the auth state listener in the layout
      setIsDeleteDialogOpen(false);

    } catch (error) {
       console.error('Error deleting account:', error);
       toast({
        variant: 'destructive',
        title: 'Error deleting account',
        description: 'You may need to log out and log back in to perform this action. If the problem persists, please contact support.',
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user?.displayName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all of your content. This action is not reversible.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete My Account</Button>
          </CardContent>
      </Card>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
