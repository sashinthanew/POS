'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'cashier'] },
  { href: '/app/sales', label: 'Sales', icon: ShoppingCart, roles: ['admin', 'cashier'] },
  { href: '/app/items', label: 'Items', icon: Package, roles: ['admin'] },
  { href: '/app/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const { role, setRole } = useUser();

  const handleLogout = () => {
    setRole(null);
    // No explicit router.push('/') here, relying on ProtectedRoute behavior
  };

  return (
    <div className="flex h-full flex-col">
      <SidebarMenu className="p-2 flex-1">
        {navItems.map((item) =>
          item.roles.includes(role || '') ? (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-body">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ) : null
        )}
      </SidebarMenu>
      <div className="p-2 border-t border-sidebar-border">
         <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout} asChild>
            <Link href="/">
              <LogOut className="h-5 w-5" />
              <span className="font-body">Logout</span>
            </Link>
          </Button>
      </div>
    </div>
  );
}
