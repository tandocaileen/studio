
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useToast } from '@/hooks/use-toast';
import { getCashAdvances, getMotorcycles, updateMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AppLoader } from '@/components/layout/loader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidationFormDialog } from '@/components/liquidations/liquidation-form-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

type EnrichedCA = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
};

function ForLiquidationContent({ searchQuery }: { searchQuery: string }) {
    const { user } = useAuth();
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [cashAdvances, setCashAdvances] = React.useState<CashAdvance[] | null>(null);
    const [selectedMcForLiquidation, setSelectedMcForLiquidation] = React.useState<Motorcycle | null>(null);
    const [viewingCa, setViewingCa] = React.useState<EnrichedCA | null>(null);
    const { toast } = useToast();
    
    React.useEffect(() => {
        const fetchData = async () => {
            const [mcs, cas] = await Promise.all([getMotorcycles(), getCashAdvances()]);
            console.log('[For Liquidation] Fetched Motorcycles:', mcs);
            console.log('[For Liquidation] Fetched Cash Advances:', cas);
            setMotorcycles(mcs);
            setCashAdvances(cas);
        };
        fetchData();
    }, []);

    const refreshData = async () => {
        const [mcs, cas] = await Promise.all([getMotorcycles(), getCashAdvances()]);
        setMotorcycles(mcs);
        setCashAdvances(cas);
    }
    
    const precomputedData = React.useMemo(() => {
        if (!motorcycles || !cashAdvances) {
            return {
                caMapByMcId: new Map(),
                getMcAdvanceAmount: () => 0,
            };
        }

        const caMapByMcId = new Map<string, CashAdvance>();
        cashAdvances.forEach(ca => {
            if (ca.motorcycleIds) {
                ca.motorcycleIds.forEach(mcId => {
                    caMapByMcId.set(mcId, ca);
                });
            }
        });

        const getMcAdvanceAmount = (mc: Motorcycle): number => {
            const ca = caMapByMcId.get(mc.id);
            if (!ca || !ca.motorcycleIds) return (mc.processingFee || 0) + (mc.orFee || 0);
            return ca.amount / ca.motorcycleIds.length;
        };

        return { caMapByMcId, getMcAdvanceAmount };

    }, [motorcycles, cashAdvances]);

    const { caMapByMcId, getMcAdvanceAmount } = precomputedData;

    const handleFinalSubmit = async (updatedMotorcycleData: Partial<Motorcycle>) => {
        if (!selectedMcForLiquidation || !motorcycles || !user || !viewingCa) return;

        const mcToUpdate = motorcycles.find(m => m.id === selectedMcForLiquidation.id);
        if (!mcToUpdate) return;
        
        const mcAdvance = getMcAdvanceAmount(mcToUpdate);
        const totalLiquidation = (updatedMotorcycleData.liquidationDetails?.ltoOrAmount || 0) + (updatedMotorcycleData.liquidationDetails?.ltoProcessFee || 0);

        const updatedMotorcycle: Motorcycle = {
            ...mcToUpdate,
            ...updatedMotorcycleData,
            status: 'For Verification',
            liquidationDetails: {
                ...mcToUpdate.liquidationDetails,
                ...updatedMotorcycleData.liquidationDetails!,
                totalLiquidation: totalLiquidation,
                shortageOverage: mcAdvance - totalLiquidation,
                liquidatedBy: user.name,
                liquidationDate: new Date(),
                parentCaId: caMapByMcId.get(mcToUpdate.id)!.id,
            }
        };
        
        await updateMotorcycles(updatedMotorcycle);
        
        // Refresh all data
        await refreshData();
        
        // Find the updated CA and motorcycles to refresh the dialog view
        const updatedViewingCa = {
            ...viewingCa,
            motorcycles: viewingCa.motorcycles.map(m => m.id === updatedMotorcycle.id ? updatedMotorcycle : m)
        };
        setViewingCa(updatedViewingCa);

        toast({
            title: 'Liquidation Submitted',
            description: `Liquidation for selected motorcycle has been submitted for review.`
        });
        setSelectedMcForLiquidation(null);
    }

    const handleSaveDetails = async (updatedMotorcycleData: Partial<Motorcycle>) => {
        if (!selectedMcForLiquidation || !motorcycles || !viewingCa) return;

        const mcToUpdate = motorcycles.find(m => m.id === selectedMcForLiquidation.id);
        if (!mcToUpdate) return;
        
        const updatedMotorcycle: Motorcycle = { ...mcToUpdate, ...updatedMotorcycleData };
        
        await updateMotorcycles(updatedMotorcycle);
        const updatedMotorcyclesData = await getMotorcycles();
        setMotorcycles(updatedMotorcyclesData);
        
        const updatedViewingCa = {
            ...viewingCa,
            motorcycles: viewingCa.motorcycles.map(m => m.id === updatedMotorcycle.id ? updatedMotorcycle : m)
        };
        setViewingCa(updatedViewingCa);

        toast({
            title: 'Details Saved',
            description: 'Your changes have been saved successfully.'
        });
    }

    if (!user || !motorcycles || !cashAdvances) {
        return <AppLoader />;
    }
    
    // Get all CAs with a CV
    const casForLiquidation = cashAdvances.filter(ca => ca.checkVoucherNumber);

    console.log("[For Liquidation] CAs for Liquidation:", casForLiquidation);
    
    const enrichedCAs: EnrichedCA[] = casForLiquidation
        .map(ca => {
            const associatedMotorcycles = (ca.motorcycleIds || [])
                .map(id => motorcycles.find(m => m.id === id))
                .filter((m): m is Motorcycle => !!m);
            return { cashAdvance: ca, motorcycles: associatedMotorcycles };
        })
        .filter(item => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            if (item.cashAdvance.id.toLowerCase().includes(query)) return true;
            if (item.cashAdvance.checkVoucherNumber?.toLowerCase().includes(query)) return true;
            if (item.motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
            return false;
        });
    
    console.log("[For Liquidation] Enriched CAs to show:", enrichedCAs);

    const handleViewAndLiquidate = (enrichedCa: EnrichedCA) => {
        setViewingCa(enrichedCa);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Cash Advances for Liquidation</CardTitle>
                    <CardDescription>
                        Select a cash advance to view its motorcycles and perform liquidation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>CA Code</TableHead>
                                <TableHead>CV Number</TableHead>
                                <TableHead>CV Transaction Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrichedCAs.map(item => (
                                <TableRow key={item.cashAdvance.id}>
                                    <TableCell>{item.cashAdvance.id}</TableCell>
                                    <TableCell>{item.cashAdvance.checkVoucherNumber}</TableCell>
                                    <TableCell>
                                        {item.cashAdvance.checkVoucherReleaseDate
                                            ? format(new Date(item.cashAdvance.checkVoucherReleaseDate), 'MMMM dd, yyyy')
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ₱{item.cashAdvance.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => handleViewAndLiquidate(item)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View & Liquidate
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {enrichedCAs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No cash advances are pending liquidation.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!viewingCa} onOpenChange={(open) => !open && setViewingCa(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Liquidate Cash Advance: {viewingCa?.cashAdvance.id}</DialogTitle>
                        <DialogDescription>
                            Select a motorcycle to enter its liquidation details.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingCa && (
                        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Plate No.</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewingCa.motorcycles.map(mc => {
                                    return (
                                        <TableRow key={mc.id}>
                                            <TableCell>{mc.customerName}</TableCell>
                                            <TableCell>{mc.plateNumber}</TableCell>
                                            <TableCell>{mc.status}</TableCell>
                                            <TableCell className="text-right">₱{getMcAdvanceAmount(mc).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Button size="sm" onClick={() => setSelectedMcForLiquidation(mc)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    {mc.status === 'For Liquidation' ? 'Edit/Liquidate' : 'View Details'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        </ScrollArea>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingCa(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {selectedMcForLiquidation && caMapByMcId.get(selectedMcForLiquidation.id) && (
             <LiquidationFormDialog 
                motorcycle={selectedMcForLiquidation}
                cashAdvance={caMapByMcId.get(selectedMcForLiquidation.id)!}
                isOpen={!!selectedMcForLiquidation}
                onClose={() => setSelectedMcForLiquidation(null)}
                onLiquidate={handleFinalSubmit}
                onSaveDetails={handleSaveDetails}
                getMcAdvanceAmount={getMcAdvanceAmount}
             />
           )}
        </>
    );
}

export default function ForLiquidationPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    return (
        <ProtectedPage allowedRoles={['Liaison']}>
            <div className="w-full">
                <Header title="For Liquidation" onSearch={setSearchQuery} />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <ForLiquidationContent searchQuery={searchQuery} />
                </main>
            </div>
        </ProtectedPage>
    );
}
