
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CashAdvance } from '@/types';
import { MoreHorizontal, Download, Eye, Banknote, PackageCheck, CheckCircle, CircleDashed, Hourglass } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { CashAdvanceRequestDocument } from './cash-advance-request-document';
import { generatePdf } from '@/lib/pdf';
import type { EnrichedCashAdvance } from '@/app/cash-advances/page';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from '../ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


type CashAdvanceTableProps = {
  advances: EnrichedCashAdvance[];
  onBulkUpdate: (updatedItems: CashAdvance[]) => void;
};

const ITEMS_PER_PAGE = 10;

export function CashAdvanceTable({ advances, onBulkUpdate }: CashAdvanceTableProps) {
  const [selectedAdvances, setSelectedAdvances] = React.useState<EnrichedCashAdvance[]>([]);
  const [previewingAdvance, setPreviewingAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [releasingCvAdvance, setReleasingCvAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [confirmingCvReceiptAdvance, setConfirmingCvReceiptAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [isBulkReleaseCvDialogOpen, setIsBulkReleaseCvDialogOpen] = React.useState(false);
  const [isBulkReceiveCvDialogOpen, setIsBulkReceiveCvDialogOpen] = React.useState(false);
  const [cvNumber, setCvNumber] = React.useState('');
  
  const { toast } = useToast();
  const documentRef = React.useRef(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setSelectedAdvances([]);
    setCurrentPage(1);
  }, [advances]);
  
  const handleUpdate = (updatedItem: CashAdvance) => {
    onBulkUpdate([updatedItem]);
  };
  
  const handleBulkUpdate = (updatedItems: CashAdvance[]) => {
      onBulkUpdate(updatedItems);
      setSelectedAdvances([]);
  };

  const handleReleaseCvSubmit = () => {
    if (!releasingCvAdvance) return;
    const updatedItem = {
      ...releasingCvAdvance.cashAdvance, 
      status: 'Received Budget' as const
    };
    handleUpdate(updatedItem);
    toast({ title: 'Success', description: `Cash advance #${releasingCvAdvance.cashAdvance.id} marked as "Received Budget".` });
    setReleasingCvAdvance(null);
  };
  
  const handleConfirmCvReceiptSubmit = () => {
    if (!confirmingCvReceiptAdvance) return;
    if (!cvNumber) {
        toast({ title: 'CV Number Required', description: 'Please enter a Check Voucher number.', variant: 'destructive' });
        return;
    }
    const updatedItem = {
      ...confirmingCvReceiptAdvance.cashAdvance,
      status: 'Received Budget' as const,
      checkVoucherNumber: cvNumber,
      checkVoucherReleaseDate: new Date(),
    };
    handleUpdate(updatedItem);
    toast({ title: 'Success', description: `Cash advance #${confirmingCvReceiptAdvance.cashAdvance.id} marked as "Received Budget".` });
    setConfirmingCvReceiptAdvance(null);
    setCvNumber('');
  };

  const handleBulkReleaseCv = () => {
    const updated = selectedAdvances.map(item => ({
        ...item.cashAdvance,
        status: 'For CV Issuance' as const
    }));
    handleBulkUpdate(updated);
    toast({ title: 'Success', description: `${updated.length} cash advances marked as "For CV Issuance".` });
    setIsBulkReleaseCvDialogOpen(false);
  };
  
  const handleBulkConfirmCvReceipt = () => {
    if (!cvNumber) {
        toast({ title: 'CV Number Required', description: 'Please enter a Check Voucher number.', variant: 'destructive' });
        return;
    }
    const updated = selectedAdvances.map(item => ({
        ...item.cashAdvance,
        status: 'Received Budget' as const,
        checkVoucherNumber: cvNumber,
        checkVoucherReleaseDate: new Date(),
    }));
    handleBulkUpdate(updated);
    toast({ title: 'Success', description: `${updated.length} cash advances marked as "Received Budget".` });
    setIsBulkReceiveCvDialogOpen(false);
    setCvNumber('');
  };


  const handleDownload = async () => {
    if (!previewingAdvance || !documentRef.current) {
        toast({ title: 'Error', description: 'Cannot download PDF. No document to download.', variant: 'destructive' });
        return;
    };
    await generatePdf(documentRef.current, `cash_advance_${previewingAdvance.cashAdvance.id}.pdf`);
    toast({ title: 'Download Started', description: `Downloading PDF for CA #${previewingAdvance.cashAdvance.id}`});
  }

  const getStatusVisuals = (status: CashAdvance['status']): { color: string; icon: React.ElementType } => {
    switch (status) {
      case 'For CA Approval': return { color: 'bg-yellow-500', icon: Hourglass };
      case 'For CV Issuance': return { color: 'bg-blue-500', icon: Banknote };
      case 'Received Budget': return { color: 'bg-teal-500', icon: PackageCheck };
      case 'For Liquidation': return { color: 'bg-purple-500', icon: Hourglass };
      case 'For Verification': return { color: 'bg-orange-500', icon: CircleDashed };
      case 'Completed': return { color: 'bg-green-500', icon: CheckCircle };
      default: return { color: 'bg-gray-500', icon: CircleDashed };
    }
  };

  const isCashier = user?.role === 'Cashier';
  const isSupervisor = user?.role === 'Store Supervisor';
  const isLiaison = user?.role === 'Liaison';
  const isCashierOrSupervisor = isCashier || isSupervisor;
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
        setSelectedAdvances(paginatedAdvances);
    } else {
        setSelectedAdvances([]);
    }
  };

  const handleSelectRow = (item: EnrichedCashAdvance, checked: boolean | 'indeterminate') => {
    if (checked === true) {
        setSelectedAdvances(prev => [...prev, item]);
    } else {
        setSelectedAdvances(prev => prev.filter(sa => sa.cashAdvance.id !== item.cashAdvance.id));
    }
  };

  const totalPages = Math.ceil(advances.length / ITEMS_PER_PAGE);
  const paginatedAdvances = advances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isAllOnPageSelected = paginatedAdvances.length > 0 && selectedAdvances.length === paginatedAdvances.length;

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

  const canBulkApprove = selectedAdvances.length > 0 && selectedAdvances.every(a => a.cashAdvance.status === 'For CA Approval');
  const canBulkReceive = selectedAdvances.length > 0 && selectedAdvances.every(a => a.cashAdvance.status === 'For CV Issuance');


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cash Advances</CardTitle>
          <CardDescription>
            Track and manage all cash advance requests and liquidations.
          </CardDescription>
        </div>
        {selectedAdvances.length > 0 && isCashierOrSupervisor && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Bulk Actions ({selectedAdvances.length})
                        <MoreHorizontal className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {isCashier && (
                        <DropdownMenuItem disabled={!canBulkApprove} onSelect={() => setIsBulkReleaseCvDialogOpen(true)}>
                            <Banknote className="mr-2 h-4 w-4" />
                            Approve for CV Issuance
                        </DropdownMenuItem>
                    )}
                    {(isSupervisor) && (
                        <DropdownMenuItem disabled={!canBulkReceive} onSelect={() => setIsBulkReceiveCvDialogOpen(true)}>
                            <PackageCheck className="mr-2 h-4 w-4" />
                            Confirm Budget Received
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {isCashierOrSupervisor && (
                <TableHead className="w-[40px]">
                    <Checkbox
                        checked={isAllOnPageSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all on page"
                    />
                </TableHead>
              )}
              <TableHead>{isLiaison ? 'Primary Customer' : 'Liaison'}</TableHead>
              <TableHead>{isLiaison ? 'Primary Motorcycle' : 'Purpose'}</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAdvances.map((advance) => {
              const {color, icon: Icon} = getStatusVisuals(advance.cashAdvance.status);
              return (
                <TableRow 
                  key={advance.cashAdvance.id}
                  data-state={selectedAdvances.some(sa => sa.cashAdvance.id === advance.cashAdvance.id) ? "selected" : undefined}
                  >
                  {isCashierOrSupervisor && (
                      <TableCell>
                          <Checkbox
                              checked={selectedAdvances.some(sa => sa.cashAdvance.id === advance.cashAdvance.id)}
                              onCheckedChange={(checked) => handleSelectRow(advance, checked)}
                              aria-label={`Select CA ${advance.cashAdvance.id}`}
                          />
                      </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {isLiaison ? getPrimaryCustomer(advance) : advance.cashAdvance.personnel}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {isLiaison ? getPrimaryMotorcycle(advance) : advance.cashAdvance.purpose}
                  </TableCell>
                  <TableCell className="text-right">₱{advance.cashAdvance.amount.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(advance.cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      <Icon className={`mr-2 h-3 w-3 ${color}`} />
                      {advance.cashAdvance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setPreviewingAdvance(advance)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Preview/Print</span>
                          </DropdownMenuItem>
                          {isCashier && (
                              <DropdownMenuItem 
                                  disabled={advance.cashAdvance.status !== 'For CA Approval'}
                                  onSelect={() => setReleasingCvAdvance(advance)}
                              >
                                  <Banknote className="mr-2 h-4 w-4" />
                                  Approve for CV Issuance
                              </DropdownMenuItem>
                          )}
                          {isSupervisor && (
                              <DropdownMenuItem
                                  disabled={advance.cashAdvance.status !== 'For CV Issuance'}
                                  onSelect={() => setConfirmingCvReceiptAdvance(advance)}
                              >
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Confirm Budget Received
                              </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    Review the details of the cash advance request. You can download it as a PDF.
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
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download PDF
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={!!releasingCvAdvance} onOpenChange={(open) => !open && setReleasingCvAdvance(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Approve for CV Issuance?</AlertDialogTitle>
            <AlertDialogDescription>
                This will mark cash advance #{releasingCvAdvance?.cashAdvance.id} as "For CV Issuance". This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseCvSubmit}>Approve</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <Dialog open={!!confirmingCvReceiptAdvance} onOpenChange={(open) => !open && setConfirmingCvReceiptAdvance(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Confirm Budget Received for CA #{confirmingCvReceiptAdvance?.cashAdvance.id}</DialogTitle>
                <DialogDescription>
                    Enter the Check Voucher number to confirm budget has been received by the liaison.
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
                <Button variant="outline" onClick={() => setConfirmingCvReceiptAdvance(null)}>Cancel</Button>
                <Button onClick={handleConfirmCvReceiptSubmit}>Confirm Receipt</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <AlertDialog open={isBulkReleaseCvDialogOpen} onOpenChange={setIsBulkReleaseCvDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Bulk Approve for CV Issuance?</AlertDialogTitle>
            <AlertDialogDescription>
                This will mark {selectedAdvances.length} cash advance(s) as "For CV Issuance". This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkReleaseCv}>Approve Selected</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <Dialog open={isBulkReceiveCvDialogOpen} onOpenChange={setIsBulkReceiveCvDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Bulk Confirm Budget Receipt</DialogTitle>
                <DialogDescription>
                    Enter the CV number that applies to all {selectedAdvances.length} selected cash advances.
                    <span className="font-semibold text-destructive block mt-2">Warning:</span> Please ensure all selected cash advances are covered by the same check voucher.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bulk-cv-number" className="text-right">
                        CV Number
                    </Label>
                    <Input 
                        id="bulk-cv-number" 
                        value={cvNumber}
                        onChange={(e) => setCvNumber(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., CV-2024-08-001"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkReceiveCvDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkConfirmCvReceipt}>Confirm Receipt for Selected</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
