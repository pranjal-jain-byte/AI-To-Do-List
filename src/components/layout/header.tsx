'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight } from 'lucide-react';
import { UserNav } from './user-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {segments.map((segment, index) => {
                const href = '/' + segments.slice(0, index + 1).join('/');
                const isLast = index === segments.length - 1;
                return (
                    <React.Fragment key={href}>
                        <Link 
                            href={href} 
                            className={cn(
                                "capitalize hover:text-foreground",
                                isLast && "text-foreground"
                            )}
                        >
                            {segment}
                        </Link>
                        {!isLast && <ChevronRight className="h-4 w-4" />}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumbs />
        <div className="flex-1" />
        <Button variant="outline">
            <Zap className="mr-2 h-4 w-4" />
            Ask AI
        </Button>
        <UserNav />
    </header>
  );
}
