
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CashAdvance, Motorcycle, MotorcycleStatus } from '@/types';
import { Eye, Check, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { CashAdvanceRequestDocument } from './cash-advance-request-document';
import type { EnrichedCashAdvance } from '@/app/cash-advances/page';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { updateCashAdvances } from '@/lib/data';
import { usePathname } from 'next/navigation';


type CashAdvanceTableProps = {
  advances: EnrichedCashAdvance[];
  onMotorcycleUpdate: (updatedItems: Motorcycle[], updatedCa?: Partial<CashAdvance>) => void;
  showStatusColumn?: boolean;
};

const ITEMS_PER_PAGE = 10;

export function CashAdvanceTable({ advances, onMotorcycleUpdate, showStatusColumn = true }: CashAdvanceTableProps) {
  const [previewingAdvance, setPreviewingAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [confirmingCvReceiptAdvance, setConfirmingCvReceiptAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [issuingCvAdvance, setIssuingCvAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [cvNumber, setCvNumber] = React.useState('');
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  
  const { toast } = useToast();
  const documentRef = React.useRef(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  const pathname = usePathname();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [advances]);
  
  const getDynamicCAStatus = (motorcycles: Motorcycle[]): MotorcycleStatus | 'N/A' => {
    if (!motorcycles || motorcycles.length === 0) return 'N/A';
    return motorcycles[0].status;
  };
  
  const handleUpdate = async (updatedMotorcycles: Motorcycle[], updatedCa?: Partial<CashAdvance>) => {
    onMotorcycleUpdate(updatedMotorcycles, updatedCa);
  };
  
  const handleIssueCvSubmit = async () => {
    if (!issuingCvAdvance) return;
    if (!cvNumber) {
        toast({ title: 'CV Number Required', description: 'Please enter a Check Voucher number.', variant: 'destructive' });
        return;
    }
    const updatedMotorcycles = issuingCvAdvance.motorcycles.map(m => ({ ...m, status: 'Released CVs' as const }));
    const updatedCa: Partial<CashAdvance> = {
      id: issuingCvAdvance.cashAdvance.id,
      checkVoucherNumber: cvNumber,
      checkVoucherReleaseDate: new Date(),
    };

    await handleUpdate(updatedMotorcycles, updatedCa);
    toast({ title: 'Success', description: `CV Issued for #${issuingCvAdvance.cashAdvance.id}.` });
    setIssuingCvAdvance(null);
    setCvNumber('');
  };

  const handleConfirmReceiptSubmit = async () => {
    if (!confirmingCvReceiptAdvance) return;

    // In a real app, you would upload the file and get a URL.
    // For this demo, we'll just use a placeholder.
    if (!receiptFile) {
        toast({ title: "Receipt Image Required", description: "Please select an image file to upload.", variant: "destructive" });
        return;
    }

    const updatedMotorcycles = confirmingCvReceiptAdvance.motorcycles.map(m => ({
        ...m,
        status: 'For Liquidation' as const
    }));

    const updatedCa: Partial<CashAdvance> = {
        id: confirmingCvReceiptAdvance.cashAdvance.id,
        cvReceiptUrl: `/uploads/receipt-${confirmingCvReceiptAdvance.cashAdvance.id}.jpg` // Placeholder URL
    };

    await handleUpdate(updatedMotorcycles, updatedCa);
    toast({
        title: "Receipt Confirmed",
        description: `Liaison receipt for CV #${confirmingCvReceiptAdvance.cashAdvance.checkVoucherNumber} confirmed. Units are now for liquidation.`
    });
    setConfirmingCvReceiptAdvance(null);
    setReceiptFile(null);
  };

  const getStatusClass = (status: MotorcycleStatus | 'N/A'): string => {
    switch (status) {
      case 'For CA Approval': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'For CV Issuance': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Released CVs': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'For Liquidation': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'For Verification': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isCashier = user?.role === 'Cashier';
  const isSupervisor = user?.role === 'Store Supervisor';
  const isLiaison = user?.role === 'Liaison';
  const pageName = pathname.split('/').pop();
  
  const totalPages = Math.ceil(advances.length / ITEMS_PER_PAGE);
  const paginatedAdvances = advances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPrimaryCustomer = (advance: EnrichedCashAdvance) => {
    if (advance.motorcycles && advance.motorcycles.length > 0) {
      const customer = advance.motorcycles[0].customerName;
      if (advance.motorcycles.length > 1) {
        return `${customer} + ${advance.motorcycles.length - 1} more`;
      }
      return customer;
    }
    return advance.cashAdvance.personnel;
  }
  
  const getPrimaryMotorcycle = (advance: EnrichedCashAdvance) => {
     if (advance.motorcycles && advance.motorcycles.length > 0) {
      const mc = advance.motorcycles[0];
      const model = `${mc.make} ${mc.model}`;
      if (advance.motorcycles.length > 1) {
        return `${model} + ${advance.motorcycles.length - 1} more`;
      }
      return model;
    }
    return advance.cashAdvance.purpose;
  }
  
  const getCardTitle = () => {
    if (pageName === 'for-cv-issuance') {
      return 'Cash Advances for CV Issuance';
    }
    if (pageName === 'released-cv' && (isSupervisor || isCashier)) {
      return 'All CAs with Released Check Vouchers';
    }
    return 'All Cash Advances'
  }
  const getCardDescription = () => {
    if (pageName === 'for-cv-issuance') {
      return 'These CAs have been approved and are awaiting check voucher creation by a Cashier.';
    }
     if (pageName === 'released-cv' && (isSupervisor || isCashier)) {
      return 'A list of all cash advances with released check vouchers.';
    }
    return 'A comprehensive list of all cash advance requests.';
  }

  const isForCvIssuancePage = pageName === 'for-cv-issuance';
  const isReleasedCvPage = pageName === 'released-cv';


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{getCardTitle()}</CardTitle>
          <CardDescription>
            {getCardDescription()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {isLiaison && <TableHead>Primary Customer</TableHead>}
              {isLiaison && <TableHead>Primary Motorcycle</TableHead>}
              {(isSupervisor || isCashier) && isReleasedCvPage && <TableHead>CV Number</TableHead>}
              {(isSupervisor || isCashier) && isReleasedCvPage && <TableHead>Cash Advance Code</TableHead>}
              {(isSupervisor || isCashier) && !isReleasedCvPage && <TableHead>Liaison</TableHead>}
              {(isSupervisor || isCashier) && !isReleasedCvPage && <TableHead>Purpose</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              {showStatusColumn && <TableHead>Status</TableHead>}
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAdvances.map((advance) => {
              const status = getDynamicCAStatus(advance.motorcycles);
              const canIssueCv = (isCashier || isSupervisor) && status === 'For CV Issuance';
              const canConfirmReceipt = (isCashier || isSupervisor) && status === 'Released CVs' && !advance.cashAdvance.cvReceiptUrl;

              return (
                <TableRow key={advance.cashAdvance.id}>
                  {isLiaison && <TableCell className="font-medium">{getPrimaryCustomer(advance)}</TableCell>}
                  {isLiaison && <TableCell className="max-w-[300px] truncate">{getPrimaryMotorcycle(advance)}</TableCell>}
                  
                  {(isSupervisor || isCashier) && isReleasedCvPage && <TableCell className="font-medium">{advance.cashAdvance.checkVoucherNumber}</TableCell>}
                  {(isSupervisor || isCashier) && isReleasedCvPage && <TableCell>{advance.cashAdvance.id}</TableCell>}

                  {(isSupervisor || isCashier) && !isReleasedCvPage && <TableCell className="font-medium">{advance.cashAdvance.personnel}</TableCell>}
                  {(isSupervisor || isCashier) && !isReleasedCvPage && <TableCell className="max-w-[300px] truncate">{advance.cashAdvance.purpose}</TableCell>}
                  
                  <TableCell className="text-right">₱{advance.cashAdvance.amount.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(advance.cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                  {showStatusColumn &&
                    <TableCell>
                        <Badge variant="outline" className={cn("capitalize", getStatusClass(status))}>
                        {status}
                        </Badge>
                    </TableCell>
                  }
                  <TableCell className="flex items-center gap-2 justify-end">
                      {isForCvIssuancePage && canIssueCv && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setIssuingCvAdvance(advance)}>
                              Issue CV
                          </Button>
                      )}
                      {isReleasedCvPage && canConfirmReceipt && (
                        <Button size="sm" onClick={() => setConfirmingCvReceiptAdvance(advance)}>
                            Confirm Receipt
                        </Button>
                      )}
                      {advance.cashAdvance.cvReceiptUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(advance.cashAdvance.cvReceiptUrl, '_blank')}>
                            View Receipt
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => setPreviewingAdvance(advance)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                      </Button>
                  </TableCell>
                </TableRow>
              )})}
          </TableBody>
        </Table>
         {advances.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">No cash advances to display.</div>
          )}
      </CardContent>
       <CardFooter>
            <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                    Showing {Math.min(paginatedAdvances.length, advances.length)} of {advances.length} cash advances.
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardFooter>
    </Card>
    
    <Dialog open={!!previewingAdvance} onOpenChange={(open) => !open && setPreviewingAdvance(null)}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Cash Advance Preview</DialogTitle>
                <DialogDescription>
                    Review the details of the cash advance request.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[70vh] overflow-y-auto p-2">
                {previewingAdvance && (
                    <CashAdvanceRequestDocument 
                        ref={documentRef} 
                        advance={previewingAdvance.cashAdvance} 
                        motorcycles={previewingAdvance.motorcycles} 
                    />
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewingAdvance(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <Dialog open={!!issuingCvAdvance} onOpenChange={(open) => !open && setIssuingCvAdvance(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Issue Check Voucher for CA #{issuingCvAdvance?.cashAdvance.id}</DialogTitle>
                <DialogDescription>
                    Enter the Check Voucher number to confirm budget has been received by the Cashier.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="single-cv-number" className="text-right">
                        CV Number
                    </Label>
                    <Input 
                        id="single-cv-number" 
                        value={cvNumber}
                        onChange={(e) => setCvNumber(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., CV-2024-08-001"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIssuingCvAdvance(null)}>Cancel</Button>
                <Button onClick={handleIssueCvSubmit}>Confirm and Issue CV</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={!!confirmingCvReceiptAdvance} onOpenChange={(open) => !open && setConfirmingCvReceiptAdvance(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Confirm CV Received by Liaison</DialogTitle>
                <DialogDescription>
                    Please upload proof of receipt for CV #{confirmingCvReceiptAdvance?.cashAdvance.checkVoucherNumber}. This will move the associated items to 'For Liquidation'.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="receipt-upload">Signed Receipt</Label>
                    <Input id="receipt-upload" type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                    {receiptFile && <p className="text-sm text-muted-foreground">Selected: {receiptFile.name}</p>}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmingCvReceiptAdvance(null)}>Cancel</Button>
                <Button onClick={handleConfirmReceiptSubmit} disabled={!receiptFile}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Confirm Receipt
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    </>
  );
}
