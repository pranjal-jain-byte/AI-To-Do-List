'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuthenticatedUser } from '@/lib/data';
import { usePathname } from 'next/navigation';
import { CheckSquare, Clock, FileText, Home, LogOut, Settings, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AppSidebar() {
  const pathname = usePathname();
  const user = getAuthenticatedUser();
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">Chronos AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" className="w-full">
              <SidebarMenuButton isActive={isActive('/dashboard')} icon={<Home />}>
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/tasks" className="w-full">
              <SidebarMenuButton isActive={isActive('/dashboard/tasks')} icon={<CheckSquare />}>
                My Tasks
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/notes" className="w-full">
              <SidebarMenuButton isActive={isActive('/dashboard/notes')} icon={<FileText />}>
                Notes
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/dashboard/teams" className="w-full">
              <SidebarMenuButton isActive={isActive('/dashboard/teams')} icon={<Users />}>
                Teams
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
            <Link href="/login">
                <LogOut className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground" />
            </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
