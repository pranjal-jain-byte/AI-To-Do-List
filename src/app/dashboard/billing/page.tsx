'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your billing and subscription information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <CreditCard className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold">Billing Page</h3>
          <p>This feature is coming soon. Manage your subscription and payment methods here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
