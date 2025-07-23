
'use client';

import Link from 'next/link';
import {
  Home,
  Users,
  Package,
  Settings,
  DollarSign,
  PanelLeft,
  LifeBuoy,
  Receipt,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Logo } from '@/components/icons';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/cash-advances', icon: DollarSign, label: 'Cash Advances' },
  { href: '/liquidations', icon: Receipt, label: 'Liquidations' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/support', icon: LifeBuoy, label: 'Support' },
];

export function AppSidebar() {
  const pathname = usePathname();

  const mainNav = (
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      <Link
        href="#"
        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
      >
        <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
        <span className="sr-only">MotoTrack Financials</span>
      </Link>
      {navItems.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                pathname === item.href && 'bg-accent text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        {mainNav}
      </aside>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">MotoTrack Financials</span>
              </Link>
              {navItems.map((item) => (
                 <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                      pathname === item.href && 'text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
