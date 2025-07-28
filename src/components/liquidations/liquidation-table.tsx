
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
import { FileUp, Eye, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import { CashAdvance, Motorcycle } from '@/types';
import { getMotorcycles } from '@/lib/data';
import { AppLoader } from '../layout/loader';


type GroupedLiquidation = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
}

type LiquidationTableProps = {
  items: GroupedLiquidation[];
};

type LiquidationFormData = {
    [motorcycleId: string]: {
        ltoOrNumber: string;
        ltoOrAmount: number;
        ltoProcessFee: number;
        totalLiquidation: number;
        shortageOverage: number;
        remarks: string;
        receiptFile?: File | null;
    }
}

export function LiquidationTable({ items }: LiquidationTableProps) {
  const [selectedCA, setSelectedCA] = React.useState<GroupedLiquidation | null>(null);
  const [formData, setFormData] = React.useState<LiquidationFormData>({});
  const { toast } = useToast();
  const router = useRouter();

  const handleLiquidateClick = (item: GroupedLiquidation) => {
    setSelectedCA(item);
    // Initialize form data for the dialog
    const initialFormData: LiquidationFormData = {};
    const singleMcAdvance = item.cashAdvance.amount / item.motorcycles.length;
    item.motorcycles.forEach(mc => {
      initialFormData[mc.id] = {
        ltoOrNumber: '',
        ltoOrAmount: 0,
        ltoProcessFee: 0,
        totalLiquidation: 0,
        shortageOverage: singleMcAdvance, // Assuming equal split for now
        remarks: '',
      };
    });
    setFormData(initialFormData);
  };
  
  const handleFormChange = (mcId: string, field: keyof LiquidationFormData[string], value: any) => {
      setFormData(prev => {
          const newMcData = { ...prev[mcId], [field]: value };
          const totalLiq = (newMcData.ltoOrAmount || 0) + (newMcData.ltoProcessFee || 0);
          const singleMcAdvance = (selectedCA?.cashAdvance.amount || 0) / (selectedCA?.motorcycles.length || 1);
          newMcData.totalLiquidation = totalLiq;
          newMcData.shortageOverage = singleMcAdvance - totalLiq;
          return { ...prev, [mcId]: newMcData };
      });
  }

  const handleFinalSubmit = () => {
     if (!selectedCA) return;
     console.log("Submitting Liquidation Data: ", formData);
     toast({
        title: 'Liquidation Submitted',
        description: `Liquidation for CA #${selectedCA.cashAdvance.id} has been submitted for review.`
    })
    setSelectedCA(null);
  }

  const grandTotalLiquidation = Object.values(formData).reduce((sum, data) => sum + data.totalLiquidation, 0);
  const grandTotalShortageOverage = (selectedCA?.cashAdvance.amount || 0) - grandTotalLiquidation;
  
  return (
    <>
    <div className="grid gap-4">
    {items.map((group) => {
        const isFullyLiquidated = group.cashAdvance.status === 'Liquidated';

        return (
            <Card key={group.cashAdvance.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">CA #{group.cashAdvance.id}</CardTitle>
                            <CardDescription>{group.cashAdvance.purpose}</CardDescription>
                            <CardDescription>Liaison: {group.cashAdvance.personnel} | Date: {new Date(group.cashAdvance.date).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="text-right">
                           <Badge variant={isFullyLiquidated ? 'default' : 'outline'}>
                                {isFullyLiquidated ? <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> : null}
                                {isFullyLiquidated ? 'Fully Liquidated' : 'Partially Liquidated'}
                            </Badge>
                             <p className="text-sm font-semibold mt-2">
                                ₱{(group.cashAdvance.totalLiquidation || 0).toLocaleString()} / ₱{group.cashAdvance.amount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Plate No.</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {group.motorcycles.map((motorcycle, index) => (
                                <TableRow key={`${motorcycle.id}-${index}`}>
                                    <TableCell>{motorcycle.customerName || 'N/A'}</TableCell>
                                    <TableCell>{motorcycle.plateNumber || 'N/A'}</TableCell>
                                    <TableCell>{motorcycle ? `${motorcycle.make} ${motorcycle.model}` : 'N/A'}</TableCell>
                                    <TableCell><Badge variant={group.cashAdvance.status === 'Liquidated' ? 'secondary' : 'outline'}>{group.cashAdvance.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <div className="flex justify-between mt-4">
                        <Button 
                            variant="outline"
                            onClick={() => handleLiquidateClick(group)}
                            disabled={isFullyLiquidated}
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Liquidate
                        </Button>
                        <Button 
                            onClick={() => router.push(`/reports/liquidation/${group.cashAdvance.id}`)}
                            disabled={!isFullyLiquidated}
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

    <Dialog open={!!selectedCA} onOpenChange={(open) => !open && setSelectedCA(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>Liquidate Cash Advance #{selectedCA?.cashAdvance.id}</DialogTitle>
                <DialogDescription>
                   {selectedCA?.cashAdvance.purpose}
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                <div className="py-4 grid gap-6">
                    {selectedCA?.motorcycles.map(mc => (
                        <div key={mc.id} className="grid gap-4 p-4 border rounded-lg bg-muted/40">
                             <h3 className="font-semibold">{mc.customerName} - {mc.plateNumber}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                      <Label htmlFor={`lto-or-number-${mc.id}`}>LTO OR Number</Label>
                                      <Input id={`lto-or-number-${mc.id}`} placeholder="Enter LTO OR number" value={formData[mc.id]?.ltoOrNumber} onChange={e => handleFormChange(mc.id, 'ltoOrNumber', e.target.value)} />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor={`lto-or-amount-${mc.id}`}>LTO OR Amount</Label>
                                      <Input id={`lto-or-amount-${mc.id}`} type="number" placeholder="0.00" value={formData[mc.id]?.ltoOrAmount || ''} onChange={e => handleFormChange(mc.id, 'ltoOrAmount', parseFloat(e.target.value) || 0)} />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor={`lto-process-fee-${mc.id}`}>LTO Process Fee</Label>
                                      <Input id={`lto-process-fee-${mc.id}`} type="number" placeholder="0.00" value={formData[mc.id]?.ltoProcessFee || ''} onChange={e => handleFormChange(mc.id, 'ltoProcessFee', parseFloat(e.target.value) || 0)} />
                                  </div>
                                   <div className="grid gap-2">
                                        <Label htmlFor={`shortage-overage-${mc.id}`}>Shortage / Overage</Label>
                                        <Input id={`shortage-overage-${mc.id}`} type="number" placeholder="0.00" disabled value={formData[mc.id]?.shortageOverage.toFixed(2)} className={cn('font-bold', (formData[mc.id]?.shortageOverage || 0) < 0 ? 'text-destructive' : 'text-green-600')} />
                                    </div>
                                   <div className="col-span-full grid gap-2">
                                      <Label htmlFor={`remarks-${mc.id}`}>Remarks</Label>
                                      <Textarea id={`remarks-${mc.id}`} placeholder="Add any remarks here..." value={formData[mc.id]?.remarks} onChange={e => handleFormChange(mc.id, 'remarks', e.target.value)} />
                                  </div>
                                  <div className="col-span-full grid gap-2">
                                      <Label htmlFor={`receipt-upload-${mc.id}`}>Upload Official Receipt</Label>
                                      <Input id={`receipt-upload-${mc.id}`} type="file" onChange={e => handleFormChange(mc.id, 'receiptFile', e.target.files ? e.target.files[0] : null)} />
                                  </div>
                              </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
             <div className="grid grid-cols-2 gap-4 mt-4 font-medium p-4 border rounded-lg">
                <div>
                    <p>Total CA Amount:</p>
                    <p>Total Liquidation:</p>
                    <p className={cn(grandTotalShortageOverage < 0 ? 'text-destructive' : 'text-green-600')}>Shortage / Overage:</p>
                </div>
                <div className="text-right">
                    <p>₱{(selectedCA?.cashAdvance.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p>₱{grandTotalLiquidation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className={cn(grandTotalShortageOverage < 0 ? 'text-destructive' : 'text-green-600')}>
                        ₱{grandTotalShortageOverage.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
             <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setSelectedCA(null)}>Cancel</Button>
                <Button onClick={handleFinalSubmit}>Submit Liquidation</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </>
  );
}


type LiquidationsContentProps = { 
    searchQuery: string 
};

type LiquidationStatusFilter = 'all' | 'unliquidated' | 'liquidated';


export function LiquidationsContent({ searchQuery }: LiquidationsContentProps) {
    const [items, setItems] = React.useState<GroupedLiquidation[] | null>(null);
    const [allMotorcycles, setAllMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [statusFilter, setStatusFilter] = React.useState<LiquidationStatusFilter>('unliquidated');


    React.useEffect(() => {
        Promise.all([getCashAdvances(), getMotorcycles()]).then(([cashAdvances, motorcycles]) => {
            const groupedItems: GroupedLiquidation[] = cashAdvances
            .filter(ca => ca.motorcycleIds && ca.motorcycleIds.length > 0)
            .map(ca => {
                const associatedMotorcycles = motorcycles.filter(mc => ca.motorcycleIds?.includes(mc.id));
                return { cashAdvance: ca, motorcycles: associatedMotorcycles };
            });
            setItems(groupedItems);
            setAllMotorcycles(motorcycles);
        });
    }, []);

    if (!items || !allMotorcycles) {
        return <AppLoader />;
    }

    const filteredBySearch = items.filter(item => {
        const { cashAdvance, motorcycles } = item;
        const query = searchQuery.toLowerCase();

        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;
        if (motorcycles.some(mc => mc.customerName?.toLowerCase().includes(query))) return true;
        if (motorcycles.some(mc => mc.plateNumber?.toLowerCase().includes(query))) return true;
        
        if (query === '') return true;

        return false;
    });

    const getFilteredByStatus = (data: GroupedLiquidation[]) => {
        switch(statusFilter) {
            case 'liquidated':
                return data.filter(i => i.cashAdvance.status === 'Liquidated');
            case 'unliquidated':
                 return data.filter(i => ['Approved', 'CV Received'].includes(i.cashAdvance.status));
            case 'all':
            default:
                return data.filter(i => ['Approved', 'CV Received', 'Liquidated'].includes(i.cashAdvance.status));
        }
    }

    const finalFilteredItems = getFilteredByStatus(filteredBySearch);


    return (
         <div className="grid gap-4">
             <div className="flex items-center gap-4">
                <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as LiquidationStatusFilter)}>
                    <TabsList>
                        <TabsTrigger value="unliquidated">For Liquidation</TabsTrigger>
                        <TabsTrigger value="liquidated">Liquidated</TabsTrigger>
                        <TabsTrigger value="all">View All</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <LiquidationTable items={finalFilteredItems} />
        </div>
    )
}

