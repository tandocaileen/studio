'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Motorcycle, CashAdvance } from '@/types';
import { DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons';
import React from 'react';

type SummaryCardsProps = {
  motorcycles: Motorcycle[];
  cashAdvances: CashAdvance[];
};

export function SummaryCards({ motorcycles, cashAdvances }: SummaryCardsProps) {
  const totalMotorcycles = motorcycles.length;
  const expiringSoonCount = motorcycles.filter(m => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return m.documents.some(d => d.expiresAt && d.expiresAt < soon && d.expiresAt > new Date());
  }).length;
  
  const pendingAdvances = cashAdvances.filter(ca => ca.status === 'Pending').length;
  const totalPendingAmount = cashAdvances
    .filter(ca => ca.status === 'Pending' || ca.status === 'Approved')
    .reduce((sum, ca) => sum + ca.amount, 0);

  const summaryData = [
    {
      title: 'Total Motorcycles',
      value: totalMotorcycles,
      icon: MotorcycleIcon,
      color: 'text-primary',
    },
    {
      title: 'Expirations (30 days)',
      value: expiringSoonCount,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'Pending Advances',
      value: pendingAdvances,
      icon: DollarSign,
      color: 'text-amber-600',
    },
    {
      title: 'Total Pending Amount',
      value: `₱${totalPendingAmount.toLocaleString()}`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {summaryData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
