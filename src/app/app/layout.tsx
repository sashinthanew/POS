import { AppHeader } from '@/components/AppHeader';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { MountainIcon } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
             <Link href="/app/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <MountainIcon className="h-6 w-6 text-primary transition-all group-hover:scale-110" />
                <span className="font-bold font-headline text-lg group-data-[collapsible=icon]:hidden">LankaPOS</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNavigation />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 bg-background overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
