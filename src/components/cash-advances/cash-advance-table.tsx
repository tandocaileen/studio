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
import { MoreHorizontal, PlusCircle, Check, X, FileUp, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CashAdvanceDocument } from './cash-advance-document';
import { generatePdf } from '@/lib/pdf';

type CashAdvanceTableProps = {
  cashAdvances: CashAdvance[];
};

export function CashAdvanceTable({ cashAdvances: initialCashAdvances }: CashAdvanceTableProps) {
  const [cashAdvances, setCashAdvances] = React.useState(initialCashAdvances);
  const [previewingAdvance, setPreviewingAdvance] = React.useState<CashAdvance | null>(null);
  const { toast } = useToast();
  const documentRef = React.useRef(null);

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

  const statusVariant = (status: CashAdvance['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'Approved':
        return 'outline';
      case 'Liquidated':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getStatusColor = (status: CashAdvance['status']): string => {
    switch (status) {
      case 'Pending': return 'bg-amber-500';
      case 'Approved': return 'bg-blue-500';
      case 'Liquidated': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Cash Advance Request</DialogTitle>
              <DialogDescription>
                Fill in the details for the request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="personnel" className="text-right">Personnel</Label>
                <Input id="personnel" placeholder="e.g., John Doe" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount</Label>
                <Input id="amount" type="number" placeholder="e.g., 2500" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purpose" className="text-right">Purpose</Label>
                <Textarea id="purpose" placeholder="Describe the purpose of the advance..." className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => handleAction('New cash advance request submitted.')}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personnel</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashAdvances.map((ca) => (
              <TableRow key={ca.id}>
                <TableCell className="font-medium">{ca.personnel}</TableCell>
                <TableCell className="max-w-[300px] truncate">{ca.purpose}</TableCell>
                <TableCell className="text-right">₱{ca.amount.toLocaleString()}</TableCell>
                <TableCell>{format(new Date(ca.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(ca.status)} className="capitalize">
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
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={ca.status !== 'Pending'} onClick={() => handleAction(`Approved advance for ${ca.personnel}.`)}>
                        <Check className="mr-2 h-4 w-4" />
                        <span>Approve</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={ca.status !== 'Approved'} onClick={() => handleAction(`Liquidated advance for ${ca.personnel}.`)}>
                        <FileUp className="mr-2 h-4 w-4" />
                        <span>Liquidate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" disabled={ca.status !== 'Pending'} onClick={() => handleAction(`Rejected advance for ${ca.personnel}.`)}>
                        <X className="mr-2 h-4 w-4" />
                        <span>Reject</span>
                      </DropdownMenuItem>
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
