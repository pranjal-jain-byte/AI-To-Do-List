'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your application settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <Settings className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold">Settings Page</h3>
          <p>This feature is coming soon. Manage your preferences here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
