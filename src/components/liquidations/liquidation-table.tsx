
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
import { FileUp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LiquidationItem } from '@/app/liquidations/page';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type LiquidationTableProps = {
  items: LiquidationItem[];
};

export function LiquidationTable({ items }: LiquidationTableProps) {
  const [selectedItem, setSelectedItem] = React.useState<LiquidationItem | null>(null);
  const [ltoOrAmount, setLtoOrAmount] = React.useState(0);
  const [ltoProcessFee, setLtoProcessFee] = React.useState(0);
  const [totalLiquidation, setTotalLiquidation] = React.useState(0);
  const [shortageOverage, setShortageOverage] = React.useState(0);
  const { toast } = useToast();

  const handleLiquidate = (item: LiquidationItem) => {
    setSelectedItem(item);
    setLtoOrAmount(0);
    setLtoProcessFee(0);
  }

  React.useEffect(() => {
    const totalLiq = ltoOrAmount + ltoProcessFee;
    setTotalLiquidation(totalLiq);

    if (selectedItem) {
        const shortage = selectedItem.cashAdvance.amount - totalLiq;
        setShortageOverage(shortage);
    }
  }, [ltoOrAmount, ltoProcessFee, selectedItem]);


  const handleFinalSubmit = () => {
     if (!selectedItem) return;
     toast({
        title: 'Liquidation Submitted',
        description: `Liquidation for ${selectedItem.motorcycle?.plateNumber || selectedItem.cashAdvance.purpose} has been submitted for review.`
    })
    setSelectedItem(null);
  }

  return (
    <>
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
                {items.filter(item => ['Approved', 'Encashed'].includes(item.cashAdvance.status)).map(({ cashAdvance, motorcycle }) => (
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

    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>Liquidate Cash Advance</DialogTitle>
                <DialogDescription>
                    Fill in the details for the liquidation of CA for {selectedItem?.motorcycle?.plateNumber || 'N/A'}.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                <div className="py-4 grid gap-8">
                     {/* Auto-generated Section */}
                    <div className="grid gap-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Cash Advance Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Account Code</Label>
                                <Input value="CA-LTO-001" disabled />
                            </div>
                             <div className="grid gap-2">
                                <Label>Customer Name</Label>
                                <Input value={selectedItem?.motorcycle?.customerName} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>OR Amount (from CA)</Label>
                                <Input value={selectedItem?.cashAdvance.amount.toLocaleString()} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>Processing Fee</Label>
                                <Input value={selectedItem?.motorcycle?.processingFee?.toLocaleString() || '1500'} disabled />
                            </div>
                             <div className="col-span-full grid gap-2">
                                <Label>Total Cash Advance</Label>
                                <Input className="font-bold text-lg" value={`₱${selectedItem?.cashAdvance.amount.toLocaleString()}`} disabled />
                            </div>
                        </div>
                    </div>

                    {/* Liquidation Input Section */}
                    <div className="grid gap-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Liquidation Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="lto-or-number">LTO OR Number</Label>
                                <Input id="lto-or-number" placeholder="Enter LTO OR number" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lto-or-amount">LTO OR Amount</Label>
                                <Input id="lto-or-amount" type="number" placeholder="0.00" value={ltoOrAmount || ''} onChange={(e) => setLtoOrAmount(parseFloat(e.target.value) || 0)} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="lto-process-fee">LTO Process Fee</Label>
                                <Input id="lto-process-fee" type="number" placeholder="0.00" value={ltoProcessFee || ''} onChange={(e) => setLtoProcessFee(parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="total-liquidation">Total Liquidation</Label>
                                <Input id="total-liquidation" type="number" placeholder="0.00" disabled value={totalLiquidation.toFixed(2)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shortage-overage">Shortage / Overage</Label>
                                <Input id="shortage-overage" type="number" placeholder="0.00" disabled value={shortageOverage.toFixed(2)} className={shortageOverage < 0 ? 'text-destructive' : ''} />
                            </div>
                             <div className="col-span-full grid gap-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea id="remarks" placeholder="Add any remarks here..." />
                            </div>
                            <div className="col-span-full grid gap-2">
                                <Label htmlFor="receipt-upload">Upload Official Receipt</Label>
                                <Input id="receipt-upload" type="file" />
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
             <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
                <Button onClick={handleFinalSubmit}>Submit Liquidation</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </>
  );
}
