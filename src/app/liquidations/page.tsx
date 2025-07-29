
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useToast } from '@/hooks/use-toast';
import { getCashAdvances, getMotorcycles, updateMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AppLoader } from '@/components/layout/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, FileUp, Circle, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';


type ViewMode = 'motorcycle' | 'ca';
type MotorcycleViewFilter = 'pending' | 'all';


type GroupedLiquidation = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
};

type LiquidationFormData = {
    [motorcycleId: string]: {
        ltoOrNumber: string;
        ltoOrAmount: number;
        ltoProcessFee: number;
        remarks: string;
        receiptFile?: File | null;
    }
}

export default function LiquidationsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const { user } = useAuth();
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [cashAdvances, setCashAdvances] = React.useState<CashAdvance[] | null>(null);
    const [viewMode, setViewMode] = React.useState<ViewMode>('motorcycle');
    const [motorcycleViewFilter, setMotorcycleViewFilter] = React.useState<MotorcycleViewFilter>('pending');
    const [selectedCA, setSelectedCA] = React.useState<GroupedLiquidation | null>(null);
    const [formData, setFormData] = React.useState<LiquidationFormData>({});
    const [isLoading, setIsLoading] = React.useState(false);

    const { toast } = useToast();
    const router = useRouter();
    
    React.useEffect(() => {
        const fetchData = async () => {
            const [mcs, cas] = await Promise.all([getMotorcycles(), getCashAdvances()]);
            setMotorcycles(mcs);
            setCashAdvances(cas);
        };
        fetchData();
    }, []);

    const handleLiquidateClick = (mc: Motorcycle, ca: CashAdvance) => {
        const grouped: GroupedLiquidation = {
            cashAdvance: ca,
            motorcycles: [mc]
        };
        setSelectedCA(grouped);
        
        const initialFormData: LiquidationFormData = {};
        initialFormData[mc.id] = {
            ltoOrNumber: '',
            ltoOrAmount: 0,
            ltoProcessFee: 0,
            remarks: ''
        };
        setFormData(initialFormData);
    };

    const handleFormChange = (mcId: string, field: keyof LiquidationFormData[string], value: any) => {
        setFormData(prev => ({ ...prev, [mcId]: { ...prev[mcId], [field]: value } }));
    }

    const handleFinalSubmit = async () => {
        if (!selectedCA || !motorcycles) return;
        setIsLoading(true);

        const mcToUpdateId = selectedCA.motorcycles[0].id;
        const formDetails = formData[mcToUpdateId];

        const mcToUpdate = motorcycles.find(m => m.id === mcToUpdateId);
        if (!mcToUpdate) {
            setIsLoading(false);
            return;
        }

        const updatedMotorcycle = {
            ...mcToUpdate,
            status: 'For Review',
            liquidationDetails: {
                parentCaId: selectedCA.cashAdvance.id,
                ltoOrNumber: formDetails.ltoOrNumber,
                ltoOrAmount: formDetails.ltoOrAmount,
                ltoProcessFee: formDetails.ltoProcessFee,
                totalLiquidation: formDetails.ltoOrAmount + formDetails.ltoProcessFee,
                shortageOverage: getMcAdvanceAmount(mcToUpdate) - (formDetails.ltoOrAmount + formDetails.ltoProcessFee),
                remarks: formDetails.remarks,
                liquidatedBy: user?.name || '',
                liquidationDate: new Date()
            }
        };
        
        await updateMotorcycles(updatedMotorcycle);
        const updatedMotorcyclesData = await getMotorcycles();
        setMotorcycles(updatedMotorcyclesData);

        toast({
            title: 'Liquidation Submitted',
            description: `Liquidation for selected motorcycle has been submitted for review.`
        });
        setSelectedCA(null);
        setIsLoading(false);
    }
    
    if (!user || !motorcycles || !cashAdvances) {
        return <AppLoader />;
    }

    const isLiaison = user.role === 'Liaison';

    const getMcAdvanceAmount = (mc: Motorcycle): number => {
        const ca = cashAdvances.find(c => c.motorcycleIds?.includes(mc.id));
        if (!ca || !ca.motorcycleIds) return (mc.processingFee || 0) + (mc.orFee || 0);
        return ca.amount / ca.motorcycleIds.length;
    };
    
    const singleMcFormData = selectedCA ? formData[selectedCA.motorcycles[0].id] : null;
    const totalLiquidation = (singleMcFormData?.ltoOrAmount || 0) + (singleMcFormData?.ltoProcessFee || 0);
    const singleMcAdvance = selectedCA ? getMcAdvanceAmount(selectedCA.motorcycles[0]) : 0;
    const shortageOverage = singleMcAdvance - totalLiquidation;

    // --- Performance Optimization: Create a map for quick CA lookups ---
    const caMapByMcId = new Map<string, CashAdvance>();
    cashAdvances.forEach(ca => {
        if (ca.motorcycleIds) {
            ca.motorcycleIds.forEach(mcId => {
                caMapByMcId.set(mcId, ca);
            });
        }
    });

    // Data for Motorcycle View
    const allMotorcyclesForLiaison = motorcycles.filter(mc => {
        const ca = caMapByMcId.get(mc.id);
        if (!ca) return false;
        
        const isRelevantCA = ['CV Received', 'Liquidated', 'Processing', 'For Review'].includes(ca.status);
        if (!isRelevantCA) return false;
        
        if (isLiaison && ca.personnel !== user.name) return false;
        
        return true;
    });

    const pendingLiquidationMotorcycles = allMotorcyclesForLiaison.filter(mc => {
        const ca = caMapByMcId.get(mc.id);
        if (!ca) return false;
        
        const isReadyForLiq = ['CV Received', 'Processing'].includes(ca.status);
        const isNotLiquidated = mc.status !== 'For Review' && mc.status !== 'Liquidated';

        return isReadyForLiq && isNotLiquidated;
    });

    const motorcyclesToShow = motorcycleViewFilter === 'pending' ? pendingLiquidationMotorcycles : allMotorcyclesForLiaison;

    // Data for CA View
    const groupedItems: GroupedLiquidation[] = cashAdvances
        .filter(ca => ca.motorcycleIds && ca.motorcycleIds.length > 0)
        .map(ca => {
            const associatedMotorcycles = ca.motorcycleIds!.map(id => motorcycles.find(m => m.id === id)).filter(Boolean) as Motorcycle[];
            return { cashAdvance: ca, motorcycles: associatedMotorcycles };
        });

    const filteredGroupedItems = groupedItems.filter(item => {
        return ['CV Received', 'Liquidated', 'Processing'].includes(item.cashAdvance.status) || item.motorcycles.some(m => m.status === 'For Review');
    });

    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Liquidations & Reports" onSearch={setSearchQuery} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
                           <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="motorcycle">By Motorcycle</TabsTrigger>
                                    <TabsTrigger value="ca">By Cash Advance</TabsTrigger>
                                </TabsList>
                                {user.role !== 'Liaison' && (
                                     <Button className="ml-auto" variant="outline">
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Generate Master Report
                                    </Button>
                                )}
                           </div>
                            <TabsContent value="motorcycle">
                               <Card>
                                   <CardHeader>
                                       <Tabs value={motorcycleViewFilter} onValueChange={(v) => setMotorcycleViewFilter(v as MotorcycleViewFilter)}>
                                            <TabsList>
                                                <TabsTrigger value="pending">Pending for Liquidation</TabsTrigger>
                                                <TabsTrigger value="all">View All</TabsTrigger>
                                            </TabsList>
                                       </Tabs>
                                   </CardHeader>
                                   <CardContent>
                                       <Table>
                                           <TableHeader>
                                               <TableRow>
                                                   <TableHead>Customer</TableHead>
                                                   <TableHead>Plate No.</TableHead>
                                                   <TableHead>CA Number</TableHead>
                                                   <TableHead>Liaison</TableHead>
                                                   <TableHead className="text-right">Amount</TableHead>
                                                   <TableHead>Status</TableHead>
                                                   <TableHead>Action</TableHead>
                                               </TableRow>
                                           </TableHeader>
                                           <TableBody>
                                                {motorcyclesToShow.map(mc => {
                                                    const ca = caMapByMcId.get(mc.id);
                                                    if (!ca) return null;
                                                    
                                                    const isLiquidated = mc.status === 'For Review';
                                                    const canLiquidate = ['CV Received', 'Processing'].includes(ca.status) && !isLiquidated;

                                                    return (
                                                        <TableRow key={mc.id}>
                                                            <TableCell>{mc.customerName}</TableCell>
                                                            <TableCell>{mc.plateNumber}</TableCell>
                                                            <TableCell>{ca.id}</TableCell>
                                                            <TableCell>{ca.personnel}</TableCell>
                                                            <TableCell className="text-right">₱{getMcAdvanceAmount(mc).toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={isLiquidated ? 'default' : 'outline'}>
                                                                    {isLiquidated ? "For Review" : "Processing"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {isLiaison && canLiquidate ? (
                                                                    <Button size="sm" onClick={() => handleLiquidateClick(mc, ca)}>
                                                                        <FileUp className="mr-2 h-4 w-4" />
                                                                        Liquidate
                                                                    </Button>
                                                                ) : (
                                                                    <Button size="sm" variant="ghost" disabled>
                                                                        -
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                           </TableBody>
                                       </Table>
                                       {motorcyclesToShow.length === 0 && (
                                           <div className="text-center py-12 text-muted-foreground">
                                               <p>No motorcycles found for the selected filter.</p>
                                           </div>
                                       )}
                                   </CardContent>
                               </Card>
                            </TabsContent>
                            <TabsContent value="ca">
                                 <div className="grid gap-4">
                                    {filteredGroupedItems.map((group) => {
                                        const liquidatedCount = group.motorcycles.filter(m => m.status === 'For Review').length;
                                        const isFullyLiquidated = liquidatedCount === group.motorcycles.length;
                                        const isPartiallyLiquidated = liquidatedCount > 0 && !isFullyLiquidated;
                                        
                                        let statusLabel = "Pending";
                                        let statusColor = "bg-amber-500";
                                        let statusIcon = <Circle className="mr-2 h-4 w-4 text-amber-500" />;

                                        if(isFullyLiquidated) {
                                            statusLabel = "Fully Liquidated";
                                            statusColor = "bg-green-500";
                                            statusIcon = <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
                                        } else if (isPartiallyLiquidated) {
                                            statusLabel = "Partially Liquidated";
                                            statusColor = "bg-blue-500";
                                            statusIcon = <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />;
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
                                                            <Badge variant={'outline'}>
                                                                {statusIcon} {statusLabel}
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
                                </div>
                            </TabsContent>
                       </Tabs>

                         <Dialog open={!!selectedCA} onOpenChange={(open) => !open && setSelectedCA(null)}>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Liquidate: {selectedCA?.motorcycles[0].customerName}</DialogTitle>
                                    <DialogDescription>
                                    CA: {selectedCA?.cashAdvance.id} | Plate: {selectedCA?.motorcycles[0].plateNumber}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="lto-or-number">LTO OR Number</Label>
                                            <Input id="lto-or-number" placeholder="Enter LTO OR number" value={singleMcFormData?.ltoOrNumber || ''} onChange={e => handleFormChange(selectedCA!.motorcycles[0].id, 'ltoOrNumber', e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lto-or-amount">LTO OR Amount</Label>
                                            <Input id="lto-or-amount" type="number" placeholder="0.00" value={singleMcFormData?.ltoOrAmount || ''} onChange={e => handleFormChange(selectedCA!.motorcycles[0].id, 'ltoOrAmount', parseFloat(e.target.value) || 0)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lto-process-fee">LTO Process Fee</Label>
                                            <Input id="lto-process-fee" type="number" placeholder="0.00" value={singleMcFormData?.ltoProcessFee || ''} onChange={e => handleFormChange(selectedCA!.motorcycles[0].id, 'ltoProcessFee', parseFloat(e.target.value) || 0)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="shortage-overage">Shortage / Overage</Label>
                                            <Input id="shortage-overage" type="number" placeholder="0.00" disabled value={shortageOverage.toFixed(2)} className={cn('font-bold', shortageOverage < 0 ? 'text-destructive' : 'text-green-600')} />
                                        </div>
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="remarks">Remarks</Label>
                                        <Textarea id="remarks" placeholder="Add any remarks here..." value={singleMcFormData?.remarks || ''} onChange={e => handleFormChange(selectedCA!.motorcycles[0].id, 'remarks', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="receipt-upload">Upload Official Receipt</Label>
                                        <Input id="receipt-upload" type="file" onChange={e => handleFormChange(selectedCA!.motorcycles[0].id, 'receiptFile', e.target.files ? e.target.files[0] : null)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedCA(null)}>Cancel</Button>
                                    <Button onClick={handleFinalSubmit} loading={isLoading}>Submit Liquidation</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
