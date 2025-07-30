
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { AppSidebar } from '@/components/layout/sidebar';
import { usePathname } from 'next/navigation';
import React from 'react';

// export const metadata: Metadata = {
//   title: 'LTO Portal',
//   description: 'Motorcycle LTO Monitoring and Financial Management App',
// };

function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>LTO Portal</title>
          <meta name="description" content="Motorcycle LTO Monitoring and Financial Management App" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className={cn(
            'min-h-screen bg-background font-body antialiased'
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <div className="flex min-h-screen w-full bg-muted/40">
                  {!isLoginPage && <AppSidebar />}
                  <main className={cn("flex flex-1 flex-col sm:gap-4 sm:py-4", !isLoginPage && "sm:pl-14")}>
                     {children}
                  </main>
                </div>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>
}

