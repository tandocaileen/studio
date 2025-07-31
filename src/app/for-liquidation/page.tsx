
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
import { AlertCircle, ChevronDown, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidationFormDialog } from '@/components/liquidations/liquidation-form-dialog';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';


function ForLiquidationContent({ searchQuery }: { searchQuery: string }) {
    const { user } = useAuth();
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [cashAdvances, setCashAdvances] = React.useState<CashAdvance[] | null>(null);
    const [editingMotorcycle, setEditingMotorcycle] = React.useState<Motorcycle | null>(null);
    const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
    const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
    const { toast } = useToast();
    
    React.useEffect(() => {
        const fetchData = async () => {
            const [mcs, cas] = await Promise.all([getMotorcycles(), getCashAdvances()]);
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
        if (!editingMotorcycle || !motorcycles || !user) return;
        const caForMc = caMapByMcId.get(editingMotorcycle.id);
        if (!caForMc) return;

        const mcToUpdate = motorcycles.find(m => m.id === editingMotorcycle.id);
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
                parentCaId: caForMc.id,
            }
        };
        
        await updateMotorcycles(updatedMotorcycle);
        
        await refreshData();

        toast({
            title: 'Liquidation Submitted',
            description: `Liquidation for selected motorcycle has been submitted for review.`
        });
        setEditingMotorcycle(null);
    }

    const handleSaveDetails = async (updatedMotorcycleData: Partial<Motorcycle>) => {
        if (!editingMotorcycle || !motorcycles) return;

        const mcToUpdate = motorcycles.find(m => m.id === editingMotorcycle.id);
        if (!mcToUpdate) return;
        
        const updatedMotorcycle: Motorcycle = { ...mcToUpdate, ...updatedMotorcycleData };
        
        await updateMotorcycles(updatedMotorcycle);
        await refreshData();

        toast({
            title: 'Details Saved',
            description: 'Your changes have been saved successfully.'
        });
        setEditingMotorcycle(null);
    }

    if (!user || !motorcycles || !cashAdvances) {
        return <AppLoader />;
    }
    
    // Get all CAs with a CV
    const casForLiquidation = cashAdvances.filter(ca => ca.checkVoucherNumber);
    
    const enrichedCAs = casForLiquidation
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

    const isEligibleForLiquidation = (mc: Motorcycle) => {
        return mc.liquidationDetails?.ltoOrNumber &&
               mc.liquidationDetails?.ltoOrAmount > 0 &&
               mc.liquidationDetails?.ltoProcessFee > 0;
    };

    const handleSelectMotorcycle = (mc: Motorcycle) => {
        setSelectedMotorcycles(prev => {
            const isSelected = prev.some(m => m.id === mc.id);
            if (isSelected) {
                return prev.filter(m => m.id !== mc.id);
            } else {
                return [...prev, mc];
            }
        });
    };
    
    const handleBulkLiquidate = async () => {
        const mcsToLiquidate = selectedMotorcycles.filter(isEligibleForLiquidation);
        if (mcsToLiquidate.length === 0 || !user) return;
        
        const updatedMotorcycles = mcsToLiquidate.map(mc => {
             const mcAdvance = getMcAdvanceAmount(mc);
             const totalLiquidation = (mc.liquidationDetails?.ltoOrAmount || 0) + (mc.liquidationDetails?.ltoProcessFee || 0);
             const caForMc = caMapByMcId.get(mc.id);

            return {
                ...mc,
                status: 'For Verification' as const,
                liquidationDetails: {
                    ...mc.liquidationDetails!,
                    totalLiquidation: totalLiquidation,
                    shortageOverage: mcAdvance - totalLiquidation,
                    liquidatedBy: user.name,
                    liquidationDate: new Date(),
                    parentCaId: caForMc!.id,
                }
            };
        });
        
        await updateMotorcycles(updatedMotorcycles);
        
        toast({
            title: "Bulk Liquidation Submitted",
            description: `${updatedMotorcycles.length} motorcycles have been submitted for verification.`
        });
        
        setSelectedMotorcycles([]);
        setOpenConfirmDialog(false);
        await refreshData();
    };
    
    const selectedAndEligibleCount = selectedMotorcycles.filter(isEligibleForLiquidation).length;

    return (
        <>
            <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <div>
                        <CardTitle>Cash Advances for Liquidation</CardTitle>
                        <CardDescription>
                            Expand a cash advance to view its motorcycles and perform liquidation.
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setOpenConfirmDialog(true)} disabled={selectedAndEligibleCount === 0}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bulk Liquidate ({selectedAndEligibleCount})
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>CA Code</TableHead>
                                <TableHead>CV Number</TableHead>
                                <TableHead>CV Transaction Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrichedCAs.map(item => (
                                <Collapsible asChild key={item.cashAdvance.id}>
                                    <>
                                        <TableRow>
                                            <TableCell>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </TableCell>
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
                                        </TableRow>
                                        <CollapsibleContent asChild>
                                            <tr className="bg-muted/50">
                                                <TableCell colSpan={5} className="p-0">
                                                    <div className="p-4">
                                                        <Alert className="mb-4">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription className="text-xs">
                                                                You can only bulk-liquidate units where all required details (OR No., OR Amount, Processing Fee) have been filled in via the 'View/Edit' button.
                                                            </AlertDescription>
                                                        </Alert>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-12"></TableHead>
                                                                    <TableHead>Customer</TableHead>
                                                                    <TableHead>Plate No.</TableHead>
                                                                    <TableHead>Status</TableHead>
                                                                    <TableHead className="text-right">Amount</TableHead>
                                                                    <TableHead>Action</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {item.motorcycles.map(mc => (
                                                                    <TableRow key={mc.id}>
                                                                        <TableCell>
                                                                            <Checkbox
                                                                                disabled={mc.status === 'For Verification' || mc.status === 'Completed'}
                                                                                checked={selectedMotorcycles.some(m => m.id === mc.id)}
                                                                                onCheckedChange={() => handleSelectMotorcycle(mc)}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>{mc.customerName}</TableCell>
                                                                        <TableCell>{mc.plateNumber}</TableCell>
                                                                        <TableCell>
                                                                            <span className={cn(!isEligibleForLiquidation(mc) && "text-destructive font-semibold")}>
                                                                                {mc.status}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell className="text-right">₱{getMcAdvanceAmount(mc).toLocaleString()}</TableCell>
                                                                        <TableCell>
                                                                            <Button size="sm" variant="outline" onClick={() => setEditingMotorcycle(mc)}>
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                View/Edit
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </tr>
                                        </CollapsibleContent>
                                    </>
                                </Collapsible>
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
            
            {editingMotorcycle && caMapByMcId.get(editingMotorcycle.id) && (
             <LiquidationFormDialog 
                motorcycle={editingMotorcycle}
                cashAdvance={caMapByMcId.get(editingMotorcycle.id)!}
                isOpen={!!editingMotorcycle}
                onClose={() => setEditingMotorcycle(null)}
                onLiquidate={handleFinalSubmit}
                onSaveDetails={handleSaveDetails}
                getMcAdvanceAmount={getMcAdvanceAmount}
             />
           )}

           <AlertDialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Liquidation</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to submit {selectedAndEligibleCount} motorcycle(s) for verification. 
                            This action cannot be undone. Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkLiquidate}>Yes, Liquidate Selected</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
           </AlertDialog>
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
