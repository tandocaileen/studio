
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
import { Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidationFormDialog } from '@/components/liquidations/liquidation-form-dialog';


function ForLiquidationContent() {
    const { user } = useAuth();
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [cashAdvances, setCashAdvances] = React.useState<CashAdvance[] | null>(null);
    const [selectedMcForLiquidation, setSelectedMcForLiquidation] = React.useState<Motorcycle | null>(null);
    const { toast } = useToast();
    
    React.useEffect(() => {
        const fetchData = async () => {
            const [mcs, cas] = await Promise.all([getMotorcycles(), getCashAdvances()]);
            setMotorcycles(mcs);
            setCashAdvances(cas);
        };
        fetchData();
    }, []);

    const precomputedData = React.useMemo(() => {
        if (!motorcycles || !cashAdvances || !user) {
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

    }, [motorcycles, cashAdvances, user]);


    const { caMapByMcId, getMcAdvanceAmount } = precomputedData;


    const handleFinalSubmit = async (updatedMotorcycleData: Partial<Motorcycle>) => {
        if (!selectedMcForLiquidation || !motorcycles || !user) return;

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
        const updatedMotorcyclesData = await getMotorcycles();
        setMotorcycles(updatedMotorcyclesData);

        toast({
            title: 'Liquidation Submitted',
            description: `Liquidation for selected motorcycle has been submitted for review.`
        });
        setSelectedMcForLiquidation(null);
    }

    const handleSaveDetails = async (updatedMotorcycleData: Partial<Motorcycle>) => {
        if (!selectedMcForLiquidation || !motorcycles) return;

        const mcToUpdate = motorcycles.find(m => m.id === selectedMcForLiquidation.id);
        if (!mcToUpdate) return;
        
        const updatedMotorcycle: Motorcycle = { ...mcToUpdate, ...updatedMotorcycleData };

        await updateMotorcycles(updatedMotorcycle);
        const updatedMotorcyclesData = await getMotorcycles();
        setMotorcycles(updatedMotorcyclesData);
        
        setSelectedMcForLiquidation(updatedMotorcycle);

        toast({
            title: 'Details Saved',
            description: 'Your changes have been saved successfully.'
        });
    }
    
    if (!user || !motorcycles || !cashAdvances) {
        return <AppLoader />;
    }
    
    const motorcyclesToShow = motorcycles.filter(mc => 
        mc.status === 'For Liquidation' && mc.assignedLiaison === user.name
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Motorcycles for Liquidation</CardTitle>
                    <CardDescription>
                        Select a motorcycle to enter its liquidation details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Plate No.</TableHead>
                                <TableHead>CA Number</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {motorcyclesToShow.map(mc => {
                                const ca = caMapByMcId.get(mc.id);
                                if (!ca) return null;

                                return (
                                    <TableRow key={mc.id}>
                                        <TableCell>{mc.customerName}</TableCell>
                                        <TableCell>{mc.plateNumber}</TableCell>
                                        <TableCell>{ca.id}</TableCell>
                                        <TableCell className="text-right">₱{getMcAdvanceAmount(mc).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button size="sm" onClick={() => setSelectedMcForLiquidation(mc)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit/Liquidate
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    {motorcyclesToShow.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No motorcycles are pending liquidation.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
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
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <ForLiquidationContent />
                </main>
            </div>
        </ProtectedPage>
    );
}
