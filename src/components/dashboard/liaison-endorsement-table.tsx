
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Motorcycle, Endorsement, MotorcycleStatus } from '@/types';
import { ChevronDown, DollarSign, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { generateCashAdvance } from '@/ai/flows/cash-advance-flow';
import { useAuth } from '@/context/AuthContext';
import { CashAdvancePreview } from './cash-advance-preview';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { MotorcycleDetailsDialog } from './motorcycle-details-dialog';
import { Textarea } from '../ui/textarea';

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
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSelectMotorcycle = (motorcycle: Motorcycle, checked: boolean) => {
    setSelectedMotorcycles(prev =>
      checked ? [...prev, motorcycle] : prev.filter(m => m.id !== motorcycle.id)
    );
  };

  const handleSelectAllInGroup = (groupMotorcycles: Motorcycle[], checked: boolean | 'indeterminate') => {
    const eligibleMotorcycles = groupMotorcycles.filter(m => m.status === 'Endorsed - Ready');
    if (checked === true) {
      // Add all eligible motorcycles from this group to selection, avoiding duplicates
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
      // Remove all motorcycles from this group from selection
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

   if (selectedMotorcycles.some(m => m.status !== 'Endorsed - Ready')) {
       toast({
           title: 'Cannot Generate Cash Advance',
           description: 'Please only select motorcycles with an "Endorsed - Ready" status.',
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
          remarks: remarks,
      });

      console.log('Cash advance generated: ', result);
      
      const updatedMotorcycles = motorcycles.map(m => 
          selectedMotorcycles.some(sm => sm.id === m.id) ? { ...m, status: 'Processing' as MotorcycleStatus } : m
      );
      
      if (onStateChange) onStateChange(updatedMotorcycles.filter(m => selectedMotorcycles.some(sm => sm.id === m.id)));
      
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

  const filteredEndorsements = endorsements.filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (e.id.toLowerCase().includes(query)) return true;
    if (e.createdBy.toLowerCase().includes(query)) return true;
    
    const associatedMotorcycles = motorcycles.filter(m => e.motorcycleIds.includes(m.id));
    if (associatedMotorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
    if (associatedMotorcycles.some(m => m.plateNumber?.toLowerCase().includes(query))) return true;
    
    return false;
  });


  return (
    <>
    <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold'>My Endorsements</h3>
          <p className='text-sm text-muted-foreground'>
            Select units from your endorsements to generate a cash advance.
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={handleOpenCaPreview} loading={isGeneratingCa} disabled={selectedMotorcycles.length === 0}>
            <DollarSign className="h-4 w-4" />
            <span>Generate CA ({selectedMotorcycles.length})</span>
        </Button>
      </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Endorsement Code</TableHead>
              <TableHead>Endorsement Date</TableHead>
              <TableHead>Endorsed By</TableHead>
              <TableHead>Units</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEndorsements.map(endorsement => {
              const associatedMotorcycles = motorcycles.filter(m => endorsement.motorcycleIds.includes(m.id));
              const eligibleMotorcyclesInGroup = associatedMotorcycles.filter(m => m.status === 'Endorsed - Ready');
              const selectedEligibleInGroupCount = selectedMotorcycles.filter(m => eligibleMotorcyclesInGroup.some(em => em.id === m.id)).length;

              const isAllInGroupSelected = eligibleMotorcyclesInGroup.length > 0 && selectedEligibleInGroupCount === eligibleMotorcyclesInGroup.length;
              const isPartiallySelectedInGroup = eligibleMotorcyclesInGroup.length > 0 && selectedEligibleInGroupCount > 0 && !isAllInGroupSelected;


              return (
                <Collapsible asChild key={endorsement.id}>
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
                    <TableCell>{format(new Date(endorsement.transactionDate), 'MMMM dd, yyyy')}</TableCell>
                    <TableCell>{endorsement.createdBy}</TableCell>
                    <TableCell>{endorsement.motorcycleIds.length}</TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <tr className="bg-muted/20">
                      <TableCell colSpan={5} className="p-0">
                          <div className="p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                           <Checkbox
                                                checked={isAllInGroupSelected || isPartiallySelectedInGroup}
                                                onCheckedChange={(checked) => handleSelectAllInGroup(associatedMotorcycles, checked)}
                                                aria-label="Select all in this group"
                                                disabled={eligibleMotorcyclesInGroup.length === 0}
                                                data-state={isPartiallySelectedInGroup ? "indeterminate" : isAllInGroupSelected ? "checked" : "unchecked"}
                                            />
                                        </TableHead>
                                        <TableHead>SI No.</TableHead>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Account Code</TableHead>
                                        <TableHead>Chassis No.</TableHead>
                                        <TableHead>CSR No.</TableHead>
                                        <TableHead>CR No.</TableHead>
                                        <TableHead>HPG Control</TableHead>
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
                                                  disabled={mc.status !== 'Endorsed - Ready'}
                                                />
                                            </TableCell>
                                            <TableCell>{mc.salesInvoiceNo}</TableCell>
                                            <TableCell>{mc.customerName}</TableCell>
                                            <TableCell>{mc.assignedBranch}</TableCell>
                                            <TableCell>{mc.accountCode}</TableCell>
                                            <TableCell>{mc.chassisNumber}</TableCell>
                                            <TableCell>{mc.csrNumber || 'N/A'}</TableCell>
                                            <TableCell>{mc.crNumber || 'N/A'}</TableCell>
                                            <TableCell>{mc.hpgControlNumber || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={mc.status === 'Endorsed - Incomplete' ? 'destructive' : mc.status === 'Endorsed - Ready' ? 'default' : 'outline'}>
                                                    {mc.status}
                                                </Badge>
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

    {/* CA Preview Dialog */}
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
                <CashAdvancePreview motorcycles={selectedMotorcycles} />
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
            onSave={() => {}}
        />
    )}
  </>
  );
}
