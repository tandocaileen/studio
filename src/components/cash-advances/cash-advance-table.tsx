
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
import { MoreHorizontal, PlusCircle, Check, X, FileUp, Download, Eye, FileCheck, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CashAdvanceRequestDocument } from './cash-advance-request-document';
import { generatePdf } from '@/lib/pdf';
import type { EnrichedCashAdvance } from '@/app/cash-advances/page';
import { useAuth } from '@/context/AuthContext';


type CashAdvanceTableProps = {
  advances: EnrichedCashAdvance[];
};

const ITEMS_PER_PAGE = 10;

export function CashAdvanceTable({ advances: initialAdvances }: CashAdvanceTableProps) {
  const [advances, setAdvances] = React.useState(initialAdvances);
  const [previewingAdvance, setPreviewingAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [releasingAdvance, setReleasingAdvance] = React.useState<EnrichedCashAdvance | null>(null);
  const [cvNumber, setCvNumber] = React.useState('');
  
  const { toast } = useToast();
  const documentRef = React.useRef(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setAdvances(initialAdvances);
    setCurrentPage(1);
  }, [initialAdvances]);

  const updateAdvanceState = (caId: string, updates: Partial<CashAdvance>) => {
    setAdvances(prev => prev.map(item => 
      item.cashAdvance.id === caId 
        ? { ...item, cashAdvance: { ...item.cashAdvance, ...updates } }
        : item
    ));
  }

  const handleAction = (message: string) => {
    toast({
      title: 'Action Triggered',
      description: message,
    })
  }
  
  const handleReleaseCv = () => {
    if (!releasingAdvance || !cvNumber) {
       toast({ title: 'Error', description: 'Please enter a Check Voucher number.', variant: 'destructive' });
       return;
    }
    
    updateAdvanceState(releasingAdvance.cashAdvance.id, {
        status: 'Check Voucher Released',
        checkVoucherNumber: cvNumber,
        checkVoucherReleaseDate: new Date(),
    });

    toast({
      title: 'Check Voucher Released!',
      description: `CV# ${cvNumber} has been released for CA# ${releasingAdvance.cashAdvance.id}.`,
    });

    setReleasingAdvance(null);
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

  const getStatusColor = (status: CashAdvance['status']): string => {
    switch (status) {
      case 'Processing for CV': return 'bg-amber-500';
      case 'Check Voucher Released': return 'bg-purple-500';
      case 'CV Received': return 'bg-teal-500';
      case 'Liquidated': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  const isCashierOrSupervisor = user?.role === 'Cashier' || user?.role === 'Store Supervisor';
  const isCashier = user?.role === 'Cashier';

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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isCashierOrSupervisor ? 'Liaison' : 'Customer'}</TableHead>
              {isCashierOrSupervisor ? <TableHead>Purpose</TableHead> : <TableHead>Motorcycle</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAdvances.map((advance) => (
              <TableRow key={advance.cashAdvance.id}>
                 <TableCell className="font-medium">
                  {isCashierOrSupervisor ? advance.cashAdvance.personnel : getPrimaryCustomer(advance)}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {isCashierOrSupervisor ? advance.cashAdvance.purpose : getPrimaryMotorcycle(advance)}
                </TableCell>
                <TableCell className="text-right">₱{advance.cashAdvance.amount.toLocaleString()}</TableCell>
                <TableCell>{format(new Date(advance.cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                     <span className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusColor(advance.cashAdvance.status)}`}></span>
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
                      
                      {(isCashierOrSupervisor) && <DropdownMenuSeparator />}
                      
                      {isCashierOrSupervisor && (
                          <DropdownMenuItem disabled={advance.cashAdvance.status !== 'Processing for CV'} onClick={() => setReleasingAdvance(advance)}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            <span>Release CV</span>
                          </DropdownMenuItem>
                      )}

                      {isCashierOrSupervisor && (
                          <DropdownMenuItem disabled={advance.cashAdvance.status !== 'Check Voucher Released'} onClick={() => handleAction(`Marked as CV Received for ${advance.cashAdvance.personnel}.`)}>
                            <Banknote className="mr-2 h-4 w-4" />
                            <span>Mark as CV Received</span>
                          </DropdownMenuItem>
                      )}

                      {user?.role === 'Liaison' && (
                         <DropdownMenuItem disabled={!['CV Received'].includes(advance.cashAdvance.status)} onClick={() => handleAction(`Liquidated advance for ${advance.cashAdvance.personnel}.`)}>
                            <FileUp className="mr-2 h-4 w-4" />
                            <span>Liquidate</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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

    <Dialog open={!!releasingAdvance} onOpenChange={(open) => !open && setReleasingAdvance(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Release Check Voucher</DialogTitle>
                <DialogDescription>
                    Enter the CV number for CA# {releasingAdvance?.cashAdvance.id} to mark it as released.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cv-number" className="text-right">
                        CV Number
                    </Label>
                    <Input 
                        id="cv-number" 
                        value={cvNumber}
                        onChange={(e) => setCvNumber(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., CV-2024-08-001"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setReleasingAdvance(null)}>Cancel</Button>
                <Button onClick={handleReleaseCv}>Release</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
