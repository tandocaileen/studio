
'use client';

import Link from 'next/link';
import {
  Home,
  Settings,
  DollarSign,
  PanelLeft,
  LifeBuoy,
  Receipt,
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
  Banknote,
  ChevronDown
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Logo } from '@/components/icons';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button, buttonVariants } from '../ui/button';
import { useAuth, UserRole } from '@/context/AuthContext';
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, useSidebar } from '../ui/sidebar';


type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  subItems?: NavItem[];
}

const cashierNavItems: NavItem[] = [
    { href: '/pending', icon: Hourglass, label: 'Pending', exact: true },
    { href: '/endorsements', icon: FilePenLine, label: 'Endorsed' },
    { href: '/for-cv-issuance', icon: Banknote, label: 'For CV Issuance' },
    { href: '/released-cv', icon: PackageCheck, label: 'Released CV' },
    { href: '/liquidations/view', icon: Receipt, label: 'Liquidations'},
];

const liaisonNavItems: NavItem[] = [
    { href: '/endorsed-to-liaison', icon: SendToBack, label: 'Endorsed', exact: true },
    { href: '/for-ca-approval', icon: FileClock, label: 'For CA Approval' },
    { href: '/released-cv', icon: PackageCheck, label: 'Released CV' },
    { href: '/for-liquidation', icon: FileDiff, label: 'For Liquidation' },
    { href: '/completed', icon: FileCheck, label: 'Completed' },
];

const accountingNavItems: NavItem[] = [
    { href: '/for-ca-approval', icon: FileClock, label: 'For CA Approval', exact: true },
    { href: '/released-cv', icon: PackageCheck, label: 'Released CVs' },
    { href: '/for-verification', icon: FileSearch, label: 'For Verification' },
];


const commonNavItems: NavItem[] = [
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/support', icon: LifeBuoy, label: 'Support' },
];

const supervisorAndCashierCommonItems: NavItem[] = [
    { href: '/users', icon: Users, label: 'Users' },
]

const roleNavItems: Record<UserRole, NavItem[]> = {
    'Store Supervisor': cashierNavItems,
    'Cashier': cashierNavItems,
    'Liaison': liaisonNavItems,
    'Accounting': accountingNavItems,
};

const homeRoutes: Partial<Record<UserRole, string>> = {
    'Store Supervisor': '/pending',
    'Cashier': '/pending',
    'Liaison': '/endorsed-to-liaison',
    'Accounting': '/released-cv',
};

const NavLink = ({ item }: { item: NavItem; }) => {
    const pathname = usePathname();
    const { state: isCollapsed } = useSidebar();
    const isLinkActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

    if (item.subItems && item.subItems.length > 0) {
        const isChildActive = item.subItems.some(sub => sub.exact ? pathname === sub.href : pathname.startsWith(sub.href));
        return (
            <Collapsible defaultOpen={isChildActive}>
                <CollapsibleTrigger asChild>
                     <Button
                        variant={isChildActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2"
                    >
                        <span className="flex items-center gap-2 w-full">
                          <item.icon className="h-5 w-5 text-foreground" />
                          {isCollapsed !== 'collapsed' && <span className="flex-1 text-left text-foreground">{item.label}</span>}
                          {isCollapsed !== 'collapsed' && <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />}
                        </span>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 mt-1 space-y-1">
                    {item.subItems.map(subItem => (
                        <NavLink key={subItem.href} item={subItem} />
                    ))}
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={cn(
                            buttonVariants({ variant: isLinkActive ? "secondary" : "ghost", size: "default" }),
                            "w-full justify-start"
                        )}
                    >
                         <span className='flex items-center gap-2'>
                            <item.icon className="h-5 w-5 text-foreground" />
                            {isCollapsed !== 'collapsed' && <span className="text-foreground">{item.label}</span>}
                        </span>
                    </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    )
}

export function AppSidebar() {
  const { user } = useAuth();
  const { state: isCollapsed, toggleSidebar } = useSidebar();
  
  if (!user) return null;

  const accessibleNavItems = roleNavItems[user.role] || [];
  let accessibleCommonItems = commonNavItems;
  if(user.role === 'Store Supervisor' || user.role === 'Cashier') {
      accessibleCommonItems = [...supervisorAndCashierCommonItems, ...commonNavItems];
  }

  const homeRoute = homeRoutes[user.role] || '/';
  
  const mainNav = (
    <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between">
                <Link href={homeRoute} className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    {isCollapsed !== 'collapsed' && <span className="text-xl font-bold">LTO PORTAL</span>}
                </Link>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden sm:flex">
                    <PanelLeft className="h-5 w-5" />
                </Button>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <nav className="grid gap-2 px-2">
                 {accessibleNavItems.map((item) => <NavLink key={item.href} item={item} />)}
                 <hr className="my-4"/>
                 {accessibleCommonItems.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>
        </SidebarContent>
        <SidebarFooter>
            <div className='text-xs text-muted-foreground text-center'>
                 {isCollapsed !== 'collapsed' && <p>&copy; {new Date().getFullYear()} LTO Portal</p>}
            </div>
        </SidebarFooter>
    </Sidebar>
  );
  
  const mobileNav = (
     <nav className="grid gap-6 text-lg font-medium p-4">
        <Link
          href={homeRoute}
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">LTO Portal</span>
        </Link>
        {[...accessibleNavItems, ...accessibleCommonItems].map((item) => (
           <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
        ))}
      </nav>
  )

  return (
    <>
      <div className="hidden sm:block">
        {mainNav}
      </div>

      <div className="sm:hidden fixed top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0">
            {mobileNav}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
