
'use client';

import { Motorcycle } from "@/types";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

type ReceiveLtoDocsProps = {
    motorcycles: Motorcycle[];
    onSave: (updatedMotorcycles: Motorcycle[]) => void;
};

type HpgState = {
    [mcId: string]: string;
};

export function ReceiveLtoDocs({ motorcycles, onSave }: ReceiveLtoDocsProps) {
    const [hpgState, setHpgState] = useState<HpgState>({});
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const filteredMotorcycles = useMemo(() => {
        if (!searchQuery) return motorcycles;
        return motorcycles.filter(mc =>
            mc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mc.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mc.engineNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mc.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [motorcycles, searchQuery]);

    const handleHpgChange = (mcId: string, value: string) => {
        setHpgState(prev => ({
            ...prev,
            [mcId]: value
        }));
    };

    const handleClear = () => {
        setHpgState({});
    };

    const handleSave = () => {
        const updatedMotorcycles: Motorcycle[] = [];
        motorcycles.forEach(mc => {
            const hpgControlNumber = hpgState[mc.id];
            // Only update if there is a new HPG number entered
            if (hpgControlNumber) {
                const newDocs = [...mc.documents];
                
                // Add or update the HPG document
                const hpgDocIndex = newDocs.findIndex(d => d.type === 'HPG Control Form');
                if (hpgDocIndex > -1) {
                    newDocs[hpgDocIndex] = { ...newDocs[hpgDocIndex], url: hpgControlNumber };
                } else {
                     newDocs.push({
                        type: 'HPG Control Form',
                        url: hpgControlNumber, // Store the number in the URL field for simplicity
                        uploadedAt: new Date(),
                    });
                }
                
                // The status will be handled by another process, so we just update the HPG number here.
                updatedMotorcycles.push({ ...mc, documents: newDocs, hpgControlNumber });
            }
        });

        if (updatedMotorcycles.length === 0) {
            toast({ title: "No Changes", description: "No HPG Control Numbers were entered.", variant: "destructive" });
            return;
        }

        onSave(updatedMotorcycles);
        toast({ title: "Documents Updated", description: `${updatedMotorcycles.length} motorcycle record(s) have been updated with HPG numbers.` });
        handleClear();
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Master File &gt; MC Docs Receiving From NIVI</CardTitle>
                <div className="flex items-center gap-4 pt-4">
                    <Button variant="outline" onClick={handleClear}>Clear</Button>
                    <Button onClick={handleSave}>Save</Button>
                    <Input
                        placeholder="Search MT No, Plate, Engine, Chassis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm ml-auto"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] mt-4">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead>Sale ID</TableHead>
                                <TableHead>Make & Model</TableHead>
                                <TableHead>Engine No.</TableHead>
                                <TableHead>Chassis No.</TableHead>
                                <TableHead>HPG Control No.</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMotorcycles.map(mc => (
                                <TableRow key={mc.id}>
                                    <TableCell>{mc.id}</TableCell>
                                    <TableCell>{mc.make} {mc.model}</TableCell>
                                    <TableCell>{mc.engineNumber}</TableCell>
                                    <TableCell>{mc.chassisNumber}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={hpgState[mc.id] || mc.hpgControlNumber || ''}
                                            onChange={(e) => handleHpgChange(mc.id, e.target.value)}
                                            placeholder="Enter HPG No."
                                            className="w-48"
                                        />
                                    </TableCell>
                                    <TableCell>N/A</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                {filteredMotorcycles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No incomplete motorcycles found, or no results for your search.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
