
'use client';

import { useAuth, UserRole } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLoader } from '../layout/loader';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Header } from '../layout/header';
import { AppSidebar } from '../layout/sidebar';

type ProtectedPageProps = {
  children: React.ReactNode;
  allowedRoles: UserRole[];
};

function UnauthorizedAccess() {
    const router = useRouter();
    return (
         <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppSidebar />
            <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                <Header title="Unauthorized" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                     <Alert variant="destructive" className="max-w-lg mx-auto mt-16">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.
                            <div className="mt-4">
                                <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </main>
            </div>
        </div>
    )
}

export function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      return; // Wait until loading is complete
    }

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
       setIsAuthorized(false);
    } else {
        setIsAuthorized(true);
    }

  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return <AppLoader />;
  }
  
  if (!isAuthorized) {
      return <UnauthorizedAccess />;
  }

  return <>{children}</>;
}
