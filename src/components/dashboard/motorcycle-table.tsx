
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
import { MoreHorizontal, PlusCircle, FileText, Truck, Wrench, DollarSign, ExternalLink, Save, XCircle, Trash2, CalendarIcon } from 'lucide-react';
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

type MotorcycleTableProps = {
  motorcycles: Motorcycle[];
  onStateChange?: (updatedMotorcycles: Motorcycle | Motorcycle[]) => void;
};

const ITEMS_PER_PAGE = 10;

export function MotorcycleTable({ motorcycles: initialMotorcycles, onStateChange }: MotorcycleTableProps) {
  const [motorcycles, setMotorcycles] = React.useState(initialMotorcycles);
  const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
  const [editingMotorcycle, setEditingMotorcycle] = React.useState<Motorcycle | null>(null);
  const [editedData, setEditedData] = React.useState<Partial<Motorcycle>>({});
  const [viewingDocumentsMotorcycle, setViewingDocumentsMotorcycle] = React.useState<Motorcycle | null>(null);
  const [isPreviewingCa, setIsPreviewingCa] = React.useState(false);
  const [isGeneratingCa, setIsGeneratingCa] = React.useState(false);
  const [liaisons, setLiaisons] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  
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
      status: 'Ready to Register', // Change status upon saving details
    };
    
    const updatedMotorcycles = motorcycles.map(m => 
      m.id === editingMotorcycle.id ? updatedMotorcycle : m
    );

    setMotorcycles(updatedMotorcycles);
    if (onStateChange) onStateChange(updatedMotorcycles);

    handleAction(`Motorcycle ${updatedMotorcycle.plateNumber} details updated.`);
    handleCancelEdit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditedData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };
  
  const isGenerateCaDisabled = selectedMotorcycles.length === 0 || selectedMotorcycles.some(m => m.status !== 'Endorsed - Ready');

  const totalPages = Math.ceil(motorcycles.length / ITEMS_PER_PAGE);
  const paginatedMotorcycles = motorcycles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isAllOnPageSelectable = paginatedMotorcycles.every(pm => pm.status === 'Endorsed - Ready');
  const isAllSelectedOnPage = paginatedMotorcycles.length > 0 && 
    paginatedMotorcycles
      .filter(pm => pm.status === 'Endorsed - Ready')
      .every(pm => selectedMotorcycles.some(sm => sm.id === pm.id));

  const insuranceTypes = ['TPL', 'Comprehensive', 'TPL + OD', 'TPL + Theft'];

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
                <TableHead>Sale ID</TableHead>
                <TableHead>SI No.</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead>Customer Name</TableHead>
                {isLiaison ? (
                  <>
                    <TableHead>Plate No.</TableHead>
                    <TableHead>Make &amp; Model</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>CSR No.</TableHead>
                    <TableHead>CR No.</TableHead>
                  </>
                )}
                <TableHead>Engine No.</TableHead>
                <TableHead>Chassis No.</TableHead>
                <TableHead>Status</TableHead>
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
                    <TableCell>{motorcycle.accountCode}</TableCell>
                    <TableCell className="font-medium">{motorcycle.customerName}</TableCell>
                    {isLiaison ? (
                       <>
                        <TableCell>{motorcycle.plateNumber}</TableCell>
                        <TableCell>
                            <div>{motorcycle.make}</div>
                            <div className="text-xs text-muted-foreground">{motorcycle.model}</div>
                        </TableCell>
                       </>
                    ) : (
                        <>
                            <TableCell>{motorcycle.csrNumber || 'N/A'}</TableCell>
                            <TableCell>{motorcycle.crNumber || 'N/A'}</TableCell>
                        </>
                    )}
                    <TableCell className="font-mono text-xs">{motorcycle.engineNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{motorcycle.chassisNumber}</TableCell>
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
                          <DropdownMenuItem onClick={() => setViewingDocumentsMotorcycle(motorcycle)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View Documents</span>
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
          <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[90vh]">
              <DialogHeader>
                  <DialogTitle>
                    View / Edit Details - {editingMotorcycle?.customerName}
                  </DialogTitle>
                  <DialogDescription>
                      Update the insurance and control details for this unit.
                  </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="grid gap-4 py-4 pr-6">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-2">Motorcycle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="edit-customerName">Customer Name</Label>
                          <Input id="edit-customerName" name="customerName" value={editedData.customerName || ''} disabled />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-make">Make</Label>
                          <Input id="edit-make" name="make" value={editedData.make || ''} disabled />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-model">Model</Label>
                          <Input id="edit-model" name="model" value={editedData.model || ''} disabled />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-engineNumber">Engine No.</Label>
                          <Input id="edit-engineNumber" name="engineNumber" value={editedData.engineNumber || ''} disabled />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-chassisNumber">Chassis No.</Label>
                          <Input id="edit-chassisNumber" name="chassisNumber" value={editedData.chassisNumber || ''} disabled />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-branch">Branch</Label>
                           <Select value={editedData.assignedBranch} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-accountCode">Account Code</Label>
                          <Input id="edit-accountCode" name="accountCode" value={editedData.accountCode || ''} disabled />
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg border-b pb-2 mt-4 mb-2">Insurance &amp; Control</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-cocNumber">COC No.</Label>
                            <Input id="edit-cocNumber" name="cocNumber" value={editedData.cocNumber || ''} onChange={handleInputChange} disabled={!canEditInsuranceAndControl} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="edit-policyNumber">Policy No.</Label>
                            <Input id="edit-policyNumber" name="policyNumber" value={editedData.policyNumber || ''} onChange={handleInputChange} disabled={!canEditInsuranceAndControl} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-insuranceType">Insurance Type</Label>
                             <Select
                                value={editedData.insuranceType || ''}
                                onValueChange={(value) => setEditedData(prev => ({ ...prev, insuranceType: value }))}
                                disabled={!canEditInsuranceAndControl}
                            >
                                <SelectTrigger id="edit-insuranceType">
                                    <SelectValue placeholder="Select insurance type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {insuranceTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-hpgControlNumber">HPG Control No.</Label>
                            <Input id="edit-hpgControlNumber" name="hpgControlNumber" value={editedData.hpgControlNumber || ''} onChange={handleInputChange} disabled={!canEditInsuranceAndControl} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-sarCode">SAR Code</Label>
                            <Input id="edit-sarCode" name="sarCode" value={editedData.sarCode || ''} onChange={handleInputChange} disabled={!canEditInsuranceAndControl} required />
                        </div>
                     </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                  <Button variant="outline" onClick={handleCancelEdit}>Close</Button>
                  {canEditInsuranceAndControl && <Button onClick={handleSaveEdit}>Save Changes</Button>}
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* View Documents Dialog */}
      <Dialog open={!!viewingDocumentsMotorcycle} onOpenChange={(open) => !open && setViewingDocumentsMotorcycle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documents for {viewingDocumentsMotorcycle?.plateNumber}</DialogTitle>
             <DialogDescription>
                View all uploaded documents for this motorcycle.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {viewingDocumentsMotorcycle?.documents && viewingDocumentsMotorcycle.documents.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Uploaded On</TableHead>
                        <TableHead>Expires On</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {viewingDocumentsMotorcycle.documents.map((doc, index) => (
                    <TableRow key={index}>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{doc.expiresAt ? format(new Date(doc.expiresAt), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                        <TableCell>
                           <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                                View <ExternalLink className="ml-2 h-3 w-3 inline-block" />
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            ) : (
                <p className="text-sm text-muted-foreground">No documents found for this motorcycle.</p>
            )}
          </div>
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
