
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
import { Document as Doc, Motorcycle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { InsuranceControlForm } from './insurance-control-form';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Upload, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DocumentType } from '@/types';
import { format } from 'date-fns';

const documentTypes: DocumentType[] = ['OR/CR', 'COC', 'Insurance', 'CSR', 'HPG Control Form'];

function DocumentManager({ documents, onDocumentsChange, canEdit }: { documents: Doc[], onDocumentsChange: (docs: Doc[]) => void, canEdit: boolean }) {
    const [newDocType, setNewDocType] = React.useState<DocumentType | ''>('');

    const handleAddDocument = () => {
        if (!newDocType) return;
        const newDocument: Doc = {
            type: newDocType as DocumentType,
            url: `/docs/placeholder-${newDocType.toLowerCase().replace(' ', '_')}.pdf`,
            uploadedAt: new Date(),
        };
        onDocumentsChange([...documents, newDocument]);
        setNewDocType('');
    };
    
    return (
        <div>
            <h3 className="font-semibold text-lg border-b pb-2 mt-6 mb-4">Documents</h3>
            <div className="grid gap-4">
                {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                           <FileText className="h-5 w-5 text-muted-foreground" />
                           <div>
                               <p className="font-medium">{doc.type}</p>
                               <p className="text-xs text-muted-foreground">Uploaded: {format(new Date(doc.uploadedAt), 'PPP')}</p>
                           </div>
                        </div>
                         <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>View</Button>
                    </div>
                ))}
                {documents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded.</p>
                )}

                {canEdit && (
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Select value={newDocType} onValueChange={(v) => setNewDocType(v as DocumentType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                {documentTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddDocument} disabled={!newDocType}>
                            <Upload className="mr-2 h-4 w-4" />
                            Add Document
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}


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

  const handleDocumentsChange = (newDocs: Doc[]) => {
      setEditedData(prev => ({...prev, documents: newDocs}));
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
            {isLiaison ? 'Read-only view of motorcycle details.' : 'Update details and documents for this unit.'}
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
                <Label htmlFor="edit-csrNumber">CSR No.</Label>
                <Input id="edit-csrNumber" name="csrNumber" value={editedData.csrNumber || ''} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-crNumber">CR No.</Label>
                <Input id="edit-crNumber" name="crNumber" value={editedData.crNumber || ''} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-hpgControlNumber">HPG Control No.</Label>
                <Input id="edit-hpgControlNumber" name="hpgControlNumber" value={editedData.hpgControlNumber || ''} disabled />
              </div>
            </div>

            <InsuranceControlForm
              editedData={editedData}
              onDataChange={handleDataChange}
              canEdit={canEditInsuranceAndControl}
            />

            <DocumentManager 
                documents={editedData.documents || []} 
                onDocumentsChange={handleDocumentsChange} 
                canEdit={!isLiaison}
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
