
'use client';

import { Motorcycle } from "@/types";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type ReceiveLtoDocsProps = {
    motorcycles: Motorcycle[];
    onSave: (updatedMotorcycles: Motorcycle[]) => void;
};

export function ReceiveLtoDocs({ motorcycles, onSave }: ReceiveLtoDocsProps) {
    const [selectedMotorcycles, setSelectedMotorcycles] = useState<Motorcycle[]>([]);
    const [hpgControlNumbers, setHpgControlNumbers] = useState<{ [key: string]: string }>({});
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

    const handleHpgInputChange = (id: string, value: string) => {
        setHpgControlNumbers(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = (motorcyclesToUpdate: Motorcycle[]) => {
        const updatedMotorcycles = motorcyclesToUpdate.map(mc => {
            const hpgNumber = hpgControlNumbers[mc.id];
            if (hpgNumber) {
                const hpgDoc = {
                    type: 'HPG Control Form' as const,
                    url: hpgNumber,
                    uploadedAt: new Date()
                };
                
                // Check if HPG doc already exists and update it, otherwise add it.
                const docIndex = mc.documents.findIndex(d => d.type === 'HPG Control Form');
                const newDocuments = [...mc.documents];
                if (docIndex > -1) {
                    newDocuments[docIndex] = hpgDoc;
                } else {
                    newDocuments.push(hpgDoc);
                }
                
                return { ...mc, hpgControlNumber: hpgNumber, documents: newDocuments };
            }
            return mc;
        });

        onSave(updatedMotorcycles);
        toast({
            title: "Documents Received",
            description: `Successfully updated ${motorcyclesToUpdate.length} motorcycle(s).`
        });
        setSelectedMotorcycles([]);
        setHpgControlNumbers({});
    };

    const isAllSelected = motorcycles.length > 0 && selectedMotorcycles.length === motorcycles.length;

    return (
        <>
            <CardHeader>
                <CardTitle>Receive MC Docs from Main Office</CardTitle>
                <CardDescription>
                    Select motorcycles and input their HPG Control Number.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Plate No.</TableHead>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Make & Model</TableHead>
                            <TableHead>HPG Control Number</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {motorcycles.map(mc => (
                            <TableRow key={mc.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMotorcycles.some(smc => smc.id === mc.id)}
                                        onCheckedChange={(checked) => handleSelect(mc, checked)}
                                    />
                                </TableCell>
                                <TableCell>{mc.plateNumber}</TableCell>
                                <TableCell>{mc.customerName}</TableCell>
                                <TableCell>{mc.make} {mc.model}</TableCell>
                                <TableCell>
                                    <Input 
                                        placeholder="Enter HPG No."
                                        value={hpgControlNumbers[mc.id] || ''}
                                        onChange={(e) => handleHpgInputChange(mc.id, e.target.value)}
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
            <CardContent className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleSave(motorcycles)}>Receive All</Button>
                <Button 
                    onClick={() => handleSave(selectedMotorcycles)}
                    disabled={selectedMotorcycles.length === 0}
                >
                    Receive Selected ({selectedMotorcycles.length})
                </Button>
            </CardContent>
        </>
    );
}

    