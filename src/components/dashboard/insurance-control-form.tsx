
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Motorcycle } from '@/types';

type InsuranceControlFormProps = {
    editedData: Partial<Motorcycle>;
    onDataChange: (fieldName: keyof Motorcycle, value: any) => void;
    canEdit: boolean;
};

const insuranceTypes = ['TPL', 'Comprehensive', 'TPL + OD', 'TPL + Theft'];

export function InsuranceControlForm({ editedData, onDataChange, canEdit }: InsuranceControlFormProps) {
    return (
        <div>
            <h3 className="font-semibold text-lg border-b pb-2 mt-4 mb-2">Insurance &amp; Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="edit-cocNumber">COC No. <span className="text-destructive">*</span></Label>
                    <Input id="edit-cocNumber" name="cocNumber" value={editedData.cocNumber || ''} onChange={(e) => onDataChange('cocNumber', e.target.value)} disabled={!canEdit} required className={cn(!editedData.cocNumber && 'border-destructive')} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-policyNumber">Policy No. <span className="text-destructive">*</span></Label>
                    <Input id="edit-policyNumber" name="policyNumber" value={editedData.policyNumber || ''} onChange={(e) => onDataChange('policyNumber', e.target.value)} disabled={!canEdit} required className={cn(!editedData.policyNumber && 'border-destructive')} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-insuranceType">Insurance Type <span className="text-destructive">*</span></Label>
                    <Select
                        value={editedData.insuranceType || ''}
                        onValueChange={(value) => onDataChange('insuranceType', value)}
                        disabled={!canEdit}
                    >
                        <SelectTrigger id="edit-insuranceType" className={cn(!editedData.insuranceType && 'border-destructive')}>
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
                    <Label>Effective Date <span className="text-destructive">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !editedData.insuranceEffectiveDate && "text-muted-foreground border-destructive"
                            )}
                            disabled={!canEdit}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editedData.insuranceEffectiveDate ? format(new Date(editedData.insuranceEffectiveDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={editedData.insuranceEffectiveDate ? new Date(editedData.insuranceEffectiveDate) : undefined}
                            onSelect={(date) => onDataChange('insuranceEffectiveDate', date)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label>Expiration Date <span className="text-destructive">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !editedData.insuranceExpirationDate && "text-muted-foreground border-destructive"
                            )}
                            disabled={!canEdit}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editedData.insuranceExpirationDate ? format(new Date(editedData.insuranceExpirationDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={editedData.insuranceExpirationDate ? new Date(editedData.insuranceExpirationDate) : undefined}
                            onSelect={(date) => onDataChange('insuranceExpirationDate', date)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-sarCode">SAR Code <span className="text-destructive">*</span></Label>
                    <Input id="edit-sarCode" name="sarCode" value={editedData.sarCode || ''} onChange={(e) => onDataChange('sarCode', e.target.value)} disabled={!canEdit} required className={cn(!editedData.sarCode && 'border-destructive')} />
                </div>
            </div>
        </div>
    );
}
