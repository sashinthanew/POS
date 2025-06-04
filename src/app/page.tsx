'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import type { UserRole } from '@/types';
import { MountainIcon, Users, ShieldCheck } from 'lucide-react';

export default function RoleSelectionPage() {
  const { role, setRole, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      router.push('/app/dashboard');
    }
  }, [role, isLoading, router]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    router.push('/app/dashboard');
  };

  if (isLoading || (!isLoading && role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <MountainIcon className="h-12 w-12 text-primary mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading LankaPOS...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center mb-4">
            <MountainIcon className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold font-headline text-primary">Welcome to LankaPOS</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Select your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <Button
            onClick={() => handleRoleSelect('admin')}
            className="w-full h-16 text-xl bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md transition-transform hover:scale-105"
            aria-label="Select Admin Role"
          >
            <ShieldCheck className="mr-3 h-7 w-7" />
            Admin
          </Button>
          <Button
            onClick={() => handleRoleSelect('cashier')}
            className="w-full h-16 text-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg shadow-md transition-transform hover:scale-105"
            aria-label="Select Cashier Role"
          >
            <Users className="mr-3 h-7 w-7" />
            Cashier
          </Button>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        A modern Point of Sale solution for your grocery.
      </p>
    </div>
  );
}
