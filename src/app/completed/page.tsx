
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from "@/components/auth/protected-page";
import { getCashAdvances, getMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AppLoader } from '@/components/layout/loader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

function CompletedContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);

    React.useEffect(() => {
        if(user) {
            getMotorcycles().then(allMCs => {
                const completed = allMCs.filter(mc => mc.status === 'Completed' && mc.assignedLiaison === user.name);
                setMotorcycles(completed);
            });
        }
    }, [user]);

    if (!user || !motorcycles) {
        return <AppLoader />;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Completed Transactions</CardTitle>
                <CardDescription>
                    A log of all your verified and completed liquidations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Plate No.</TableHead>
                            <TableHead>CA Number</TableHead>
                            <TableHead>LTO OR Number</TableHead>
                            <TableHead className="text-right">Amount Liquidated</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {motorcycles.map(mc => (
                            <TableRow key={mc.id}>
                                <TableCell>{mc.customerName}</TableCell>
                                <TableCell>{mc.plateNumber}</TableCell>
                                <TableCell>{mc.liquidationDetails?.parentCaId}</TableCell>
                                <TableCell>{mc.liquidationDetails?.ltoOrNumber}</TableCell>
                                <TableCell className="text-right">
                                    ₱{mc.liquidationDetails?.totalLiquidation.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Button size="sm" variant="outline" onClick={() => router.push(`/reports/liquidation/${mc.liquidationDetails?.parentCaId}`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Report
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {motorcycles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No completed transactions found.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default function CompletedPage() {
    return (
        <ProtectedPage allowedRoles={['Liaison']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Completed Liquidations" />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <CompletedContent />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
