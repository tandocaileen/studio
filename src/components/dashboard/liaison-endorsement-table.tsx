
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Motorcycle, Endorsement, MotorcycleStatus, LiaisonUser } from '@/types';
import { ChevronDown, DollarSign, Eye, ChevronsRight, ChevronsLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { generateCashAdvance } from '@/ai/flows/cash-advance-flow';
import { useAuth } from '@/context/AuthContext';
import { CashAdvancePreview } from './cash-advance-preview';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { MotorcycleDetailsDialog } from './motorcycle-details-dialog';
import { Textarea } from '../ui/textarea';
import { addCashAdvance, getLiaisons, updateMotorcycles } from '@/lib/data';
import { CardFooter } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

type LiaisonEndorsementTableProps = {
  endorsements: Endorsement[];
  motorcycles: Motorcycle[];
  onStateChange?: (updatedMotorcycles: Motorcycle | Motorcycle[]) => void;
  searchQuery: string;
};

type EnrichedEndorsement = {
    endorsement: Endorsement;
    motorcycles: Motorcycle[];
};

const ITEMS_PER_PAGE = 5;

export function LiaisonEndorsementTable({
  endorsements,
  motorcycles,
  onStateChange,
  searchQuery,
}: LiaisonEndorsementTableProps) {
  const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
  const [isPreviewingCa, setIsPreviewingCa] = React.useState(false);
  const [isGeneratingCa, setIsGeneratingCa] = React.useState(false);
  const [viewingEndorsement, setViewingEndorsement] = React.useState<EnrichedEndorsement | null>(null);
  const [editingMotorcycle, setEditingMotorcycle] = React.useState<Motorcycle | null>(null);
  const [remarks, setRemarks] = React.useState('');
  const [openEndorsements, setOpenEndorsements] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  const filteredEndorsements = React.useMemo(() => {
    return endorsements.filter(e => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        if (e.id.toLowerCase().includes(query)) return true;
        if (e.createdBy.toLowerCase().includes(query)) return true;
        
        const associatedMotorcycles = motorcycles.filter(m => e.motorcycleIds.includes(m.id));
        if (associatedMotorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
        if (associatedMotorcycles.some(m => m.plateNumber?.toLowerCase().includes(query))) return true;
        
        return false;
    });
  }, [endorsements, motorcycles, searchQuery]);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, endorsements]);


  const handleSelectMotorcycle = (motorcycle: Motorcycle, checked: boolean) => {
    setSelectedMotorcycles(prev =>
      checked ? [...prev, motorcycle] : prev.filter(m => m.id !== motorcycle.id)
    );
  };

  const handleSelectAllInGroup = (groupMotorcycles: Motorcycle[], checked: boolean | 'indeterminate') => {
    const eligibleMotorcycles = groupMotorcycles; // All are eligible now
    if (checked === true) {
      setSelectedMotorcycles(prev => {
        const newSelection = [...prev];
        eligibleMotorcycles.forEach(mc => {
          if (!newSelection.some(smc => smc.id === mc.id)) {
            newSelection.push(mc);
          }
        });
        return newSelection;
      });
    } else {
      const groupMcIds = new Set(groupMotorcycles.map(m => m.id));
      setSelectedMotorcycles(prev => prev.filter(m => !groupMcIds.has(m.id)));
    }
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
   setIsPreviewingCa(true);
 };

 const handleGenerateCashAdvance = async () => {
    setIsGeneratingCa(true);
    toast({
        title: 'AI is working...',
        description: 'Generating cash advance request for selected motorcycles.'
    });

    try {
      if (!user) throw new Error("User not found");
      
      const motorcyclesWithFees = selectedMotorcycles.map(m => ({
          ...m,
          processingFee: 300,
          orFee: 1796.43,
      }));

      const result = await generateCashAdvance({ 
          motorcycles: motorcyclesWithFees,
          liaison: user.name,
          remarks: remarks,
      });

      console.log('Cash advance generated: ', result);
      
      const motorcyclesToUpdate = selectedMotorcycles.map(m => ({ ...m, status: 'For CA Approval' as MotorcycleStatus }));
      
      await addCashAdvance({ ...result, status: 'For CA Approval' });
      if (onStateChange) onStateChange(motorcyclesToUpdate);
      
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
        setRemarks('');
    }
  };
  
  const handleViewDetails = (endorsement: Endorsement) => {
    const associatedMotorcycles = endorsement.motorcycleIds
        .map(mcId => motorcycles.find(m => m.id === mcId))
        .filter(Boolean) as Motorcycle[];
    setViewingEndorsement({ endorsement, motorcycles: associatedMotorcycles });
  }

  const handleViewMotorcycle = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
  };

  const handleSaveMotorcycle = async (updatedData: Partial<Motorcycle>) => {
    if (!editingMotorcycle) return;
    const updatedMC = { ...editingMotorcycle, ...updatedData };
    if (onStateChange) onStateChange(updatedMC);
    setEditingMotorcycle(null);
  };
  
  const toggleOpenEndorsement = (id: string) => {
    setOpenEndorsements(prev => 
        prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenEndorsements(paginatedEndorsements.map(e => e.endorsement.id));
  };

  const collapseAll = () => {
    setOpenEndorsements([]);
  };

  const motorcyclesForPreview = selectedMotorcycles.map(mc => ({
    ...mc,
    processingFee: 300,
    orFee: 1796.43
  }));

  const totalPages = Math.ceil(filteredEndorsements.length / ITEMS_PER_PAGE);
  const paginatedEndorsements = filteredEndorsements
    .map(endorsement => ({
        endorsement,
        motorcycles: motorcycles.filter(m => endorsement.motorcycleIds.includes(m.id))
    }))
    .slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


  return (
    <>
    <div className='flex items-center justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold'>My Endorsements</h3>
          <p className='text-sm text-muted-foreground'>
            Select units from your endorsements to generate a cash advance.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
                <ChevronsRight className="mr-2 h-4 w-4"/> Expand All
            </Button>
             <Button variant="outline" size="sm" onClick={collapseAll}>
                <ChevronsLeft className="mr-2 h-4 w-4"/> Collapse All
            </Button>
            <Button size="sm" className="gap-1" onClick={handleOpenCaPreview} loading={isGeneratingCa} disabled={selectedMotorcycles.length === 0}>
                <DollarSign className="h-4 w-4" />
                <span>Generate CA ({selectedMotorcycles.length})</span>
            </Button>
        </div>
      </div>
      
    <Alert className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 mb-4">
        <AlertCircle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
        <AlertDescription className="text-sm">
            All endorsed motorcycles can be selected for Cash Advance creation, as the automated endorsement is only triggered once all motorcycle details are complete.
        </AlertDescription>
    </Alert>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Endorsement Code</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Endorsement Date</TableHead>
              <TableHead>Endorsed By</TableHead>
              <TableHead>Units</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEndorsements.map(({ endorsement, motorcycles: associatedMotorcycles }) => {
              const eligibleMotorcyclesInGroup = associatedMotorcycles;
              const selectedEligibleInGroupCount = selectedMotorcycles.filter(m => eligibleMotorcyclesInGroup.some(em => em.id === m.id)).length;
              const endorsementBranch = associatedMotorcycles.length > 0 ? associatedMotorcycles[0].assignedBranch : 'N/A';

              const isAllInGroupSelected = eligibleMotorcyclesInGroup.length > 0 && selectedEligibleInGroupCount === eligibleMotorcyclesInGroup.length;
              const isPartiallySelectedInGroup = eligibleMotorcyclesInGroup.length > 0 && selectedEligibleInGroupCount > 0 && !isAllInGroupSelected;


              return (
                <Collapsible asChild key={endorsement.id} open={openEndorsements.includes(endorsement.id)} onOpenChange={() => toggleOpenEndorsement(endorsement.id)}>
                    <>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell 
                          className="font-medium text-primary hover:underline cursor-pointer"
                          onClick={() => handleViewDetails(endorsement)}
                        >
                          {endorsement.id}
                        </TableCell>
                        <TableCell>{endorsementBranch}</TableCell>
                        <TableCell>{format(new Date(endorsement.transactionDate), 'MMMM dd, yyyy')}</TableCell>
                        <TableCell>{endorsement.createdBy}</TableCell>
                        <TableCell>{endorsement.motorcycleIds.length}</TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <tr>
                          <TableCell colSpan={6} className="p-0 bg-muted/20">
                              <div className="p-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]">
                                              <Checkbox
                                                    checked={isPartiallySelectedInGroup ? 'indeterminate' : isAllInGroupSelected}
                                                    onCheckedChange={(checked) => handleSelectAllInGroup(associatedMotorcycles, checked)}
                                                    aria-label="Select all in this group"
                                                    disabled={eligibleMotorcyclesInGroup.length === 0}
                                                />
                                            </TableHead>
                                            <TableHead>SI No.</TableHead>
                                            <TableHead>Customer Name</TableHead>
                                            <TableHead>Account Code</TableHead>
                                            <TableHead>Chassis No.</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {associatedMotorcycles.map(mc => (
                                            <TableRow key={mc.id} data-state={selectedMotorcycles.some(sm => sm.id === mc.id) ? "selected" : undefined}>
                                                <TableCell>
                                                    <Checkbox
                                                      checked={selectedMotorcycles.some(sm => sm.id === mc.id)}
                                                      onCheckedChange={(checked) => handleSelectMotorcycle(mc, !!checked)}
                                                    />
                                                </TableCell>
                                                <TableCell>{mc.salesInvoiceNo}</TableCell>
                                                <TableCell>{mc.customerName}</TableCell>
                                                <TableCell>{mc.accountCode}</TableCell>
                                                <TableCell>{mc.chassisNumber}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{mc.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewMotorcycle(mc)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                              </div>
                          </TableCell>
                        </tr>
                      </CollapsibleContent>
                    </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
        {filteredEndorsements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
              <p>You have no endorsements matching the current filters.</p>
          </div>
        )}
        <CardFooter className="pt-4">
            <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                    Showing {paginatedEndorsements.length} of {filteredEndorsements.length} endorsements.
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

    <Dialog open={isPreviewingCa} onOpenChange={setIsPreviewingCa}>
      <DialogContent className="max-w-4xl">
          <DialogHeader>
              <DialogTitle>Cash Advance Request Preview</DialogTitle>
              <DialogDescription>
                  Review the details below. The total amount will be requested for cash advance.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="mt-4 max-h-[60vh] overflow-y-auto p-2 border rounded-md">
                <CashAdvancePreview motorcycles={motorcyclesForPreview} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea 
                    id="remarks" 
                    placeholder="Add any notes for the cashier..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewingCa(false)}>Cancel</Button>
              <Button onClick={handleGenerateCashAdvance} loading={isGeneratingCa}>Submit Request</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <Dialog open={!!viewingEndorsement} onOpenChange={(open) => !open && setViewingEndorsement(null)}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Endorsement Details</DialogTitle>
                <DialogDescription>
                    Details for endorsement code: <span className="font-bold text-primary">{viewingEndorsement?.endorsement.id}</span>
                </DialogDescription>
            </DialogHeader>
            {viewingEndorsement && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <div>
                            <p className="font-medium text-muted-foreground">Transaction Date</p>
                            <p className="font-semibold">{format(new Date(viewingEndorsement.endorsement.transactionDate), 'MMMM dd, yyyy')}</p>
                        </div>
                         <div>
                            <p className="font-medium text-muted-foreground">Receiving Liaison</p>
                            <p className="font-semibold">{viewingEndorsement.endorsement.liaisonName}</p>
                        </div>
                         <div>
                            <p className="font-medium text-muted-foreground">Total Units</p>
                            <p className="font-semibold">{viewingEndorsement.endorsement.motorcycleIds.length}</p>
                        </div>
                        <div className="lg:col-span-2">
                            <p className="font-medium text-muted-foreground">Remarks</p>
                            <p className="font-semibold">{viewingEndorsement.endorsement.remarks || 'N/A'}</p>
                        </div>
                    </div>
                    <Label className="font-semibold mt-4">Endorsed Units</Label>
                    <ScrollArea className="h-64 border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead>Plate No.</TableHead>
                                    <TableHead>Make & Model</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewingEndorsement.motorcycles.map(mc => (
                                    <TableRow key={mc.id}>
                                        <TableCell className="font-medium">{mc.customerName}</TableCell>
                                        <TableCell>{mc.plateNumber}</TableCell>
                                        <TableCell>{mc.make} {mc.model}</TableCell>
                                        <TableCell><Badge variant="outline">{mc.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setViewingEndorsement(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {editingMotorcycle && (
        <MotorcycleDetailsDialog
            motorcycle={editingMotorcycle}
            isOpen={!!editingMotorcycle}
            onClose={() => setEditingMotorcycle(null)}
            onSave={handleSaveMotorcycle}
        />
    )}
  </>
  );
}

    

    