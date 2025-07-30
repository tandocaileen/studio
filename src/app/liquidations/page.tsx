
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
import { CheckCircle, Eye, FileUp, Circle, FileDown, AlertCircle, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ITEMS_PER_PAGE = 5;

type ViewMode = 'motorcycle' | 'ca';
type MotorcycleViewFilter = 'pending' | 'review';
type CAViewFilter = 'all' | 'pending' | 'partially' | 'fully';

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

function LiquidationsContent() {
    const { user } = useAuth();
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [cashAdvances, setCashAdvances] = React.useState<CashAdvance[] | null>(null);
    
    const [viewMode, setViewMode] = React.useState<ViewMode>('motorcycle');
    const [selectedCA, setSelectedCA] = React.useState<GroupedLiquidation | null>(null);
    const [formData, setFormData] = React.useState<LiquidationFormData>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    // Filters and Pagination
    const [isFilterPanelVisible, setIsFilterPanelVisible] = React.useState(true);
    const [activeMcStatusFilters, setActiveMcStatusFilters] = React.useState<MotorcycleViewFilter[]>(['pending']);
    const [tempMcStatusFilters, setTempMcStatusFilters] = React.useState<MotorcycleViewFilter[]>(['pending']);
    const [caFilter, setCaFilter] = React.useState<CAViewFilter>('all');
    const [currentPageCA, setCurrentPageCA] = React.useState(1);

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

    const precomputedData = React.useMemo(() => {
        if (!motorcycles || !cashAdvances || !user) {
            return {
                caMapByMcId: new Map(),
                getMcAdvanceAmount: () => 0,
                allMotorcyclesForView: [],
            };
        }

        const isLiaison = user.role === 'Liaison';

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

        const allMotorcyclesForView = motorcycles.filter(mc => {
            const ca = caMapByMcId.get(mc.id);
            if (!ca) return false;
            
            const isRelevantCAStatus = ['CV Received', 'Liquidated', 'Processing', 'For Review'].includes(ca.status);
            if (!isRelevantCAStatus && mc.status !== 'Processing') return false;
            
            if (isLiaison && ca.personnel !== user.name) return false;
            
            return true;
        });

        return { caMapByMcId, getMcAdvanceAmount, allMotorcyclesForView };

    }, [motorcycles, cashAdvances, user]);


    const { caMapByMcId, getMcAdvanceAmount, allMotorcyclesForView } = precomputedData;

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
        if (!selectedCA || !motorcycles || !user) return;
        setIsSubmitting(true);

        const mcToUpdateId = selectedCA.motorcycles[0].id;
        const formDetails = formData[mcToUpdateId];

        const mcToUpdate = motorcycles.find(m => m.id === mcToUpdateId);
        if (!mcToUpdate) {
            setIsSubmitting(false);
            return;
        }

        const updatedMotorcycle: Motorcycle = {
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
                liquidatedBy: user.name,
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
        setIsSubmitting(false);
    }
    
    if (!user || !motorcycles || !cashAdvances) {
        return <AppLoader />;
    }

    const isLiaison = user.role === 'Liaison';
    const canSeeFilters = !isLiaison;

    // MC Tab Filter Logic
    const motorcyclesToShow = allMotorcyclesForView.filter(mc => {
        if (isLiaison) {
             const ca = caMapByMcId.get(mc.id);
             return ca?.personnel === user.name && (mc.status === 'Processing' || ca?.status === 'CV Received') && !mc.liquidationDetails;
        }
        
        if (activeMcStatusFilters.length === 0) return true;
        
        const isPending = (mc.status === 'Processing' || caMapByMcId.get(mc.id)?.status === 'CV Received') && !mc.liquidationDetails;
        const isForReview = mc.status === 'For Review';

        if(activeMcStatusFilters.includes('pending') && isPending) return true;
        if(activeMcStatusFilters.includes('review') && isForReview) return true;
        
        return false;
    });

    const handleMcStatusCheckboxChange = (status: MotorcycleViewFilter, checked: boolean) => {
        setTempMcStatusFilters(prev => checked ? [...prev, status] : prev.filter(s => s !== status));
    };

    const applyMcFilters = () => {
        setActiveMcStatusFilters(tempMcStatusFilters);
    };

    const clearMcFilters = () => {
        setTempMcStatusFilters([]);
        setActiveMcStatusFilters([]);
    };
    
    // CA Tab Filter & Pagination Logic
    const groupedItems: GroupedLiquidation[] = cashAdvances
        .filter(ca => {
            if (!ca.motorcycleIds || ca.motorcycleIds.length === 0) return false;
            const hasRelevantStatus = ['CV Received', 'Liquidated', 'For Review', 'Processing'].some(status => ca.status === status || (motorcycles.find(m => m.id === ca.motorcycleIds![0])?.status === status));
             if (isLiaison && ca.personnel !== user.name) return false;
            return hasRelevantStatus;
        })
        .map(ca => {
            const associatedMotorcycles = ca.motorcycleIds!.map(id => motorcycles.find(m => m.id === id)).filter(Boolean) as Motorcycle[];
            return { cashAdvance: ca, motorcycles: associatedMotorcycles };
        })
        .filter(group => {
            if (!canSeeFilters || caFilter === 'all') return true;

            const totalCount = group.motorcycles.length;
            const liquidatedCount = group.motorcycles.filter(m => m.status === 'For Review' || !!m.liquidationDetails).length;

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
    
    const singleMcFormData = selectedCA ? formData[selectedCA.motorcycles[0].id] : null;
    const totalLiquidation = (singleMcFormData?.ltoOrAmount || 0) + (singleMcFormData?.ltoProcessFee || 0);
    const singleMcAdvance = selectedCA ? getMcAdvanceAmount(selectedCA.motorcycles[0]) : 0;
    const shortageOverage = singleMcAdvance - totalLiquidation;

    return (
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
           <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
               <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="motorcycle">By Motorcycle</TabsTrigger>
                        <TabsTrigger value="ca">By Cash Advance</TabsTrigger>
                    </TabsList>
                    {canSeeFilters && viewMode === 'motorcycle' && (
                        <Button className="ml-auto" variant="outline" onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}>
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    )}
               </div>
                <TabsContent value="motorcycle">
                    <div className={cn("grid grid-cols-1 gap-6 items-start", canSeeFilters && "lg:grid-cols-4")}>
                         <div className={cn("lg:col-span-4", canSeeFilters && isFilterPanelVisible && "lg:col-span-3")}>
                           <Card>
                               <CardHeader>
                                   <CardTitle>Motorcycles for Liquidation</CardTitle>
                                   <CardDescription>
                                        {isLiaison 
                                            ? "Motorcycles assigned to you that are ready for liquidation."
                                            : "View all motorcycles pending or under review for liquidation."
                                        }
                                   </CardDescription>
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
                                                
                                                const isForReview = mc.status === 'For Review';
                                                const canLiquidate = (ca.status === 'CV Received' || mc.status === 'Processing') && !isForReview && !mc.liquidationDetails;

                                                return (
                                                    <TableRow key={mc.id}>
                                                        <TableCell>{mc.customerName}</TableCell>
                                                        <TableCell>{mc.plateNumber}</TableCell>
                                                        <TableCell>{ca.id}</TableCell>
                                                        <TableCell>{ca.personnel}</TableCell>
                                                        <TableCell className="text-right">₱{getMcAdvanceAmount(mc).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={isForReview ? 'default' : 'outline'}>
                                                                {isForReview ? "For Review" : "Pending Liquidation"}
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
                        </div>
                        {canSeeFilters && isFilterPanelVisible && (
                             <div className="lg:col-span-1 lg:sticky top-20">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Filters</CardTitle>
                                        <CardDescription>Refine motorcycles</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <Collapsible defaultOpen>
                                            <CollapsibleTrigger className="flex justify-between items-center w-full [&[data-state=open]>svg]:rotate-180">
                                                <Label className="font-semibold text-sm">Status</Label>
                                                <ChevronDown className="h-4 w-4 transition-transform" />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="grid gap-2 pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox id="filter-mc-pending" checked={tempMcStatusFilters.includes('pending')} onCheckedChange={(c) => handleMcStatusCheckboxChange('pending', !!c)} />
                                                        <Label htmlFor="filter-mc-pending" className="font-normal text-sm">Pending Liquidation</Label>
                                                    </div>
                                                     <div className="flex items-center gap-2">
                                                        <Checkbox id="filter-mc-review" checked={tempMcStatusFilters.includes('review')} onCheckedChange={(c) => handleMcStatusCheckboxChange('review', !!c)} />
                                                        <Label htmlFor="filter-mc-review" className="font-normal text-sm">For Review</Label>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-2">
                                        <Button onClick={applyMcFilters} className="w-full">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply Filters
                                        </Button>
                                        <Button onClick={clearMcFilters} variant="ghost" className="w-full">
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Clear
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="ca">
                     <Card>
                        <CardHeader>
                            <CardTitle>Cash Advance Liquidations</CardTitle>
                            <CardDescription>View liquidation status grouped by cash advance.</CardDescription>
                             {canSeeFilters && (
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
                             )}
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {paginatedCaItems.map((group) => {
                                    const totalCount = group.motorcycles.length;
                                    const liquidatedCount = group.motorcycles.filter(m => m.status === 'For Review' || !!m.liquidationDetails).length;
                                    const isFullyLiquidated = liquidatedCount === totalCount;
                                    const isPartiallyLiquidated = liquidatedCount > 0 && !isFullyLiquidated;
                                    
                                    let statusLabel = "Pending";
                                    let statusIcon = <Circle className="mr-2 h-4 w-4 text-amber-500" />;

                                    if(isFullyLiquidated) {
                                        statusLabel = "Fully Liquidated";
                                        statusIcon = <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
                                    } else if (isPartiallyLiquidated) {
                                        statusLabel = "Partially Liquidated";
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
                                                            {statusIcon} {statusLabel} ({liquidatedCount}/{totalCount})
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
                        <Button onClick={handleFinalSubmit} loading={isSubmitting}>Submit Liquidation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}


export default function LiquidationsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Liquidations & Reports" onSearch={setSearchQuery} />
                    <LiquidationsContent />
                </div>
            </div>
        </ProtectedPage>
    );
}

    

    

    