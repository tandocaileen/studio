
'use client';

import * as React from 'react';
import { getCashAdvances, getMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Eye, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ProtectedPage } from '@/components/auth/protected-page';


type LiquidationStatus = 'Fully Liquidated' | 'Partially Liquidated';

type GroupedCashAdvance = {
  cashAdvance: CashAdvance;
  motorcycles: Motorcycle[];
  liquidationStatus: LiquidationStatus | 'Pending';
};

export function ForVerificationContent({ searchQuery }: { searchQuery: string }) {
  const [allCAs, setAllCAs] = React.useState<CashAdvance[] | null>(null);
  const [allMotorcycles, setAllMotorcycles] = React.useState<Motorcycle[] | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      const [cas, mcs] = await Promise.all([getCashAdvances(), getMotorcycles()]);
      setAllCAs(cas);
      setAllMotorcycles(mcs);
    };
    fetchData();
  }, []);

  if (!user || !allCAs || !allMotorcycles) {
    return <AppLoader />;
  }

  const groupedCAs: GroupedCashAdvance[] = allCAs
    .map(ca => {
      const motorcycles = (ca.motorcycleIds || [])
        .map(id => allMotorcycles.find(m => m.id === id))
        .filter((m): m is Motorcycle => !!m);
      
      const totalCount = motorcycles.length;
      const liquidatedCount = motorcycles.filter(m => m.status === 'For Verification').length;

      let liquidationStatus: GroupedCashAdvance['liquidationStatus'];
      if (totalCount > 0 && liquidatedCount === totalCount) {
        liquidationStatus = 'Fully Liquidated';
      } else if (liquidatedCount > 0) {
        liquidationStatus = 'Partially Liquidated';
      } else {
        liquidationStatus = 'Pending';
      }

      return { cashAdvance: ca, motorcycles, liquidationStatus };
    })
    .filter(group => {
       if (group.liquidationStatus === 'Pending') return false; 

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (group.cashAdvance.id.toLowerCase().includes(query)) return true;
            if (group.cashAdvance.personnel.toLowerCase().includes(query)) return true;
            if (group.motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
            return false;
        }

        return true;
    });

  return (
    <Card>
        <CardHeader>
            <CardTitle>Cash Advance Verification</CardTitle>
            <CardDescription>Review and verify fully liquidated cash advances.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CA Number</TableHead>
                        <TableHead>Liaison</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedCAs.map(({ cashAdvance, liquidationStatus }) => (
                        <TableRow key={cashAdvance.id}>
                            <TableCell className="font-medium">{cashAdvance.id}</TableCell>
                            <TableCell>{cashAdvance.personnel}</TableCell>
                            <TableCell>{format(new Date(cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>₱{cashAdvance.amount.toLocaleString()}</TableCell>
                            <TableCell>{cashAdvance.motorcycleIds?.length || 0}</TableCell>
                            <TableCell>
                                <Badge variant={liquidationStatus === 'Fully Liquidated' ? 'default' : 'outline'}>
                                    {liquidationStatus}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                                <Button 
                                    size="sm"
                                    onClick={() => router.push(`/reports/liquidation/${cashAdvance.id}`)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Report
                                </Button>
                                <Button 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/verify/${cashAdvance.id}`)}
                                    disabled={liquidationStatus !== 'Fully Liquidated'}
                                >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Verify
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {groupedCAs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No cash advances match the current filters.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
}

export default function ForVerificationPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    return (
        <ProtectedPage allowedRoles={['Accounting']}>
             <div className="w-full">
                <Header title="For Verification" onSearch={setSearchQuery}/>
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <ForVerificationContent searchQuery={searchQuery} />
                </main>
            </div>
        </ProtectedPage>
    )
}
