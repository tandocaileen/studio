
'use client';

import { Motorcycle } from "@/types";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";

type ReceiveLtoDocsProps = {
    motorcycles: Motorcycle[];
    onSave: (updatedMotorcycles: Motorcycle[]) => void;
};

type EditableDetails = {
    salesInvoiceNo?: string;
    accountCode?: string;
    hpgControlNumber?: string;
}

export function ReceiveLtoDocs({ motorcycles, onSave }: ReceiveLtoDocsProps) {
    const [selectedMotorcycles, setSelectedMotorcycles] = useState<Motorcycle[]>([]);
    const [details, setDetails] = useState<{ [key: string]: EditableDetails }>({});
    const { toast } = useToast();

    const handleSelect = (motorcycle: Motorcycle, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedMotorcycles(prev => [...prev, motorcycle]);
        } else {
            setSelectedMotorcycles(prev => prev.filter(m => m.id !== motorcycle.id));
        }
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedMotorcycles(motorcycles);
        } else {
            setSelectedMotorcycles([]);
        }
    };

    const handleInputChange = (id: string, field: keyof EditableDetails, value: string) => {
        setDetails(prev => ({
            ...prev,
            [id]: {
                 ...prev[id],
                 [field]: value
            }
        }));
    };

    const handleSave = (motorcyclesToUpdate: Motorcycle[]) => {
        const updatedMotorcycles = motorcyclesToUpdate.map(mc => {
            const newDetails = details[mc.id];
            if (newDetails) {
                return { ...mc, ...newDetails };
            }
            return mc;
        });

        onSave(updatedMotorcycles);
        toast({
            title: "Documents Received",
            description: `Successfully updated ${motorcyclesToUpdate.length} motorcycle(s).`
        });
        setSelectedMotorcycles([]);
        setDetails({});
    };

    const isAllSelected = motorcycles.length > 0 && selectedMotorcycles.length === motorcycles.length;

    return (
        <>
            <CardHeader>
                <CardTitle>Receive MC Docs & Details from NIVI</CardTitle>
                <CardDescription>
                    Select motorcycles and input their details.
                </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>MT No.</TableHead>
                            <TableHead>MC Name</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Engine No.</TableHead>
                            <TableHead>Chassis No.</TableHead>
                            <TableHead>SI No.</TableHead>
                            <TableHead>Account Code</TableHead>
                            <TableHead>HPG Control Number</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {motorcycles.map(mc => (
                            <TableRow key={mc.id} data-state={selectedMotorcycles.some(smc => smc.id === mc.id) ? 'selected' : ''}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMotorcycles.some(smc => smc.id === mc.id)}
                                        onCheckedChange={(checked) => handleSelect(mc, checked)}
                                    />
                                </TableCell>
                                <TableCell>{mc.id}</TableCell>
                                <TableCell>{mc.make}</TableCell>
                                <TableCell>{mc.model}</TableCell>
                                <TableCell>{mc.engineNumber}</TableCell>
                                <TableCell>{mc.chassisNumber}</TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Enter SI No."
                                        value={details[mc.id]?.salesInvoiceNo || mc.salesInvoiceNo || ''}
                                        onChange={(e) => handleInputChange(mc.id, 'salesInvoiceNo', e.target.value)}
                                        disabled={!selectedMotorcycles.some(smc => smc.id === mc.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Enter Account Code"
                                        value={details[mc.id]?.accountCode || mc.accountCode || ''}
                                        onChange={(e) => handleInputChange(mc.id, 'accountCode', e.target.value)}
                                        disabled={!selectedMotorcycles.some(smc => smc.id === mc.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Enter HPG No."
                                        value={details[mc.id]?.hpgControlNumber || mc.hpgControlNumber || ''}
                                        onChange={(e) => handleInputChange(mc.id, 'hpgControlNumber', e.target.value)}
                                        disabled={!selectedMotorcycles.some(smc => smc.id === mc.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {motorcycles.length === 0 && (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>No motorcycles are pending document reception.</p>
                    </div>
                )}
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-6">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        onClick={() => handleSave(selectedMotorcycles)}
                        disabled={selectedMotorcycles.length === 0}
                    >
                        Receive Selected ({selectedMotorcycles.length})
                    </Button>
                </DialogClose>
            </CardContent>
        </>
    );
}
