'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from './header';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  // You can fetch the cookie here to set the defaultOpen state.
  // For this prototype, we'll just keep it open by default.
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarRail />
        <div className="flex-1 flex flex-col">
          <Header />
          <SidebarInset className="flex-grow p-4 md:p-6 lg:p-8">
            <div className="h-full">
              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
