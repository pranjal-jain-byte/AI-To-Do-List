'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only check for user and redirect after the initial loading is complete.
    if (!isUserLoading) {
      if (!user) {
        router.push('/start');
      }
    }
  }, [isUserLoading, user, router]);

  // While loading, or if there's no user and we are about to redirect, show a spinner.
  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is loaded and exists, render the main layout.
  return <AppLayout>{children}</AppLayout>;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <DashboardContent>{children}</DashboardContent>
    </FirebaseClientProvider>
  );
}
