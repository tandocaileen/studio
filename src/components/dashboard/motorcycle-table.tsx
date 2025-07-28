
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
import { Document, Motorcycle, DocumentType } from '@/types';
import { MoreHorizontal, PlusCircle, FileText, Truck, Wrench, DollarSign, ExternalLink, Save, XCircle, Trash2, CalendarIcon } from 'lucide-react';
import { getBranches } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { generateCashAdvance, GenerateCashAdvanceInput } from '@/ai/flows/cash-advance-flow';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { CashAdvancePreview } from './cash-advance-preview';

type MotorcycleTableProps = {
  motorcycles: Motorcycle[];
};

type NewDocument = {
  id: number;
  type: DocumentType;
  file: File | null;
  url?: string;
  uploadedAt?: Date;
  expiresAt?: Date;
};

const ALL_DOC_TYPES: DocumentType[] = ['OR/CR', 'COC', 'Insurance', 'CSR', 'HPG Control Form'];

export function MotorcycleTable({ motorcycles: initialMotorcycles }: MotorcycleTableProps) {
  const [motorcycles, setMotorcycles] = React.useState(initialMotorcycles);
  const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
  const [editingMotorcycle, setEditingMotorcycle] = React.useState<Motorcycle | null>(null);
  const [editedData, setEditedData] = React.useState<Partial<Motorcycle>>({});
  const [editedDocuments, setEditedDocuments] = React.useState<NewDocument[]>([]);
  const [viewingDocumentsMotorcycle, setViewingDocumentsMotorcycle] = React.useState<Motorcycle | null>(null);
  const [newDocuments, setNewDocuments] = React.useState<NewDocument[]>([]);
  const [isPreviewingCa, setIsPreviewingCa] = React.useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  
  const isLiaison = user?.role === 'Liaison';
  const isSupervisor = user?.role === 'Store Supervisor';
  const isCashier = user?.role === 'Cashier';

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

    if (selectedMotorcycles.some(m => m.status === 'Incomplete')) {
        toast({
            title: 'Cannot Generate Cash Advance',
            description: 'Please unselect motorcycles with an "Incomplete" status.',
            variant: 'destructive',
        });
        return;
    }
    setIsPreviewingCa(true);
  }

  const handleGenerateCashAdvance = async () => {
    
    toast({
        title: 'AI is working...',
        description: 'Generating cash advance requests for selected motorcycles.'
    });

    try {
      const motorcyclesForAI: GenerateCashAdvanceInput['motorcycles'] = selectedMotorcycles.map(m => ({
        ...m,
        purchaseDate: m.purchaseDate.toISOString(),
        documents: m.documents.map(d => ({
            ...d,
            uploadedAt: d.uploadedAt.toISOString(),
            expiresAt: d.expiresAt ? d.expiresAt.toISOString() : undefined,
            type: d.type
        }))
      }));

      const result = await generateCashAdvance({ motorcycles: motorcyclesForAI });
      console.log('Cash advance generated: ', result);
      toast({
        title: 'Cash Advance Generated',
        description: `Successfully generated ${result.cashAdvances.length} cash advance requests.`,
      });
    } catch(e) {
        console.error(e);
        toast({
            title: 'An unexpected error occurred',
            description: (e as Error).message,
            variant: 'destructive',
          });
    }
    
    setIsPreviewingCa(false);
    setSelectedMotorcycles([]);
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
      setSelectedMotorcycles(motorcycles);
    } else {
      setSelectedMotorcycles([]);
    }
  };


  const statusVariant = (status: Motorcycle['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Registered':
        return 'secondary';
      case 'For Renewal':
        return 'destructive';
      case 'Ready to Register':
        return 'default';
      case 'Incomplete':
        return 'outline';
      default:
        return 'default';
    }
  };

  const branches = getBranches();

  const handleEditClick = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
    setEditedData(motorcycle);
    setEditedDocuments(motorcycle.documents.map((doc, index) => ({
      id: index,
      type: doc.type,
      file: null,
      url: doc.url,
      uploadedAt: doc.uploadedAt,
      expiresAt: doc.expiresAt
    })));
  };

  const handleCancelEdit = () => {
    setEditingMotorcycle(null);
    setEditedData({});
    setEditedDocuments([]);
  };

  const handleSaveEdit = () => {
    if (!editingMotorcycle) return;

    // Here you would handle the logic to save the updated motorcycle data
    // and upload/delete documents. For this demo, we'll just update the local state.

    const updatedMotorcycle = {
      ...editingMotorcycle,
      ...editedData,
      documents: editedDocuments.map(doc => ({
        type: doc.type,
        url: doc.url || '#',
        uploadedAt: doc.uploadedAt || new Date(),
        expiresAt: doc.expiresAt,
      })) as Document[],
    };

    setMotorcycles(motorcycles.map(m => 
      m.id === editingMotorcycle.id ? updatedMotorcycle : m
    ));

    handleAction(`Motorcycle ${updatedMotorcycle.plateNumber} details updated.`);
    handleCancelEdit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditedData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setEditedData(prev => ({ ...prev, [name]: value as any }));
  };
  
  const handleAddNewDocument = () => {
    setNewDocuments(prev => [...prev, { id: Date.now(), type: 'OR/CR', file: null }]);
  }

  const handleRemoveDocument = (id: number, isNew: boolean) => {
    if (isNew) {
      setNewDocuments(prev => prev.filter(doc => doc.id !== id));
    } else {
      setEditedDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  }

  const handleDocumentChange = (id: number, field: keyof NewDocument, value: any, isNew: boolean) => {
    const setDocs = isNew ? setNewDocuments : setEditedDocuments;
    setDocs(prev => prev.map(doc => doc.id === id ? { ...doc, [field]: value } : doc));
  }

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDocumentChange(id, 'file', e.target.files[0], isNew);
    }
  };

  const isGenerateCaDisabled = selectedMotorcycles.length === 0 || selectedMotorcycles.some(m => m.status === 'Incomplete');


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
              <Button size="sm" className="gap-1" onClick={handleOpenCaPreview} disabled={isGenerateCaDisabled}>
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Generate CA</span>
              </Button>
            )}
            {isSupervisor && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Motorcycle</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Add New Motorcycle</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the new unit.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh]">
                    <div className="grid gap-4 py-4 pr-6">
                      <h3 className="font-semibold text-lg border-b pb-2 mb-2">Motorcycle Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="plate">Plate No.</Label>
                            <Input id="plate" placeholder="ABC 1234" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input id="customerName" placeholder="e.g., John Doe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="make">Make</Label>
                            <Input id="make" placeholder="e.g., Honda" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="model">Model</Label>
                            <Input id="model" placeholder="e.g., Click 125i" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="engineNumber">Engine No.</Label>
                            <Input id="engineNumber" placeholder="e.g., E12345678" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chassisNumber">Chassis No.</Label>
                            <Input id="chassisNumber" placeholder="e.g., C12345678" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                              </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="assignedLiaison">Assign Liaison</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a liaison" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* TODO: Populate with actual liaison users */}
                                <SelectItem value="John Doe">John Doe</SelectItem>
                                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                                <SelectItem value="Peter Jones">Peter Jones</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg border-b pb-2 mt-4 mb-2">Insurance & Control</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label htmlFor="cocNumber">COC No.</Label>
                              <Input id="cocNumber" placeholder="Enter COC number" />
                          </div>
                           <div className="grid gap-2">
                              <Label htmlFor="policyNumber">Policy No.</Label>
                              <Input id="policyNumber" placeholder="Enter policy number" />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="insuranceType">Insurance Type</Label>
                              <Input id="insuranceType" placeholder="e.g., Comprehensive" />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="hpgControlNumber">HPG Control No.</Label>
                              <Input id="hpgControlNumber" placeholder="Enter HPG Control number" />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="sarCode">SAR Code</Label>
                              <Input id="sarCode" placeholder="Enter SAR code" />
                          </div>
                       </div>
                       
                      <h3 className="font-semibold text-lg border-b pb-2 mt-4 mb-2">Fees</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label htmlFor="processingFee">Processing Fee</Label>
                              <Input id="processingFee" type="number" defaultValue="1500" disabled />
                          </div>
                           <div className="grid gap-2">
                              <Label htmlFor="orFee">OR Fee</Label>
                              <Input id="orFee" type="number" defaultValue="1000" disabled />
                          </div>
                       </div>

                      <div className="col-span-full mt-4">
                        <Label className="text-lg font-semibold">Documents</Label>
                        <div className="space-y-4 mt-2">
                          {newDocuments.map((doc, index) => (
                            <div key={doc.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg relative">
                               <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => handleRemoveDocument(doc.id, true)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`doc-type-${index}`} className="text-right">Type</Label>
                                <Select
                                  value={doc.type}
                                  onValueChange={(value: DocumentType) => handleDocumentChange(doc.id, 'type', value, true)}
                                >
                                  <SelectTrigger id={`doc-type-${index}`} className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ALL_DOC_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`doc-file-${index}`} className="text-right">File</Label>
                                <Input id={`doc-file-${index}`} type="file" className="col-span-3" onChange={(e) => handleFileChange(doc.id, e, true)} />
                              </div>
                              {doc.type === 'Insurance' || doc.type === 'OR/CR' ? (
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor={`doc-expiry-${index}`} className="text-right">Expiry / Effectivity</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "col-span-3 justify-start text-left font-normal",
                                            !doc.expiresAt && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {doc.expiresAt ? format(doc.expiresAt, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={doc.expiresAt}
                                          onSelect={(date) => handleDocumentChange(doc.id, 'expiresAt', date, true)}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                </div>
                              ) : null}
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={handleAddNewDocument}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                     <Button variant="outline" onClick={() => (document.querySelector('[aria-label="Close"]') as HTMLElement)?.click()}>Cancel</Button>
                    <Button type="submit" onClick={() => handleAction('New motorcycle saved.')}>Save Motorcycle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedMotorcycles.length === motorcycles.length && motorcycles.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Sale ID</TableHead>
                <TableHead>SI No.</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Plate No.</TableHead>
                <TableHead>Make & Model</TableHead>
                <TableHead>Engine No.</TableHead>
                <TableHead>Chassis No.</TableHead>
                <TableHead>CSR No.</TableHead>
                <TableHead>CR/OR No.</TableHead>
                <TableHead>HPG Control No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motorcycles.map((motorcycle) => (
                  <TableRow key={motorcycle.id} data-state={selectedMotorcycles.some(m => m.id === motorcycle.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMotorcycles.some(m => m.id === motorcycle.id)}
                        onCheckedChange={(checked) => handleSelectMotorcycle(motorcycle, checked)}
                        aria-label={`Select motorcycle ${motorcycle.plateNumber}`}
                      />
                    </TableCell>
                    <TableCell>{motorcycle.id}</TableCell>
                    <TableCell>{motorcycle.salesInvoiceNo}</TableCell>
                    <TableCell>{motorcycle.accountCode}</TableCell>
                    <TableCell className="font-medium">{motorcycle.customerName}</TableCell>
                    <TableCell>{motorcycle.plateNumber}</TableCell>
                    <TableCell>
                        <div>{motorcycle.make}</div>
                        <div className="text-xs text-muted-foreground">{motorcycle.model}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{motorcycle.engineNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{motorcycle.chassisNumber}</TableCell>
                    <TableCell>{motorcycle.documents.find(d => d.type === 'CSR')?.url.slice(-8) || 'N/A'}</TableCell>
                    <TableCell>{motorcycle.documents.find(d => d.type === 'OR/CR')?.url.slice(-8) || 'N/A'}</TableCell>
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
                            <span>{isLiaison ? 'View Details' : 'Edit Details'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setViewingDocumentsMotorcycle(motorcycle)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View Documents</span>
                          </DropdownMenuItem>
                           {isSupervisor && (
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
        </CardContent>
      </Card>
      
      {/* Edit Motorcycle Dialog */}
      <Dialog open={!!editingMotorcycle} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[90vh]">
              <DialogHeader>
                  <DialogTitle>
                    {isLiaison ? 'View Motorcycle' : 'Edit Motorcycle'} - {editingMotorcycle?.plateNumber}
                  </DialogTitle>
                  <DialogDescription>
                      {isLiaison ? 'Viewing details for this unit.' : 'Update the details and documents for this unit.'}
                  </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="grid gap-4 py-4 pr-6">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-2">Motorcycle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="edit-plateNumber">Plate No.</Label>
                          <Input id="edit-plateNumber" name="plateNumber" value={editedData.plateNumber || ''} onChange={handleInputChange} disabled={isLiaison} />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-customerName">Customer Name</Label>
                          <Input id="edit-customerName" name="customerName" value={editedData.customerName || ''} onChange={handleInputChange} disabled={isLiaison} />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-make">Make</Label>
                          <Input id="edit-make" name="make" value={editedData.make || ''} onChange={handleInputChange} disabled={isLiaison} />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-model">Model</Label>
                          <Input id="edit-model" name="model" value={editedData.model || ''} onChange={handleInputChange} disabled={isLiaison} />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-engineNumber">Engine No.</Label>
                          <Input id="edit-engineNumber" name="engineNumber" value={editedData.engineNumber || ''} onChange={handleInputChange} disabled={isLiaison} />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="edit-chassisNumber">Chassis No.</Label>
                          <Input id="edit-chassisNumber" name="chassisNumber" value={editedData.chassisNumber || ''} onChange={handleInputChange} disabled={isLiaison} />
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-branch">Branch</Label>
                           <Select value={editedData.assignedBranch} onValueChange={(value) => handleSelectChange('assignedBranch', value)} disabled={isLiaison}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="edit-assignedLiaison">Assign Liaison</Label>
                           <Select value={editedData.assignedLiaison} onValueChange={(value) => handleSelectChange('assignedLiaison', value)} disabled={isLiaison}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a liaison" />
                            </SelectTrigger>
                            <SelectContent>
                               {/* TODO: Populate with actual liaison users */}
                              <SelectItem value="John Doe">John Doe</SelectItem>
                              <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                              <SelectItem value="Peter Jones">Peter Jones</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={editedData.status} onValueChange={(value) => handleSelectChange('status', value)} disabled={isLiaison}>
                          <SelectTrigger>
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Incomplete">Incomplete</SelectItem>
                            <SelectItem value="Ready to Register">Ready to Register</SelectItem>
                            <SelectItem value="Registered">Registered</SelectItem>
                            <SelectItem value="For Renewal">For Renewal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg border-b pb-2 mt-4 mb-2">Insurance & Control</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-cocNumber">COC No.</Label>
                            <Input id="edit-cocNumber" name="cocNumber" value={editedData.cocNumber || ''} onChange={handleInputChange} disabled={isLiaison} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="edit-policyNumber">Policy No.</Label>
                            <Input id="edit-policyNumber" name="policyNumber" value={editedData.policyNumber || ''} onChange={handleInputChange} disabled={isLiaison} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-insuranceType">Insurance Type</Label>
                            <Input id="edit-insuranceType" name="insuranceType" value={editedData.insuranceType || ''} onChange={handleInputChange} disabled={isLiaison} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-hpgControlNumber">HPG Control No.</Label>
                            <Input id="edit-hpgControlNumber" name="hpgControlNumber" value={editedData.hpgControlNumber || ''} onChange={handleInputChange} disabled={isLiaison} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-sarCode">SAR Code</Label>
                            <Input id="edit-sarCode" name="sarCode" value={editedData.sarCode || ''} onChange={handleInputChange} disabled={isLiaison} />
                        </div>
                     </div>

                     <h3 className="font-semibold text-lg border-b pb-2 mt-4 mb-2">Fees</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-processingFee">Processing Fee</Label>
                            <Input id="edit-processingFee" name="processingFee" value={editedData.processingFee || 1500} type="number" disabled />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="edit-orFee">OR Fee</Label>
                            <Input id="edit-orFee" name="orFee" value={editedData.orFee || 1000} type="number" disabled />
                        </div>
                     </div>

                    {/* Document Management */}
                     <div className="col-span-full mt-4">
                      <Label className="text-lg font-semibold">Documents</Label>
                      <div className="space-y-4 mt-2">
                        {editedDocuments.map((doc, index) => (
                          <div key={doc.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg relative">
                             <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => handleRemoveDocument(doc.id, false)}
                              disabled={isLiaison}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor={`edit-doc-type-${index}`} className="text-right">Type</Label>
                              <Select
                                value={doc.type}
                                onValueChange={(value: DocumentType) => handleDocumentChange(doc.id, 'type', value, false)}
                                disabled={isLiaison}
                              >
                                <SelectTrigger id={`edit-doc-type-${index}`} className="col-span-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   {ALL_DOC_TYPES.map(type => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`edit-doc-file-${index}`} className="text-right">File</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input id={`edit-doc-file-${index}`} type="file" className="flex-grow" onChange={(e) => handleFileChange(doc.id, e, false)} disabled={isLiaison} />
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            View Current <ExternalLink className="ml-2 h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            {doc.type === 'Insurance' || doc.type === 'OR/CR' ? (
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`edit-doc-expiry-${index}`} className="text-right">Expiry / Effectivity</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "col-span-3 justify-start text-left font-normal",
                                          !doc.expiresAt && "text-muted-foreground"
                                        )}
                                        disabled={isLiaison}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {doc.expiresAt ? format(new Date(doc.expiresAt), "PPP") : <span>Pick a date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={doc.expiresAt ? new Date(doc.expiresAt) : undefined}
                                        onSelect={(date) => handleDocumentChange(doc.id, 'expiresAt', date, false)}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                              </div>
                            ) : null}
                          </div>
                        ))}
                         {/* This is where you might add a button to add NEW documents during an edit */}
                      </div>
                    </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                  <Button variant="outline" onClick={handleCancelEdit}>Close</Button>
                  {!isLiaison && <Button onClick={handleSaveEdit}>Save Changes</Button>}
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* View Documents Dialog */}
      <Dialog open={!!viewingDocumentsMotorcycle} onOpenChange={(open) => !open && setViewingDocumentsMotorcycle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documents for {viewingDocumentsMotorcycle?.plateNumber}</DialogTitle>
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
                            <Button variant="outline" size="sm" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    View <ExternalLink className="ml-2 h-3 w-3" />
                                </a>
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
                <Button onClick={handleGenerateCashAdvance}>Submit Request</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
