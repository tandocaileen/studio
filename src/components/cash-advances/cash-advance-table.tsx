
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CashAdvanceDocument } from './cash-advance-document';
import { generatePdf } from '@/lib/pdf';
import type { EnrichedCashAdvance } from '@/app/cash-advances/page';
import { useAuth } from '@/context/AuthContext';


type CashAdvanceTableProps = {
  advances: EnrichedCashAdvance[];
};

export function CashAdvanceTable({ advances: initialAdvances }: CashAdvanceTableProps) {
  const [advances, setAdvances] = React.useState(initialAdvances);
  const [previewingAdvance, setPreviewingAdvance] = React.useState<CashAdvance | null>(null);
  const { toast } = useToast();
  const documentRef = React.useRef(null);
  const { user } = useAuth();

  const handleAction = (message: string) => {
    toast({
      title: 'Action Triggered',
      description: message,
    })
  }

  const handleDownload = async () => {
    if (!previewingAdvance || !documentRef.current) {
        toast({ title: 'Error', description: 'Cannot download PDF. No document to download.', variant: 'destructive' });
        return;
    };
    await generatePdf(documentRef.current, `cash_advance_${previewingAdvance.id}.pdf`);
    toast({ title: 'Download Started', description: `Downloading PDF for CA #${previewingAdvance.id}`});
  }

  const getStatusColor = (status: CashAdvance['status']): string => {
    switch (status) {
      case 'Pending': return 'bg-amber-500';
      case 'Approved': return 'bg-blue-500';
      case 'Check Voucher Released': return 'bg-purple-500';
      case 'CV Received': return 'bg-teal-500';
      case 'Liquidated': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  const isCashierOrSupervisor = user?.role === 'Cashier' || user?.role === 'Store Supervisor';

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
            {advances.map(({ cashAdvance: ca, motorcycle }) => (
              <TableRow key={ca.id}>
                 <TableCell className="font-medium">
                  {isCashierOrSupervisor ? ca.personnel : (motorcycle?.customerName || ca.personnel)}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {isCashierOrSupervisor ? ca.purpose : (motorcycle ? `${motorcycle.make} ${motorcycle.model}` : ca.purpose)}
                </TableCell>
                <TableCell className="text-right">₱{ca.amount.toLocaleString()}</TableCell>
                <TableCell>{format(new Date(ca.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                     <span className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusColor(ca.status)}`}></span>
                    {ca.status}
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
                       <DropdownMenuItem onClick={() => setPreviewingAdvance(ca)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Preview/Print</span>
                      </DropdownMenuItem>
                      {isCashierOrSupervisor && (
                        <>
                           <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={ca.status !== 'Pending'} onClick={() => handleAction(`Approved advance for ${ca.personnel}.`)}>
                            <Check className="mr-2 h-4 w-4" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={ca.status !== 'Approved'} onClick={() => handleAction(`CV released for ${ca.personnel}.`)}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            <span>Release CV</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={ca.status !== 'Check Voucher Released'} onClick={() => handleAction(`Marked as CV Received for ${ca.personnel}.`)}>
                            <Banknote className="mr-2 h-4 w-4" />
                            <span>Mark as CV Received</span>
                          </DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive" disabled={ca.status !== 'Pending'} onClick={() => handleAction(`Rejected advance for ${ca.personnel}.`)}>
                            <X className="mr-2 h-4 w-4" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user?.role === 'Liaison' && (
                         <DropdownMenuItem disabled={!['Approved', 'CV Received'].includes(ca.status)} onClick={() => handleAction(`Liquidated advance for ${ca.personnel}.`)}>
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
      </CardContent>
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
                {previewingAdvance && <CashAdvanceDocument ref={documentRef} advance={previewingAdvance} />}
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

    </>
  );
}
