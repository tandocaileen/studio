
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CashAdvance } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { AlertCircle } from 'lucide-react';

type OverdueAdvancesProps = {
  cashAdvances: CashAdvance[];
};

export function OverdueAdvances({ cashAdvances }: OverdueAdvancesProps) {
  const overdueAdvances = cashAdvances.filter(ca => {
    if (ca.status !== 'CV Received' || !ca.checkVoucherReleaseDate) {
      return false;
    }
    const daysSinceReceived = differenceInDays(new Date(), new Date(ca.checkVoucherReleaseDate));
    return daysSinceReceived > 5; // Overdue if not liquidated 5 days after receiving funds
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive" />
            Overdue Liquidation Alert
        </CardTitle>
        <CardDescription>
          These cash advances were marked as received over 5 days ago but have not yet been liquidated by the liaison.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {overdueAdvances.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Liaison</TableHead>
                <TableHead>CV Number</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueAdvances.map(ca => (
                <TableRow key={ca.id} className="bg-destructive/10">
                  <TableCell className="font-medium">{ca.personnel}</TableCell>
                  <TableCell>{ca.checkVoucherNumber}</TableCell>
                  <TableCell>
                    {ca.checkVoucherReleaseDate ? format(new Date(ca.checkVoucherReleaseDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">₱{ca.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {ca.checkVoucherReleaseDate ? differenceInDays(new Date(), new Date(ca.checkVoucherReleaseDate)) : 0} days
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
            <p>No overdue liquidations to show.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
