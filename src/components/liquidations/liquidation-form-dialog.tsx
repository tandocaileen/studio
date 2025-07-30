
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CashAdvance, Motorcycle } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, AlertCircle, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { useRouter } from 'next/navigation';

type LiquidationFormDialogProps = {
  motorcycle: Motorcycle;
  cashAdvance: CashAdvance;
  isOpen: boolean;
  onClose: () => void;
  onLiquidate: (updatedData: Partial<Motorcycle>) => void;
  onSaveDetails: (updatedData: Partial<Motorcycle>) => void;
  getMcAdvanceAmount: (mc: Motorcycle) => number;
};

export function LiquidationFormDialog({
  motorcycle,
  cashAdvance,
  isOpen,
  onClose,
  onLiquidate,
  onSaveDetails,
  getMcAdvanceAmount
}: LiquidationFormDialogProps) {
  
  const [editedData, setEditedData] = React.useState<Partial<Motorcycle>>(motorcycle);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (isOpen) {
      setEditedData(motorcycle);
    }
  }, [isOpen, motorcycle]);

  const handleDataChange = (fieldName: keyof Motorcycle, value: any) => {
    setEditedData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleLiquidationDetailsChange = (fieldName: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      liquidationDetails: {
        ...(prev.liquidationDetails || {
            ltoOrNumber: '',
            ltoOrAmount: 0,
            ltoProcessFee: 0,
            remarks: '',
            // a bunch of these are filled on save
            totalLiquidation: 0,
            shortageOverage: 0,
            liquidatedBy: '',
            liquidationDate: new Date(),
            parentCaId: '',
        }),
        [fieldName]: value,
      },
    }));
  };

  const handleLiquidate = async () => {
    setIsSubmitting(true);
    await onLiquidate(editedData);
    setIsSubmitting(false);
    onClose();
  };

  const handleSaveDetails = async () => {
    await onSaveDetails(editedData);
  }

  if (!motorcycle) return null;
  
  const advanceAmount = getMcAdvanceAmount(motorcycle);
  const totalLiquidation = (editedData.liquidationDetails?.ltoOrAmount || 0) + (editedData.liquidationDetails?.ltoProcessFee || 0);
  const shortageOverage = advanceAmount - totalLiquidation;

  const canLiquidate = motorcycle.status === 'For Liquidation' &&
                       editedData.liquidationDetails?.ltoOrNumber &&
                       editedData.liquidationDetails?.ltoOrAmount > 0 &&
                       editedData.liquidationDetails?.ltoProcessFee > 0;

  const isForReview = motorcycle.status === 'For Verification' || motorcycle.status === 'Completed';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="flex-row justify-between items-start">
            <div>
                <DialogTitle>OR/CR Form - Update</DialogTitle>
                <DialogDescription>
                    {isForReview ? 'Viewing submitted liquidation details.' : 'Enter the official receipt and registration details for this motorcycle.'}
                </DialogDescription>
            </div>
             <div className='flex items-center gap-4'>
                 {isForReview ? (
                    <Button onClick={() => router.push(`/reports/liquidation/${cashAdvance.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Report
                    </Button>
                 ) : (
                    <>
                        {!canLiquidate && (
                            <Alert variant="destructive" className="py-2 px-3 text-xs border-dashed bg-destructive/10">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Please fill in all required fields (*) to enable liquidation.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={handleLiquidate} loading={isSubmitting} disabled={!canLiquidate}>
                            <Edit className="mr-2 h-4 w-4" />
                            Submit for Verification
                        </Button>
                    </>
                 )}
            </div>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6 px-6">
          <div className="py-4 pr-2 grid gap-6">
            
            {/* Customer Info */}
            <section>
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex items-center">
                        <Label className="w-1/3">LTO CV No.</Label>
                        <Input value={cashAdvance.checkVoucherNumber || 'N/A'} disabled />
                    </div>
                    <div className="flex items-center">
                        <Label className="w-1/3">Address</Label>
                        <Input value="BRGY SANDAYAO 0, GUIHULNGAN, NEGROS OR" disabled />
                    </div>
                     <div className="flex items-center">
                        <Label className="w-1/3">CA Code</Label>
                        <Input value={cashAdvance.id} disabled />
                    </div>
                     <div className="flex items-center">
                        <Label className="w-1/3">Chassis No.</Label>
                        <Input value={motorcycle.chassisNumber} disabled />
                    </div>
                     <div className="flex items-center">
                        <Label className="w-1/3">Customer Name</Label>
                        <Input value={motorcycle.customerName} disabled />
                    </div>
                    <div className="flex items-center">
                        <Label className="w-1/3">Model</Label>
                        <Input value={motorcycle.model} disabled />
                    </div>
                     <div className="flex items-center">
                        <Label className="w-1/3">Engine No.</Label>
                        <Input value={motorcycle.engineNumber} disabled />
                    </div>
                    <div className="flex items-center">
                        <Label className="w-1/3">Sales Acct. Code</Label>
                        <Input value={motorcycle.accountCode || 'N/A'} disabled />
                    </div>
                    <div className="flex items-center">
                        <Label className="w-1/3">MC Name</Label>
                        <Input value={motorcycle.make} disabled />
                    </div>
                    <div className="flex items-center">
                        <Label className="w-1/3">Color</Label>
                        <Input value={motorcycle.color} disabled />
                    </div>
                </div>
            </section>
            
            <div className="grid grid-cols-2 gap-x-8">
                {/* Official Receipt */}
                <section>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Official Receipt</h3>
                    <div className="grid gap-y-4 text-sm">
                        <div className="flex items-center">
                            <Label className="w-1/3">OR Type</Label>
                            <Select value={editedData.orType} onValueChange={(v) => handleDataChange('orType', v)} disabled={isForReview}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select OR Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computerized">Computerized</SelectItem>
                                    <SelectItem value="Manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center">
                            <Label className="w-1/3">OR No. <span className="text-destructive">*</span></Label>
                            <Input
                                value={editedData.liquidationDetails?.ltoOrNumber || ''}
                                onChange={(e) => handleLiquidationDetailsChange('ltoOrNumber', e.target.value)}
                                className={cn(!editedData.liquidationDetails?.ltoOrNumber && 'border-destructive')}
                                disabled={isForReview}
                             />
                        </div>
                        <div className="flex items-center">
                            <Label className="w-1/3">Date Issued</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedData.orDateIssued && "text-muted-foreground")} disabled={isForReview}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editedData.orDateIssued ? format(new Date(editedData.orDateIssued), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={editedData.orDateIssued ? new Date(editedData.orDateIssued) : undefined} onSelect={(d) => handleDataChange('orDateIssued', d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex items-center">
                            <Label className="w-1/3">Date Received</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedData.orDateReceived && "text-muted-foreground")} disabled={isForReview}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editedData.orDateReceived ? format(new Date(editedData.orDateReceived), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={editedData.orDateReceived ? new Date(editedData.orDateReceived) : undefined} onSelect={(d) => handleDataChange('orDateReceived', d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center">
                            <Label className="w-1/3">MV File No.</Label>
                            <Input value={editedData.mvFileNo || ''} onChange={(e) => handleDataChange('mvFileNo', e.target.value)} disabled={isForReview}/>
                        </div>
                         <div className="flex items-center gap-4">
                            <Checkbox id="has-plate" checked={editedData.hasPhysicalPlate} onCheckedChange={(c) => handleDataChange('hasPhysicalPlate', !!c)} disabled={isForReview}/>
                            <Label htmlFor="has-plate">Has Physical Plate?</Label>
                            <Input placeholder="Plate No." value={editedData.plateNumber || ''} onChange={(e) => handleDataChange('plateNumber', e.target.value)} disabled={!editedData.hasPhysicalPlate || isForReview}/>
                        </div>
                         <div className="flex items-center">
                            <Label className="w-1/3">OR Amt <span className="text-destructive">*</span></Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={editedData.liquidationDetails?.ltoOrAmount || ''}
                                onChange={e => handleLiquidationDetailsChange('ltoOrAmount', parseFloat(e.target.value) || 0)}
                                className={cn(!(editedData.liquidationDetails?.ltoOrAmount && editedData.liquidationDetails?.ltoOrAmount > 0) && 'border-destructive')}
                                disabled={isForReview}
                            />
                        </div>
                        <div className="flex items-center">
                            <Label className="w-1/3">Processing Fee <span className="text-destructive">*</span></Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={editedData.liquidationDetails?.ltoProcessFee || ''}
                                onChange={e => handleLiquidationDetailsChange('ltoProcessFee', parseFloat(e.target.value) || 0)}
                                className={cn(!(editedData.liquidationDetails?.ltoProcessFee && editedData.liquidationDetails?.ltoProcessFee > 0) && 'border-destructive')}
                                disabled={isForReview}
                            />
                        </div>
                         <div className="flex items-center">
                            <Label className="w-1/3">Shortage/Ovg</Label>
                             <Input disabled value={shortageOverage.toFixed(2)} className={cn('font-bold', shortageOverage < 0 ? 'text-destructive' : 'text-green-600')} />
                        </div>
                    </div>
                </section>

                {/* Certificate of Registration */}
                <section>
                     <h3 className="font-semibold text-lg border-b pb-2 mb-4">Certificate of Registration</h3>
                     <div className="grid gap-y-4 text-sm">
                        <div className="flex items-center gap-4">
                            <Checkbox id="has-cr" checked={!!editedData.crNumber} onCheckedChange={(c) => handleDataChange('crNumber', c ? '' : undefined)} disabled={isForReview}/>
                            <Label htmlFor="has-cr">Has CR?</Label>
                        </div>
                         <div className="flex items-center">
                            <Label className="w-1/3">CR No.</Label>
                            <Input value={editedData.crNumber || ''} onChange={(e) => handleDataChange('crNumber', e.target.value)} disabled={editedData.crNumber === undefined || isForReview}/>
                        </div>
                     </div>
                </section>
            </div>
            
            {/* Remarks and Upload */}
            <section className="mt-6">
                <div className="grid gap-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea id="remarks" placeholder="Add any remarks here..." value={editedData.liquidationDetails?.remarks || ''} onChange={e => handleLiquidationDetailsChange('remarks', e.target.value)} disabled={isForReview}/>
                </div>
                <div className="grid gap-2 mt-4">
                    <Label htmlFor="receipt-upload">Upload Official Receipt</Label>
                    <Input id="receipt-upload" type="file" disabled={isForReview}/>
                </div>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 justify-between">
            <div>
                 <Button variant="secondary" onClick={handleSaveDetails} disabled={isForReview}>Save Details</Button>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
