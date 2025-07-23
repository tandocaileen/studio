
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LiquidationItem } from '@/app/liquidations/page';
import { ScrollArea } from '../ui/scroll-area';

type LiquidationTableProps = {
  items: LiquidationItem[];
};

export function LiquidationTable({ items }: LiquidationTableProps) {
  const { toast } = useToast();

  const handleLiquidate = (item: LiquidationItem) => {
    toast({
        title: 'Action Triggered',
        description: `Liquidate action for ${item.motorcycle?.plateNumber || item.cashAdvance.purpose}`
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>For Liquidation</CardTitle>
        <CardDescription>
          Review cash advances and attach receipts for liquidation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Engine Number</TableHead>
                <TableHead>Chassis Number</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Registration Fee</TableHead>
                <TableHead>Received CV (budget)</TableHead>
                <TableHead>Liquidate (with attachment)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.filter(item => item.cashAdvance.status === 'Approved').map(({ cashAdvance, motorcycle }) => (
                <TableRow key={cashAdvance.id}>
                    <TableCell>{motorcycle?.engineNumber || 'N/A'}</TableCell>
                    <TableCell>{motorcycle?.chassisNumber || 'N/A'}</TableCell>
                    <TableCell>{motorcycle ? `${motorcycle.make} ${motorcycle.model}` : 'N/A'}</TableCell>
                    <TableCell className="text-right">₱{cashAdvance.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₱{cashAdvance.amount.toLocaleString()}</TableCell>
                    <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleLiquidate({cashAdvance, motorcycle})}>
                        <FileUp className="mr-2 h-4 w-4" />
                        Liquidate
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
