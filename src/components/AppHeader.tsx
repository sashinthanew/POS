'use client';

import Link from 'next/link';
import { MountainIcon, UserCircle2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from './ui/button';
import { SidebarTrigger } from './ui/sidebar';

export function AppHeader() {
  const { role } = useUser();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <MountainIcon className="h-6 w-6 text-primary" />
        <Link href="/app/dashboard">
          <h1 className="text-xl font-bold font-headline text-foreground">LankaPOS</h1>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {role && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle2 className="h-5 w-5" />
            <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
