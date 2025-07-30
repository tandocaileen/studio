
'use client';

import Link from 'next/link';
import {
  Home,
  Settings,
  DollarSign,
  PanelLeft,
  LifeBuoy,
  Receipt,
  LogOut,
  Users,
  FilePenLine,
  FileCheck,
  FileClock,
  SendToBack,
  FileSearch,
  FileDiff,
  CheckCircle2,
  Hourglass,
  PackageCheck,
  Banknote
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Logo } from '@/components/icons';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { useAuth, UserRole } from '@/context/AuthContext';
import React from 'react';

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  allowedRoles: UserRole[];
  exact?: boolean;
}

const navItems: NavItem[] = [
    // Cashier & Supervisor
    { href: '/pending', icon: Hourglass, label: 'Pending', allowedRoles: ['Store Supervisor', 'Cashier'], exact: true },
    { href: '/endorsements', icon: FilePenLine, label: 'Endorsed', allowedRoles: ['Store Supervisor', 'Cashier'] },
    { href: '/for-cv-issuance', icon: Banknote, label: 'For CV Issuance', allowedRoles: ['Store Supervisor', 'Cashier'] },
    { href: '/released-cv', icon: PackageCheck, label: 'Released CV', allowedRoles: ['Store Supervisor', 'Cashier'] },
    { href: '/pending', icon: Receipt, label: 'Liquidations', allowedRoles: ['Store Supervisor', 'Cashier']},

    // Liaison
    { href: '/endorsements', icon: SendToBack, label: 'Endorsed', allowedRoles: ['Liaison'], exact: true },
    { href: '/for-ca-approval', icon: FileClock, label: 'For CA Approval', allowedRoles: ['Liaison'] },
    { href: '/released-cv', icon: PackageCheck, label: 'Released CV', allowedRoles: ['Liaison'] },
    { href: '/for-liquidation', icon: FileDiff, label: 'For Liquidation', allowedRoles: ['Liaison'] },
    { href: '/completed', icon: FileCheck, label: 'Completed', allowedRoles: ['Liaison'] },
    
    // Accounting
    { href: '/for-ca-approval', icon: FileClock, label: 'For CA Approval', allowedRoles: ['Accounting'], exact: true },
    { href: '/released-cv', icon: PackageCheck, label: 'Released CVs', allowedRoles: ['Accounting'] },
    { href: '/for-verification', icon: FileSearch, label: 'For Verification', allowedRoles: ['Accounting'] },

    // Common
    { href: '/users', icon: Users, label: 'Users', allowedRoles: ['Store Supervisor', 'Cashier'] },
    { href: '/settings', icon: Settings, label: 'Settings', allowedRoles: ['Store Supervisor', 'Liaison', 'Cashier', 'Accounting'] },
    { href: '/support', icon: LifeBuoy, label: 'Support', allowedRoles: ['Store Supervisor', 'Liaison', 'Cashier', 'Accounting'] },
];

const homeRoutes: Partial<Record<UserRole, string>> = {
    'Store Supervisor': '/pending',
    'Cashier': '/pending',
    'Liaison': '/endorsements',
    'Accounting': '/for-ca-approval',
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const accessibleNavItems = navItems.filter(item => item.allowedRoles.includes(user.role));
  const homeRoute = homeRoutes[user.role] || '/';

  const isLinkActive = (item: NavItem) => {
      if (item.exact) {
          return pathname === item.href;
      }
      return pathname.startsWith(item.href);
  };
  
  const mainNav = (
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      <Link
        href={homeRoute}
        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
      >
        <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
        <span className="sr-only">LTO Portal</span>
      </Link>
      <TooltipProvider>
        {accessibleNavItems.map((item) => (
          <Tooltip key={`${item.label}-${item.href}`}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                   isLinkActive(item) && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </nav>
  );
  
  const mobileNav = (
     <nav className="grid gap-6 text-lg font-medium">
        <Link
          href={homeRoute}
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">LTO Portal</span>
        </Link>
        {accessibleNavItems.map((item) => (
           <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                 isLinkActive(item) && 'text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
        ))}
         <button
            onClick={logout}
            className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'
        >
            <LogOut className="h-5 w-5" />
            Logout
        </button>
      </nav>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-14 flex-col border-r bg-background sm:flex">
        {mainNav}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <button
                        onClick={logout}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </nav>
      </aside>
      <div className="sm:hidden fixed top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            {mobileNav}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
