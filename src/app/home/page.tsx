
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppLoader } from '@/components/layout/loader';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if(user.role === 'Store Supervisor' || user.role === 'Cashier') {
            router.replace('/pending');
        } else if (user.role === 'Liaison') {
            router.replace('/endorsed');
        } else if (user.role === 'Accounting') {
            router.replace('/released-cv');
        } else {
            router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <AppLoader />;
}
