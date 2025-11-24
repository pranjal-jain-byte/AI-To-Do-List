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
import { useAuth, useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { CheckSquare, Clock, FileText, Home, LogOut, Settings, Users, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/start');
  };

  if (isUserLoading) {
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
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-sidebar-foreground" />
                </div>
            </SidebarContent>
        </Sidebar>
      )
  }

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
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.displayName || user?.email}</p>
            </div>
            <button onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground" />
            </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
