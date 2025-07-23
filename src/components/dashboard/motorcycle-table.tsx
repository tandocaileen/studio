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
import { Motorcycle } from '@/types';
import { MoreHorizontal, PlusCircle, FileText, Truck, Wrench, DollarSign, ExternalLink, Save, XCircle } from 'lucide-react';
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

type MotorcycleTableProps = {
  motorcycles: Motorcycle[];
};

export function MotorcycleTable({ motorcycles: initialMotorcycles }: MotorcycleTableProps) {
  const [motorcycles, setMotorcycles] = React.useState(initialMotorcycles);
  const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
  const [editingMotorcycleId, setEditingMotorcycleId] = React.useState<string | null>(null);
  const [editedData, setEditedData] = React.useState<Partial<Motorcycle>>({});
  const [viewingDocumentsMotorcycle, setViewingDocumentsMotorcycle] = React.useState<Motorcycle | null>(null);

  const { toast } = useToast();

  const handleAction = (message: string) => {
    toast({
      title: 'Action Triggered',
      description: message,
    });
  };

  const handleGenerateCashAdvance = async () => {
    if (selectedMotorcycles.length === 0) {
      toast({
        title: 'No Motorcycles Selected',
        description: 'Please select at least one motorcycle to generate a cash advance.',
        variant: 'destructive',
      });
      return;
    }
    
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
            expiresAt: d.expiresAt ? d.expiresAt.toISOString() : undefined
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

    setSelectedMotorcycles([]);
  };

  const handleSelectMotorcycle = (motorcycle: Motorcycle, checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedMotorcycles([...selectedMotorcycles, motorcycle]);
    } else {
      setSelectedMotorcycles(selectedMotorcycles.filter(m => m.id !== motorcycle.id));
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setMotorcycles(motorcycles);
    } else {
      setSelectedMotorcycles([]);
    }
  };


  const statusVariant = (status: Motorcycle['status']): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Registered':
        return 'secondary';
      case 'For Renewal':
        return 'destructive';
      case 'Unregistered':
        return 'default';
      default:
        return 'default';
    }
  };

  const branches = getBranches();

  const handleEditClick = (motorcycle: Motorcycle) => {
    setEditingMotorcycleId(motorcycle.id);
    setEditedData(motorcycle);
  };

  const handleCancelEdit = () => {
    setEditingMotorcycleId(null);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    if (!editingMotorcycleId) return;

    // Here you would typically make an API call to save the data
    // For this example, we'll just update the local state
    setMotorcycles(motorcycles.map(m => 
      m.id === editingMotorcycleId ? { ...m, ...editedData } as Motorcycle : m
    ));

    handleAction(`Motorcycle ${editedData.plateNumber} updated.`);
    setEditingMotorcycleId(null);
    setEditedData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setEditedData(prev => ({ ...prev, [name]: value }));
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Motorcycles</CardTitle>
            <CardDescription>
              Manage and monitor all motorcycle units.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1" onClick={handleGenerateCashAdvance} disabled={selectedMotorcycles.length === 0}>
                <DollarSign className="h-4 w-4" />
                Generate CA
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Motorcycle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Motorcycle</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new unit.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plate" className="text-right">Plate No.</Label>
                    <Input id="plate" placeholder="ABC 1234" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="make" className="text-right">Make</Label>
                    <Input id="make" placeholder="e.g., Honda" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="model" className="text-right">Model</Label>
                    <Input id="model" placeholder="e.g., Click 125i" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="branch" className="text-right">Branch</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => handleAction('New motorcycle saved.')}>Save Motorcycle</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox">
                  <Checkbox
                    checked={selectedMotorcycles.length === motorcycles.length && motorcycles.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Plate No.</TableHead>
                <TableHead>Make & Model</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Insurance Expiry</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motorcycles.map((motorcycle) => {
                const isEditing = editingMotorcycleId === motorcycle.id;
                const insurance = motorcycle.documents.find(d => d.type === 'Insurance');
                return (
                  <TableRow key={motorcycle.id} data-state={selectedMotorcycles.some(m => m.id === motorcycle.id) && "selected"}>
                     <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedMotorcycles.some(m => m.id === motorcycle.id)}
                        onCheckedChange={(checked) => handleSelectMotorcycle(motorcycle, checked)}
                        aria-label={`Select motorcycle ${motorcycle.plateNumber}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input name="plateNumber" value={editedData.plateNumber} onChange={handleInputChange} className="h-8"/>
                      ) : (
                        motorcycle.plateNumber
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input name="make" value={editedData.make} onChange={handleInputChange} className="h-8"/>
                          <Input name="model" value={editedData.model} onChange={handleInputChange} className="h-8"/>
                        </div>
                      ) : (
                        `${motorcycle.make} ${motorcycle.model}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select value={editedData.assignedBranch} onValueChange={(value) => handleSelectChange('assignedBranch', value)}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        motorcycle.assignedBranch
                      )}
                    </TableCell>
                    <TableCell>
                       {isEditing ? (
                        <Select value={editedData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                          <SelectTrigger className="h-8">
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Registered">Registered</SelectItem>
                            <SelectItem value="Unregistered">Unregistered</SelectItem>
                            <SelectItem value="For Renewal">For Renewal</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={statusVariant(motorcycle.status)}>{motorcycle.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {insurance?.expiresAt ? format(insurance.expiresAt, 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleEditClick(motorcycle)}>
                              <Truck className="mr-2 h-4 w-4" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setViewingDocumentsMotorcycle(motorcycle)}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>View Documents</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(`Logging maintenance for ${motorcycle.plateNumber}.`)}>
                              <Wrench className="mr-2 h-4 w-4" />
                              <span>Log Maintenance</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleAction(`Deleting ${motorcycle.plateNumber}.`)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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
                        <TableCell>{format(doc.uploadedAt, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{doc.expiresAt ? format(doc.expiresAt, 'MMM dd, yyyy') : 'N/A'}</TableCell>
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
    </>
  );
}
