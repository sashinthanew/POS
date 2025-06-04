'use client';

import React, { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import type { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        router.replace('/'); // Redirect to login if not authenticated
      } else if (allowedRoles && !allowedRoles.includes(role)) {
        router.replace('/app/dashboard'); // Redirect to dashboard if role not allowed (or a specific unauthorized page)
      }
    }
  }, [role, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role || (allowedRoles && !allowedRoles.includes(role))) {
    // Still show loader while redirecting to prevent content flash
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
