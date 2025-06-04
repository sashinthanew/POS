'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { ShoppingCart, Package, Settings, BarChart3, Users } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { role } = useUser();

  return (
    <ProtectedRoute allowedRoles={['admin', 'cashier']}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold font-headline mb-8 text-foreground">Dashboard</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome back, {role}! Here&apos;s a quick overview of LankaPOS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Sales Processing"
            description="Start new transactions and manage sales."
            icon={<ShoppingCart className="h-8 w-8 text-primary" />}
            link="/app/sales"
            buttonText="Go to Sales"
          />
          
          {role === 'admin' && (
            <DashboardCard
              title="Item Management"
              description="Add new items and manage inventory."
              icon={<Package className="h-8 w-8 text-primary" />}
              link="/app/items"
              buttonText="Manage Items"
            />
          )}

          {role === 'admin' && (
            <DashboardCard
              title="Settings"
              description="Customize receipts and get restock suggestions."
              icon={<Settings className="h-8 w-8 text-primary" />}
              link="/app/settings"
              buttonText="Configure Settings"
            />
          )}
           <DashboardCard
              title="Reports (Coming Soon)"
              description="View sales reports and analytics."
              icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
              link="#"
              buttonText="View Reports"
              disabled
            />
            <DashboardCard
              title="User Management (Coming Soon)"
              description="Manage user accounts and permissions."
              icon={<Users className="h-8 w-8 text-muted-foreground" />}
              link="#"
              buttonText="Manage Users"
              disabled
            />
        </div>
      </div>
    </ProtectedRoute>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  buttonText: string;
  disabled?: boolean;
}

function DashboardCard({ title, description, icon, link, buttonText, disabled }: DashboardCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold font-headline">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <div className="p-6 pt-0">
        <Button className="w-full" asChild disabled={disabled}>
          <Link href={link}>{buttonText}</Link>
        </Button>
      </div>
    </Card>
  );
}
