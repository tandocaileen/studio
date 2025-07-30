
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { ProtectedPage } from "@/components/auth/protected-page";
import { getCashAdvances, getMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type CAViewFilter = 'all' | 'pending' | 'partially' | 'fully';

type GroupedLiquidation = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
};

const ITEMS_PER_PAGE = 5;

function LiquidationsContent() {
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [cashAdvances, setCashAdvances] = React.useState<CashAdvance[] | null>(null);
    
    // Filters and Pagination
    const [caFilter, setCaFilter] = React.useState<CAViewFilter>('all');
    const [currentPageCA, setCurrentPageCA] = React.useState(1);
    const router = useRouter();

    React.useEffect(() => {
        const fetchData = async () => {
            const [mcs, cas] = await Promise.all([getMotorcycles(), getCashAdvances()]);
            setMotorcycles(mcs);
            setCashAdvances(cas);
        };
        fetchData();
    }, []);

    if (!motorcycles || !cashAdvances) {
        return <AppLoader />;
    }
    
    // CA Tab Filter & Pagination Logic
    const groupedItems: GroupedLiquidation[] = cashAdvances
        .filter(ca => {
            if (!ca.motorcycleIds || ca.motorcycleIds.length === 0) return false;
            const associatedMotorcycles = ca.motorcycleIds
                .map(id => motorcycles.find(m => m.id === id))
                .filter((m): m is Motorcycle => !!m);
            return associatedMotorcycles.some(m => m.status === 'For Liquidation' || m.status === 'For Verification' || m.status === 'Completed');
        })
        .map(ca => {
            const associatedMotorcycles = ca.motorcycleIds!.map(id => motorcycles.find(m => m.id === id)).filter(Boolean) as Motorcycle[];
            return { cashAdvance: ca, motorcycles: associatedMotorcycles };
        })
        .filter(group => {
            if (caFilter === 'all') return true;

            const totalCount = group.motorcycles.length;
            const liquidatedCount = group.motorcycles.filter(m => m.status === 'For Verification' || m.status === 'Completed').length;

            if (caFilter === 'fully') return liquidatedCount === totalCount;
            if (caFilter === 'partially') return liquidatedCount > 0 && liquidatedCount < totalCount;
            if (caFilter === 'pending') return liquidatedCount === 0;

            return true;
        });

    const totalPagesCA = Math.ceil(groupedItems.length / ITEMS_PER_PAGE);
    const paginatedCaItems = groupedItems.slice(
        (currentPageCA - 1) * ITEMS_PER_PAGE,
        currentPageCA * ITEMS_PER_PAGE
    );
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cash Advance Liquidations</CardTitle>
                <CardDescription>View liquidation status grouped by cash advance.</CardDescription>
                <div className="pt-2">
                    <Select value={caFilter} onValueChange={(v) => setCaFilter(v as CAViewFilter)}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="partially">Partially Liquidated</SelectItem>
                            <SelectItem value="fully">Fully Liquidated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {paginatedCaItems.map((group) => {
                        const totalCount = group.motorcycles.length;
                        const liquidatedCount = group.motorcycles.filter(m => m.status === 'For Verification' || m.status === 'Completed').length;
                        const isFullyLiquidated = liquidatedCount === totalCount;
                        const isPartiallyLiquidated = liquidatedCount > 0 && !isFullyLiquidated;
                        
                        let statusLabel = "Pending";
                        let statusClass = "bg-amber-100 text-amber-800 border-amber-300";

                        if(isFullyLiquidated) {
                            statusLabel = "Fully Liquidated";
                            statusClass = "bg-green-100 text-green-800 border-green-300";
                        } else if (isPartiallyLiquidated) {
                            statusLabel = "Partially Liquidated";
                            statusClass = "bg-blue-100 text-blue-800 border-blue-300";
                        }

                        return (
                            <Card key={group.cashAdvance.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">CA #{group.cashAdvance.id}</CardTitle>
                                            <CardDescription>{group.cashAdvance.purpose}</CardDescription>
                                            <CardDescription>Liaison: {group.cashAdvance.personnel} | Date: {new Date(group.cashAdvance.date).toLocaleDateString()}</CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant={'outline'} className={statusClass}>
                                                {statusLabel} ({liquidatedCount}/{totalCount})
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-end">
                                        <Button 
                                            onClick={() => router.push(`/reports/liquidation/${group.cashAdvance.id}`)}
                                            >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Full Report
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                        {groupedItems.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No cash advances found for the selected filter.</p>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground">
                        Showing {paginatedCaItems.length} of {groupedItems.length} cash advances.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageCA(prev => Math.max(prev - 1, 1))}
                            disabled={currentPageCA === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPageCA} of {totalPagesCA}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageCA(prev => Math.min(prev + 1, totalPagesCA))}
                            disabled={currentPageCA === totalPagesCA}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
            </Card>
    );
}


export default function LiquidationsViewPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
            <div className='w-full'>
                <Header title="Liquidations & Reports" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <LiquidationsContent />
                </main>
            </div>
        </ProtectedPage>
    );
}
