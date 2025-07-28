
'use client';

import { Motorcycle, DocumentType } from "@/types";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

type ReceiveLtoDocsProps = {
    motorcycles: Motorcycle[];
    onSave: (updatedMotorcycles: Motorcycle[]) => void;
};

type DocState = {
    [mcId: string]: {
        [docType in DocumentType]?: boolean;
    };
};

const DOC_TYPES_TO_RECEIVE: DocumentType[] = ['OR/CR', 'CSR', 'HPG Control Form'];

export function ReceiveLtoDocs({ motorcycles, onSave }: ReceiveLtoDocsProps) {
    const [docState, setDocState] = useState<DocState>({});
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

    const handleSingleCheck = (mcId: string, docType: DocumentType, checked: boolean) => {
        setDocState(prev => ({
            ...prev,
            [mcId]: {
                ...prev[mcId],
                [docType]: checked
            }
        }));
    };

    const handleReceiveAll = (docType: DocumentType, checked: boolean) => {
        const newState = { ...docState };
        filteredMotorcycles.forEach(mc => {
            newState[mc.id] = {
                ...newState[mc.id],
                [docType]: checked
            };
        });
        setDocState(newState);
    };
    
    const handleReceiveAllLtoDocs = (checked: boolean) => {
        const newState = { ...docState };
        filteredMotorcycles.forEach(mc => {
             newState[mc.id] = {
                 ...newState[mc.id],
                 'OR/CR': checked,
                 'CSR': checked,
                 'HPG Control Form': checked,
             };
        });
        setDocState(newState);
    }

    const handleClear = () => {
        setDocState({});
    };

    const handleSave = () => {
        const updatedMotorcycles: Motorcycle[] = [];
        motorcycles.forEach(mc => {
            const mcState = docState[mc.id];
            if (mcState) {
                let updated = false;
                const newDocs = [...mc.documents];
                for (const docType in mcState) {
                    if (mcState[docType as DocumentType] && !mc.documents.some(d => d.type === docType)) {
                        newDocs.push({
                            type: docType as DocumentType,
                            url: `#/${docType.toLowerCase().replace(' ', '-')}/${mc.id}`,
                            uploadedAt: new Date(),
                            expiresAt: docType === 'OR/CR' ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : undefined,
                        });
                        updated = true;
                    }
                }
                if (updated) {
                    const finalStatus = newDocs.some(d => d.type === 'OR/CR') ? 'Ready to Register' : 'Incomplete';
                    updatedMotorcycles.push({ ...mc, documents: newDocs, status: finalStatus });
                }
            }
        });
        
        if (updatedMotorcycles.length === 0) {
            toast({ title: "No Changes", description: "No new documents were selected to be received.", variant: "destructive" });
            return;
        }

        onSave(updatedMotorcycles);
        toast({ title: "Documents Received", description: `${updatedMotorcycles.length} motorcycle record(s) have been updated.` });
        handleClear();
    };
    
    const allChecked = (docType: DocumentType) => {
        return filteredMotorcycles.length > 0 && filteredMotorcycles.every(mc => docState[mc.id]?.[docType]);
    }

    const allLtoDocsChecked = () => {
        return filteredMotorcycles.length > 0 && filteredMotorcycles.every(mc => {
            const mcState = docState[mc.id];
            return mcState?.['OR/CR'] && mcState?.['CSR'] && mcState?.['HPG Control Form'];
        });
    }

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Master File &gt; LTO Docs Receiving From NIVI</CardTitle>
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
                <CardDescription className="p-2 flex items-center gap-4 font-medium">
                    <div>
                        <Checkbox 
                            id="receive-all-lto"
                            onCheckedChange={(checked) => handleReceiveAllLtoDocs(!!checked)}
                            checked={allLtoDocsChecked()}
                        />
                        <label htmlFor="receive-all-lto" className="ml-2">Receive All LTO Docs</label>
                    </div>
                    <div>
                         <Checkbox 
                            id="receive-all-orcr"
                            onCheckedChange={(checked) => handleReceiveAll('OR/CR', !!checked)}
                            checked={allChecked('OR/CR')}
                        />
                        <label htmlFor="receive-all-orcr" className="ml-2">Receive All OR/CR</label>
                    </div>
                     <div>
                         <Checkbox 
                            id="receive-all-csr"
                            onCheckedChange={(checked) => handleReceiveAll('CSR', !!checked)}
                             checked={allChecked('CSR')}
                        />
                        <label htmlFor="receive-all-csr" className="ml-2">Receive All CSR</label>
                    </div>
                     <div>
                         <Checkbox 
                            id="receive-all-hpg"
                            onCheckedChange={(checked) => handleReceiveAll('HPG Control Form', !!checked)}
                             checked={allChecked('HPG Control Form')}
                        />
                        <label htmlFor="receive-all-hpg" className="ml-2">Receive All HPG Control No</label>
                    </div>
                </CardDescription>
                <ScrollArea className="h-[60vh] mt-4">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead>Sale ID</TableHead>
                                <TableHead>Make & Model</TableHead>
                                <TableHead>Engine No.</TableHead>
                                <TableHead>Chassis No.</TableHead>
                                {DOC_TYPES_TO_RECEIVE.map(docType => (
                                    <TableHead key={docType} className="text-center">{docType}</TableHead>
                                ))}
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
                                    {DOC_TYPES_TO_RECEIVE.map(docType => (
                                        <TableCell key={docType} className="text-center">
                                            <Checkbox
                                                checked={!!docState[mc.id]?.[docType]}
                                                onCheckedChange={(checked) => handleSingleCheck(mc.id, docType, !!checked)}
                                                disabled={mc.documents.some(d => d.type === docType)}
                                                aria-label={`Receive ${docType} for ${mc.id}`}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell>{mc.status}</TableCell>
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
