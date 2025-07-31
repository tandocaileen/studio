
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
import { CashAdvance, Motorcycle, MotorcycleStatus } from '@/types';
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
import { cn } from '@/lib/utils';
import { updateCashAdvances } from '@/lib/data';
import { usePathname } from 'next/navigation';


type CashAdvanceTableProps = {
  advances: EnrichedCashAdvance[];
  onMotorcycleUpdate: (updatedItems: Motorcycle[]) => void;
  showStatusColumn?: boolean;
};

const ITEMS_PER_PAGE = 10;

export function CashAdvanceTable({ advances, onMotorcycleUpdate, showStatusColumn = true }: CashAdvanceTableProps) {
  const [selectedAdvances, setSelectedAdvances] = React.useState<EnrichedCashAdvance[]>([]);
  const [previewingAdvance, setPreviewingAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [confirmingCvReceiptAdvance, setConfirmingCvReceiptAdvance] = React.useState<EnrichedCashAdvance | null>(null);
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
  
  const getDynamicCAStatus = (motorcycles: Motorcycle[]): MotorcycleStatus | 'N/A' => {
    if (!motorcycles || motorcycles.length === 0) return 'N/A';
    // The status is determined by the status of the first motorcycle.
    // This is a simplification based on the logic that all MCs in a CA move together.
    return motorcycles[0].status;
  };
  
  const handleUpdate = async (updatedMotorcycles: Motorcycle[], updatedCa?: Partial<CashAdvance>) => {
    onMotorcycleUpdate(updatedMotorcycles);
    if(updatedCa) {
        await updateCashAdvances(updatedCa);
    }
  };
  
  const handleBulkUpdate = (updatedMotorcycles: Motorcycle[], updatedCas: Partial<CashAdvance>[]) => {
      onMotorcycleUpdate(updatedMotorcycles);
      updateCashAdvances(updatedCas);
      setSelectedAdvances([]);
  };
  
  const handleConfirmCvReceiptSubmit = async () => {
    if (!confirmingCvReceiptAdvance) return;
    if (!cvNumber) {
        toast({ title: 'CV Number Required', description: 'Please enter a Check Voucher number.', variant: 'destructive' });
        return;
    }
    const updatedMotorcycles = confirmingCvReceiptAdvance.motorcycles.map(m => ({ ...m, status: 'Released CVs' as const }));
    const updatedCa: Partial<CashAdvance> = {
      id: confirmingCvReceiptAdvance.cashAdvance.id,
      checkVoucherNumber: cvNumber,
      checkVoucherReleaseDate: new Date(),
    };

    await handleUpdate(updatedMotorcycles, updatedCa);
    toast({ title: 'Success', description: `Cash advance #${confirmingCvReceiptAdvance.cashAdvance.id} marked as "Released CVs".` });
    setConfirmingCvReceiptAdvance(null);
    setCvNumber('');
  };

  const handleBulkApproveForCv = () => {
    const updatedMotorcycles = selectedAdvances.flatMap(item => item.motorcycles.map(m => ({
        ...m,
        status: 'For CV Issuance' as const
    })));

    handleBulkUpdate(updatedMotorcycles, []);
    toast({ title: 'Success', description: `${selectedAdvances.length} cash advances moved to "For CV Issuance".` });
  };
  
  const handleBulkConfirmCvReceipt = () => {
    if (!cvNumber) {
        toast({ title: 'CV Number Required', description: 'Please enter a Check Voucher number.', variant: 'destructive' });
        return;
    }
    const updatedMotorcycles = selectedAdvances.flatMap(item => item.motorcycles.map(m => ({
        ...m,
        status: 'Released CVs' as const
    })));

    const updatedCas = selectedAdvances.map(item => ({
        id: item.cashAdvance.id,
        checkVoucherNumber: cvNumber,
        checkVoucherReleaseDate: new Date(),
    }));

    handleBulkUpdate(updatedMotorcycles, updatedCas);
    toast({ title: 'Success', description: `${selectedAdvances.length} cash advances marked as "Released CVs".` });
    setIsBulkReceiveCvDialogOpen(false);
    setCvNumber('');
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

  const canBulkApprove = selectedAdvances.length > 0 && selectedAdvances.every(a => getDynamicCAStatus(a.motorcycles) === 'For CA Approval');
  const canBulkReceive = selectedAdvances.length > 0 && selectedAdvances.every(a => getDynamicCAStatus(a.motorcycles) === 'For CV Issuance');

  const page = usePathname();
  const pageName = page.split('/').pop();
  
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
                        <DropdownMenuItem disabled={!canBulkApprove} onSelect={() => handleBulkApproveForCv()}>
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
              {showStatusColumn && <TableHead>Status</TableHead>}
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAdvances.map((advance) => {
              const status = getDynamicCAStatus(advance.motorcycles);
              const approveActionAvailable = isCashier && status === 'For CA Approval';
              const confirmActionAvailable = isSupervisor && status === 'For CV Issuance';
              const totalActions = 1 + (approveActionAvailable ? 1 : 0) + (confirmActionAvailable ? 1 : 0);

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
                  {showStatusColumn &&
                    <TableCell>
                        <Badge variant="outline" className={cn("capitalize", getStatusClass(status))}>
                        {status}
                        </Badge>
                    </TableCell>
                  }
                  <TableCell>
                    {totalActions === 1 ? (
                        <Button
                            aria-haspopup="false"
                            size="icon"
                            variant="ghost"
                            onClick={() => setPreviewingAdvance(advance)}
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                        </Button>
                    ) : (
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
                                <span>Preview</span>
                            </DropdownMenuItem>
                            {approveActionAvailable && (
                                <DropdownMenuItem 
                                    onSelect={() => handleUpdate(advance.motorcycles.map(m => ({ ...m, status: 'For CV Issuance' as const })))}
                                >
                                    <Banknote className="mr-2 h-4 w-4" />
                                    Approve for CV Issuance
                                </DropdownMenuItem>
                            )}
                            {confirmActionAvailable && (
                                <DropdownMenuItem
                                    onSelect={() => setConfirmingCvReceiptAdvance(advance)}
                                >
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Confirm Budget Received
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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

    
