
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
import { ChevronDown, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { generateCashAdvance } from '@/ai/flows/cash-advance-flow';
import { useAuth } from '@/context/AuthContext';
import { CashAdvancePreview } from './cash-advance-preview';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

type LiaisonEndorsementTableProps = {
  endorsements: Endorsement[];
  motorcycles: Motorcycle[];
  onStateChange?: (updatedMotorcycles: Motorcycle | Motorcycle[]) => void;
};

export function LiaisonEndorsementTable({
  endorsements,
  motorcycles,
  onStateChange
}: LiaisonEndorsementTableProps) {
  const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
  const [isPreviewingCa, setIsPreviewingCa] = React.useState(false);
  const [isGeneratingCa, setIsGeneratingCa] = React.useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const handleSelectMotorcycle = (motorcycle: Motorcycle, checked: boolean) => {
    setSelectedMotorcycles(prev =>
      checked ? [...prev, motorcycle] : prev.filter(m => m.id !== motorcycle.id)
    );
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
    }
  };


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Endorsements</CardTitle>
          <CardDescription>
            Select units from your endorsements to generate a cash advance.
          </CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={handleOpenCaPreview} loading={isGeneratingCa} disabled={selectedMotorcycles.length === 0}>
            <DollarSign className="h-4 w-4" />
            <span>Generate CA ({selectedMotorcycles.length})</span>
        </Button>
      </CardHeader>
      <CardContent>
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
            {endorsements.map(endorsement => {
              const associatedMotorcycles = motorcycles.filter(m => endorsement.motorcycleIds.includes(m.id));
              return (
                <Collapsible asChild key={endorsement.id}>
                  <>
                  <TableRow className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell 
                      className="font-medium text-primary hover:underline"
                      onClick={() => router.push(`/endorsements/${endorsement.id}`)}
                    >
                      {endorsement.id}
                    </TableCell>
                    <TableCell>{format(endorsement.transactionDate, 'MMMM dd, yyyy')}</TableCell>
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
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Plate No.</TableHead>
                                        <TableHead>Make & Model</TableHead>
                                        <TableHead>Status</TableHead>
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
                                            <TableCell>{mc.customerName}</TableCell>
                                            <TableCell>{mc.plateNumber}</TableCell>
                                            <TableCell>{mc.make} {mc.model}</TableCell>
                                            <TableCell>
                                                <Badge variant={mc.status === 'Endorsed - Ready' ? 'default' : 'outline'}>
                                                    {mc.status}
                                                </Badge>
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
        {endorsements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
              <p>You have no endorsements.</p>
          </div>
        )}
      </CardContent>
    </Card>

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
