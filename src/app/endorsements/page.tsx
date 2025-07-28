
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getLiaisons, getMotorcycles } from '@/lib/data';
import { LiaisonUser, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FilePenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ITEMS_PER_PAGE = 10;

function EndorsementsContent() {
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [liaisons, setLiaisons] = React.useState<LiaisonUser[] | null>(null);
    const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
    const [selectedLiaison, setSelectedLiaison] = React.useState<LiaisonUser | null>(null);
    const [remarks, setRemarks] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        getMotorcycles().then(setMotorcycles);
        getLiaisons().then(setLiaisons);
    }, []);

    const handleSelectMotorcycle = (motorcycle: Motorcycle, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedMotorcycles(prev => [...prev, motorcycle]);
        } else {
            setSelectedMotorcycles(prev => prev.filter(m => m.id !== motorcycle.id));
        }
    };
    
    const handleAttemptCreateEndorsement = () => {
        if (selectedMotorcycles.length === 0) {
            toast({ title: 'No Units Selected', description: 'Please select at least one motorcycle to endorse.', variant: 'destructive' });
            return;
        }
        if (!selectedLiaison) {
            toast({ title: 'No Liaison Selected', description: 'Please select a receiving liaison.', variant: 'destructive' });
            return;
        }
        setIsSummaryOpen(true);
    }

    const handleConfirmEndorsement = () => {
        toast({ title: 'Endorsement Created!', description: `${selectedMotorcycles.length} unit(s) have been endorsed to ${selectedLiaison?.name}.` });
        
        // In a real app, you would update the backend here.
        // For the demo, we'll just clear the state.
        setSelectedMotorcycles([]);
        setSelectedLiaison(null);
        setRemarks('');
        setIsSummaryOpen(false);
        // This is a bit of a hack to reset the select component visually
        const trigger = document.getElementById('receiving-liaison-trigger');
        if (trigger) {
            // @ts-ignore
            trigger.childNodes[0].textContent = 'Select a liaison';
        }
    }

    if (!motorcycles || !liaisons) {
        return <AppLoader />;
    }

    const availableMotorcycles = motorcycles.filter(
        m => (m.status === 'Incomplete' || m.status === 'Ready to Register') &&
        (m.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
         (m.customerName && m.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
         m.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
         m.model.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = Math.ceil(availableMotorcycles.length / ITEMS_PER_PAGE);
    const paginatedMotorcycles = availableMotorcycles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    const endorsementCode = `ENDO-${format(new Date(), 'yyyyMMdd')}-001`;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Panel: Endorsement Form */}
                <Card className="lg:col-span-1 sticky top-20">
                    <CardHeader>
                        <CardTitle>Endorsement Details</CardTitle>
                        <CardDescription>Assign units to a liaison.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="transaction-date">Transaction Date</Label>
                            <Input id="transaction-date" value={format(new Date(), 'MMMM dd, yyyy')} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endorsement-code">Endorsement Code</Label>
                            <Input id="endorsement-code" value={endorsementCode} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="receiving-liaison">Receiving Liaison</Label>
                            <Select 
                                onValueChange={(liaisonId) => {
                                    const liaison = liaisons.find(l => l.id === liaisonId);
                                    setSelectedLiaison(liaison || null);
                                }}
                                value={selectedLiaison?.id || ''}
                            >
                                <SelectTrigger id="receiving-liaison-trigger">
                                    <SelectValue placeholder="Select a liaison" />
                                </SelectTrigger>
                                <SelectContent>
                                    {liaisons.map(liaison => (
                                        <SelectItem key={liaison.id} value={liaison.id}>{liaison.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea 
                                id="remarks" 
                                placeholder="Add any notes for this endorsement..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAttemptCreateEndorsement} className="w-full">
                            <FilePenLine className="mr-2 h-4 w-4" />
                            Create Endorsement
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Motorcycle Selection */}
                <div className="lg:col-span-2 grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Units ({availableMotorcycles.length})</CardTitle>
                            <CardDescription>Select motorcycles to include in the endorsement.</CardDescription>
                            <Input
                                placeholder="Search by Plate, Customer, Make, or Model..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[60vh]">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background">
                                        <TableRow>
                                            <TableHead className="w-[40px]"></TableHead>
                                            <TableHead>Sale ID</TableHead>
                                            <TableHead>SI No.</TableHead>
                                            <TableHead>Account Code</TableHead>
                                            <TableHead>Customer Name</TableHead>
                                            <TableHead>Plate No.</TableHead>
                                            <TableHead>Make & Model</TableHead>
                                            <TableHead>Engine No.</TableHead>
                                            <TableHead>Chassis No.</TableHead>
                                            <TableHead>CSR No.</TableHead>
                                            <TableHead>CR/OR No.</TableHead>
                                            <TableHead>HPG Control No.</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedMotorcycles.map(mc => (
                                            <TableRow 
                                                key={mc.id}
                                                data-state={selectedMotorcycles.some(m => m.id === mc.id) ? "selected" : undefined}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedMotorcycles.some(m => m.id === mc.id)}
                                                        onCheckedChange={(checked) => handleSelectMotorcycle(mc, checked)}
                                                        aria-label={`Select ${mc.customerName}`}
                                                    />
                                                </TableCell>
                                                <TableCell>{mc.id}</TableCell>
                                                <TableCell>{mc.salesInvoiceNo}</TableCell>
                                                <TableCell>{mc.accountCode}</TableCell>
                                                <TableCell className="font-medium">{mc.customerName}</TableCell>
                                                <TableCell>{mc.plateNumber}</TableCell>
                                                <TableCell>
                                                    <div>{mc.make}</div>
                                                    <div className="text-xs text-muted-foreground">{mc.model}</div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{mc.engineNumber}</TableCell>
                                                <TableCell className="font-mono text-xs">{mc.chassisNumber}</TableCell>
                                                <TableCell>{mc.documents.find(d => d.type === 'CSR')?.url.slice(-8) || 'N/A'}</TableCell>
                                                <TableCell>{mc.documents.find(d => d.type === 'OR/CR')?.url.slice(-8) || 'N/A'}</TableCell>
                                                <TableCell>{mc.hpgControlNumber || 'N/A'}</TableCell>
                                                <TableCell><Badge variant={mc.status === 'Incomplete' ? 'outline' : 'default'}>{mc.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                         <CardFooter>
                            <div className="flex items-center justify-between w-full">
                                <div className="text-xs text-muted-foreground">
                                    Showing {paginatedMotorcycles.length} of {availableMotorcycles.length} units.
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Endorsement</DialogTitle>
                        <DialogDescription>
                            Please review the details before confirming the endorsement.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 gap-2">
                           <div className="font-semibold">Endorsement Code:</div>
                           <div className="col-span-2">{endorsementCode}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           <div className="font-semibold">Receiving Liaison:</div>
                           <div className="col-span-2">{selectedLiaison?.name}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           <div className="font-semibold">Total Units:</div>
                           <div className="col-span-2">{selectedMotorcycles.length}</div>
                        </div>
                         <div className="grid grid-cols-3 gap-2">
                           <div className="font-semibold">Remarks:</div>
                           <div className="col-span-2">{remarks || 'N/A'}</div>
                        </div>
                        
                        <Label className="font-semibold mt-4">Units to be Endorsed:</Label>
                        <ScrollArea className="h-48 border rounded-md p-2">
                             <ul className="space-y-2">
                                {selectedMotorcycles.map(mc => (
                                    <li key={mc.id}>
                                        <p className="font-medium">{mc.customerName}</p>
                                        <p className="text-sm text-muted-foreground">{mc.make} {mc.model} ({mc.plateNumber})</p>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSummaryOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmEndorsement}>Confirm Endorsement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}


export default function EndorsementsPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Cashier']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Endorsements" />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <EndorsementsContent />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}

