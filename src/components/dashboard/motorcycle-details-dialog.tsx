
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Motorcycle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { InsuranceControlForm } from './insurance-control-form';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

type MotorcycleDetailsDialogProps = {
  motorcycle: Motorcycle;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<Motorcycle>) => void;
};

export function MotorcycleDetailsDialog({ motorcycle, isOpen, onClose, onSave }: MotorcycleDetailsDialogProps) {
  const { user } = useAuth();
  const [editedData, setEditedData] = React.useState<Partial<Motorcycle>>(motorcycle);

  React.useEffect(() => {
    if (isOpen) {
      setEditedData(motorcycle);
    }
  }, [isOpen, motorcycle]);

  const isLiaison = user?.role === 'Liaison';
  const canEditInsuranceAndControl = user?.role === 'Store Supervisor' || user?.role === 'Cashier';
  const canEditMainDetails = !isLiaison;

  const handleDataChange = (fieldName: keyof Motorcycle, value: any) => {
    setEditedData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  if (!motorcycle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isLiaison ? 'View Details' : 'View / Edit Details'} - {motorcycle.customerName}
          </DialogTitle>
          <DialogDescription>
            {isLiaison ? 'Read-only view of motorcycle details.' : 'Update details for this unit.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 py-4 pr-6">
            <h3 className="font-semibold text-lg border-b pb-2 mb-2">Motorcycle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="edit-chassisNumber">Chassis No.</Label>
                <Input id="edit-chassisNumber" value={editedData.chassisNumber || ''} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-engineNumber">Engine No.</Label>
                <Input id="edit-engineNumber" value={editedData.engineNumber || ''} disabled />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="edit-branchCode">Branch</Label>
                <Input id="edit-branchCode" value={editedData.assignedBranch || ''} disabled />
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
                <Input id="edit-csrNumber" name="csrNumber" value={editedData.csrNumber || ''} onChange={(e) => handleDataChange('csrNumber', e.target.value)} className={cn(!editedData.csrNumber && 'border-destructive')} disabled={!canEditMainDetails} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-crNumber">CR No. <span className="text-destructive">*</span></Label>
                <Input id="edit-crNumber" name="crNumber" value={editedData.crNumber || ''} onChange={(e) => handleDataChange('crNumber', e.target.value)} className={cn(!editedData.crNumber && 'border-destructive')} disabled={!canEditMainDetails} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-hpgControlNumber">HPG Control No. <span className="text-destructive">*</span></Label>
                <Input id="edit-hpgControlNumber" name="hpgControlNumber" value={editedData.hpgControlNumber || ''} onChange={(e) => handleDataChange('hpgControlNumber', e.target.value)} className={cn(!editedData.hpgControlNumber && 'border-destructive')} disabled={!canEditMainDetails} />
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
          <Button variant="outline" onClick={onClose}>Close</Button>
          {!isLiaison && <Button onClick={handleSave}>Save Changes</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
