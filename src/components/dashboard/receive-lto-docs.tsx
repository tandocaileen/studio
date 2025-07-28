
'use client';

import { Motorcycle } from "@/types";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { DialogFooter, DialogClose } from "../ui/dialog";

type ReceiveLtoDocsProps = {
    onSave: (newMotorcycle: Motorcycle) => void;
};

export function ReceiveLtoDocs({ onSave }: ReceiveLtoDocsProps) {
    const [formData, setFormData] = useState<Partial<Motorcycle>>({
        status: 'Incomplete'
    });
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleReceive = () => {
        // Basic validation
        if (!formData.id || !formData.customerName || !formData.plateNumber) {
            toast({
                title: "Missing Information",
                description: "Please fill out at least Sale ID, Customer Name, and Plate Number.",
                variant: "destructive"
            });
            return;
        }

        const newMotorcycle: Motorcycle = {
            id: formData.id,
            make: formData.make || '',
            model: formData.model || '',
            year: formData.year || new Date().getFullYear(),
            color: formData.color || '',
            plateNumber: formData.plateNumber,
            engineNumber: formData.engineNumber || '',
            chassisNumber: formData.chassisNumber || '',
            assignedBranch: 'Main Office', // Default value
            purchaseDate: new Date(), // Default value
            supplier: formData.supplier || '',
            documents: formData.hpgControlNumber ? [{
                type: 'HPG Control Form',
                url: formData.hpgControlNumber,
                uploadedAt: new Date(),
            }] : [],
            status: 'Incomplete',
            customerName: formData.customerName,
            salesInvoiceNo: formData.salesInvoiceNo,
            accountCode: formData.accountCode,
            hpgControlNumber: formData.hpgControlNumber,
        };

        onSave(newMotorcycle);
        toast({
            title: "Motorcycle Received",
            description: `Successfully added motorcycle with plate no. ${newMotorcycle.plateNumber}.`,
        });
        
        // Reset form
        setFormData({ status: 'Incomplete' });
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Receive New Motorcycle</CardTitle>
                <CardDescription>
                    Enter the details for a new motorcycle to add it to the system.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="id">Sale ID</Label>
                    <Input id="id" value={formData.id || ''} onChange={handleInputChange} placeholder="e.g., MT-001" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="salesInvoiceNo">SI No.</Label>
                    <Input id="salesInvoiceNo" value={formData.salesInvoiceNo || ''} onChange={handleInputChange} placeholder="e.g., SI-12345" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="accountCode">Account Code</Label>
                    <Input id="accountCode" value={formData.accountCode || ''} onChange={handleInputChange} placeholder="e.g., AC-CUST-01" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" value={formData.customerName || ''} onChange={handleInputChange} placeholder="Juan Dela Cruz" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="plateNumber">Plate No.</Label>
                    <Input id="plateNumber" value={formData.plateNumber || ''} onChange={handleInputChange} placeholder="ABC 1234" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" value={formData.make || ''} onChange={handleInputChange} placeholder="Honda" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" value={formData.model || ''} onChange={handleInputChange} placeholder="Click 125i" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="engineNumber">Engine No.</Label>
                    <Input id="engineNumber" value={formData.engineNumber || ''} onChange={handleInputChange} placeholder="Engine Number" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="chassisNumber">Chassis No.</Label>
                    <Input id="chassisNumber" value={formData.chassisNumber || ''} onChange={handleInputChange} placeholder="Chassis Number" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="hpgControlNumber">HPG Control No.</Label>
                    <Input id="hpgControlNumber" value={formData.hpgControlNumber || ''} onChange={handleInputChange} placeholder="Enter HPG No." />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Input id="status" value={formData.status || 'Incomplete'} disabled />
                </div>
            </CardContent>
            <DialogFooter className="px-6 pb-6">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleReceive}>Receive</Button>
            </DialogFooter>
        </>
    );
}