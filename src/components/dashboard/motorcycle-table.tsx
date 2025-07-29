
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
import { Motorcycle, Document, DocumentType } from '@/types';
import { MoreHorizontal, PlusCircle, FileText, Truck, Wrench, DollarSign, ExternalLink, Save, XCircle, Trash2, CalendarIcon, ArrowUpDown } from 'lucide-react';
import { getBranches, getLiaisons } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { generateCashAdvance } from '@/ai/flows/cash-advance-flow';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { CashAdvancePreview } from './cash-advance-preview';
import { InsuranceControlForm } from './insurance-control-form';

type MotorcycleTableProps = {
  motorcycles: Motorcycle[];
  onStateChange?: (updatedMotorcycles: Motorcycle | Motorcycle[]) => void;
};

type SortableColumn = keyof Motorcycle;

const ITEMS_PER_PAGE = 10;

export function MotorcycleTable({ motorcycles: initialMotorcycles, onStateChange }: MotorcycleTableProps) {
  const [motorcycles, setMotorcycles] = React.useState(initialMotorcycles);
  const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
  const [editingMotorcycle, setEditingMotorcycle] = React.useState<Motorcycle | null>(null);
  const [editedData, setEditedData] = React.useState<Partial<Motorcycle>>({});
  const [isPreviewingCa, setIsPreviewingCa] = React.useState(false);
  const [isGeneratingCa, setIsGeneratingCa] = React.useState(false);
  const [liaisons, setLiaisons] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState<SortableColumn>('id');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  React.useEffect(() => {
    setMotorcycles(initialMotorcycles);
    setSelectedMotorcycles([]);
    setCurrentPage(1);
  }, [initialMotorcycles]);

  React.useEffect(() => {
    getLiaisons().then(setLiaisons);
  }, []);

  const { toast } = useToast();
  const { user } = useAuth();
  
  const isLiaison = user?.role === 'Liaison';
  const isSupervisor = user?.role === 'Store Supervisor';
  const isCashier = user?.role === 'Cashier';
  const canEditInsuranceAndControl = isSupervisor || isCashier;


  const handleAction = (message: string) => {
    toast({
      title: 'Action Triggered',
      description: message,
    });
  };

  const handleOpenCaPreview = () => {
     if (selectedMotorcycles.length === 0) {
      toast({
        title: 'No Motorcycles Selected',
        description: 'Please select at least one motorcycle to generate a cash advance.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedMotorcycles.some(m => m.status !== 'Endorsed - Ready')) {
        toast({
            title: 'Cannot Generate Cash Advance',
            description: 'Please only select motorcycles with an "Endorsed - Ready" status.',
            variant: 'destructive',
        });
        return;
    }
    setIsPreviewingCa(true);
  }

  const handleGenerateCashAdvance = async () => {
    setIsGeneratingCa(true);
    toast({
        title: 'AI is working...',
        description: 'Generating cash advance request for selected motorcycles.'
    });

    try {
      if (!user) throw new Error("User not found");

      const motorcyclesForAI = selectedMotorcycles.map(m => ({
        ...m,
        purchaseDate: m.purchaseDate.toISOString(),
        documents: m.documents.map(d => ({
            ...d,
            uploadedAt: d.uploadedAt.toISOString(),
            expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString() : undefined,
            type: d.type
        }))
      }));

      const result = await generateCashAdvance({ 
          motorcycles: motorcyclesForAI,
          liaison: user.name,
      });

      console.log('Cash advance generated: ', result);
      
      const updatedMotorcycles = motorcycles.map(m => 
          selectedMotorcycles.some(sm => sm.id === m.id) ? { ...m, status: 'Processing' } : m
      );
      setMotorcycles(updatedMotorcycles);
      if (onStateChange) onStateChange(updatedMotorcycles);
      
      toast({
        title: 'Cash Advance Request Submitted',
        description: `Successfully submitted CA request ${result.id} for ${result.motorcycleIds.length} units.`,
      });
    } catch(e) {
        console.error(e);
        toast({
            title: 'An unexpected error occurred',
            description: (e as Error).message,
            variant: 'destructive',
          });
    } finally {
        setIsGeneratingCa(false);
        setIsPreviewingCa(false);
        setSelectedMotorcycles([]);
    }
  };

  const handleSelectMotorcycle = (motorcycle: Motorcycle, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedMotorcycles([...selectedMotorcycles, motorcycle]);
    } else {
      setSelectedMotorcycles(selectedMotorcycles.filter(m => m.id !== motorcycle.id));
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedMotorcycles(paginatedMotorcycles.filter(m => m.status === 'Endorsed - Ready'));
    } else {
      setSelectedMotorcycles([]);
    }
  };


  const statusVariant = (status: Motorcycle['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Ready to Register': return 'default';
      case 'Endorsed - Ready': return 'secondary';
      case 'Endorsed - Incomplete': return 'destructive';
      case 'Processing': return 'default';
      case 'For Review': return 'secondary';
      case 'Incomplete': return 'outline';
      default: return 'outline';
    }
  };

  const branches = getBranches();

  const handleEditClick = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
    setEditedData(motorcycle);
  };

  const handleCancelEdit = () => {
    setEditingMotorcycle(null);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    if (!editingMotorcycle) return;

    const updatedMotorcycle = {
      ...editingMotorcycle,
      ...editedData,
    };
    
    const updatedMotorcycles = motorcycles.map(m => 
      m.id === editingMotorcycle.id ? updatedMotorcycle : m
    );

    setMotorcycles(updatedMotorcycles);
    if (onStateChange) onStateChange(updatedMotorcycles.find(m => m.id === updatedMotorcycle.id) || updatedMotorcycle);

    handleAction(`Motorcycle details updated.`);
    handleCancelEdit();
  };

  const handleDataChange = (fieldName: keyof Motorcycle, value: any) => {
    setEditedData(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const isGenerateCaDisabled = selectedMotorcycles.length === 0 || selectedMotorcycles.some(m => m.status !== 'Endorsed - Ready');

  const sortedMotorcycles = React.useMemo(() => {
    return [...motorcycles].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [motorcycles, sortColumn, sortDirection]);
  

  const totalPages = Math.ceil(sortedMotorcycles.length / ITEMS_PER_PAGE);
  const paginatedMotorcycles = sortedMotorcycles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isAllOnPageSelectable = paginatedMotorcycles.every(pm => pm.status === 'Endorsed - Ready');
  const isAllSelectedOnPage = paginatedMotorcycles.length > 0 && 
    paginatedMotorcycles
      .filter(pm => pm.status === 'Endorsed - Ready')
      .every(pm => selectedMotorcycles.some(sm => sm.id === pm.id));

  const SortableHeader = ({ column, children }: { column: SortableColumn, children: React.ReactNode }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer">
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && <ArrowUpDown className="h-4 w-4" />}
      </div>
    </TableHead>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Motorcycles</CardTitle>
            <CardDescription>
              {isLiaison 
                ? "Unregistered motorcycles assigned to you."
                : "Manage and monitor all motorcycle units."
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isLiaison && (
              <Button size="sm" className="gap-1" onClick={handleOpenCaPreview} loading={isGeneratingCa} disabled={isGenerateCaDisabled}>
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Generate CA</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isLiaison && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelectedOnPage && isAllOnPageSelectable}
                      onCheckedChange={(checked) => handleSelectAll(checked)}
                      aria-label="Select all"
                      disabled={!isAllOnPageSelectable}
                    />
                  </TableHead>
                )}
                 {!isLiaison && (isSupervisor || isCashier) && <TableHead className="w-[40px]"></TableHead>}
                <SortableHeader column="id">Sales ID</SortableHeader>
                <SortableHeader column="salesInvoiceNo">SI No.</SortableHeader>
                <SortableHeader column="customerName">Customer Name</SortableHeader>
                <SortableHeader column="accountCode">Account Code</SortableHeader>
                <SortableHeader column="chassisNumber">Chassis No.</SortableHeader>
                <SortableHeader column="csrNumber">CSR No.</SortableHeader>
                <SortableHeader column="crNumber">CR No.</SortableHeader>
                <SortableHeader column="hpgControlNumber">HPG Control</SortableHeader>
                <SortableHeader column="status">Status</SortableHeader>
                <TableHead className="w-[100px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMotorcycles.map((motorcycle) => (
                  <TableRow key={motorcycle.id} data-state={selectedMotorcycles.some(m => m.id === motorcycle.id) ? "selected" : undefined}>
                    {isLiaison && (
                      <TableCell>
                        <Checkbox
                          checked={selectedMotorcycles.some(m => m.id === motorcycle.id)}
                          onCheckedChange={(checked) => handleSelectMotorcycle(motorcycle, checked)}
                          aria-label={`Select motorcycle ${motorcycle.plateNumber}`}
                          disabled={motorcycle.status !== 'Endorsed - Ready'}
                        />
                      </TableCell>
                    )}
                    {!isLiaison && (isSupervisor || isCashier) && <TableCell></TableCell>}
                    <TableCell>{motorcycle.id}</TableCell>
                    <TableCell>{motorcycle.salesInvoiceNo}</TableCell>
                    <TableCell className="font-medium">{motorcycle.customerName}</TableCell>
                    <TableCell>{motorcycle.accountCode}</TableCell>
                    <TableCell>{motorcycle.chassisNumber}</TableCell>
                    <TableCell>{motorcycle.csrNumber || 'N/A'}</TableCell>
                    <TableCell>{motorcycle.crNumber || 'N/A'}</TableCell>
                    <TableCell>{motorcycle.hpgControlNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(motorcycle.status)}>{motorcycle.status}</Badge>
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
                          <DropdownMenuItem onClick={() => handleEditClick(motorcycle)}>
                            <Truck className="mr-2 h-4 w-4" />
                            <span>View / Edit Details</span>
                          </DropdownMenuItem>
                          
                           {canEditInsuranceAndControl && (
                            <>
                              <DropdownMenuItem onClick={() => handleAction(`Logging maintenance for ${motorcycle.plateNumber}.`)}>
                                <Wrench className="mr-2 h-4 w-4" />
                                <span>Log Maintenance</span>
                              </DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem className="text-destructive" onClick={() => handleAction(`Deleting ${motorcycle.plateNumber}.`)}>Delete</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
           {motorcycles.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">No motorcycles to display.</div>
            )}
        </CardContent>
         <CardFooter>
            <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                    Showing {Math.min(paginatedMotorcycles.length, motorcycles.length)} of {motorcycles.length} motorcycles.
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
      
      {/* Edit Motorcycle Dialog */}
      <Dialog open={!!editingMotorcycle} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="sm:max-w-2xl max-w-[90vw] max-h-[90vh]">
              <DialogHeader>
                  <DialogTitle>
                    View / Edit Details - {editingMotorcycle?.customerName}
                  </DialogTitle>
                  <DialogDescription>
                      Update details for this unit.
                  </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="grid gap-4 py-4 pr-6">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-2">Motorcycle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="edit-id">Sales ID</Label>
                          <Input id="edit-id" value={editedData.id || ''} disabled />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-salesInvoiceNo">SI No.</Label>
                          <Input id="edit-salesInvoiceNo" value={editedData.salesInvoiceNo || ''} disabled />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-customerName">Customer Name</Label>
                          <Input id="edit-customerName" value={editedData.customerName || ''} disabled />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-accountCode">Account Code</Label>
                          <Input id="edit-accountCode" value={editedData.accountCode || ''} disabled />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-status">Status</Label>
                          <Input id="edit-status" value={editedData.status || ''} disabled />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-assignedLiaison">Assigned Liaison</Label>
                          <Input id="edit-assignedLiaison" value={editedData.assignedLiaison || 'N/A'} disabled />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-csrNumber">CSR No. <span className="text-destructive">*</span></Label>
                          <Input id="edit-csrNumber" name="csrNumber" value={editedData.csrNumber || ''} onChange={(e) => handleDataChange('csrNumber', e.target.value)} className={cn(!editedData.csrNumber && 'border-destructive')} />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-crNumber">CR No. <span className="text-destructive">*</span></Label>
                          <Input id="edit-crNumber" name="crNumber" value={editedData.crNumber || ''} onChange={(e) => handleDataChange('crNumber', e.target.value)} className={cn(!editedData.crNumber && 'border-destructive')} />
                      </div>
                       <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="edit-hpgControlNumber">HPG Control No.</Label>
                          <Input id="edit-hpgControlNumber" name="hpgControlNumber" value={editedData.hpgControlNumber || ''} onChange={(e) => handleDataChange('hpgControlNumber', e.target.value)} />
                      </div>
                    </div>
                    
                    <InsuranceControlForm 
                        editedData={editedData}
                        onDataChange={handleDataChange}
                        canEdit={canEditInsuranceAndControl}
                    />

                </div>
              </ScrollArea>
              <DialogFooter>
                  <Button variant="outline" onClick={handleCancelEdit}>Close</Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
       {/* CA Preview Dialog */}
      <Dialog open={isPreviewingCa} onOpenChange={setIsPreviewingCa}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Cash Advance Request Preview</DialogTitle>
                <DialogDescription>
                    Review the details below. The total amount will be requested for cash advance.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[70vh] overflow-y-auto p-2 border rounded-md">
                <CashAdvancePreview motorcycles={selectedMotorcycles} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreviewingCa(false)}>Cancel</Button>
                <Button onClick={handleGenerateCashAdvance} loading={isGeneratingCa}>Submit Request</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
