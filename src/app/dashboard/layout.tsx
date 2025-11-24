'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      setInitialCheckComplete(true);
      if (!user) {
        router.push('/start');
      }
    }
  }, [isUserLoading, user, router]);

  if (!initialCheckComplete || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
