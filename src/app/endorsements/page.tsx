
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { X, FilePenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function EndorsementsContent() {
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [liaisons, setLiaisons] = React.useState<LiaisonUser[] | null>(null);
    const [selectedMotorcycles, setSelectedMotorcycles] = React.useState<Motorcycle[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const { toast } = useToast();

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
    
    const handleRemoveFromEndorsement = (motorcycleId: string) => {
        setSelectedMotorcycles(prev => prev.filter(m => m.id !== motorcycleId));
    };
    
    const handleCreateEndorsement = () => {
        if (selectedMotorcycles.length === 0) {
            toast({ title: 'No units selected', description: 'Please select at least one motorcycle to endorse.', variant: 'destructive' });
            return;
        }
        toast({ title: 'Endorsement Created!', description: `${selectedMotorcycles.length} unit(s) have been endorsed successfully.` });
        
        // In a real app, you would update the backend here.
        // For the demo, we'll just clear the selection.
        setSelectedMotorcycles([]);
    }

    if (!motorcycles || !liaisons) {
        return <AppLoader />;
    }

    const availableMotorcycles = motorcycles.filter(
        m => (m.status === 'Incomplete' || m.status === 'Ready to Register') &&
        (m.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || m.customerName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    const endorsementCode = `ENDO-${format(new Date(), 'yyyyMMdd')}-001`;

    return (
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
                        <Select>
                            <SelectTrigger id="receiving-liaison">
                                <SelectValue placeholder="Select a liaison" />
                            </SelectTrigger>
                            <SelectContent>
                                {liaisons.map(liaison => (
                                    <SelectItem key={liaison.id} value={liaison.name}>{liaison.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea id="remarks" placeholder="Add any notes for this endorsement..." />
                    </div>
                    <Button onClick={handleCreateEndorsement} className="w-full">
                        <FilePenLine className="mr-2 h-4 w-4" />
                        Create Endorsement
                    </Button>
                </CardContent>
            </Card>

            {/* Right Panel: Motorcycle Selection */}
            <div className="lg:col-span-2 grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Units</CardTitle>
                        <CardDescription>Select motorcycles to include in the endorsement.</CardDescription>
                         <Input
                            placeholder="Search by Plate No. or Customer Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Plate No.</TableHead>
                                        <TableHead>Engine / Chassis No.</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availableMotorcycles.map(mc => (
                                        <TableRow key={mc.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedMotorcycles.some(m => m.id === mc.id)}
                                                    onCheckedChange={(checked) => handleSelectMotorcycle(mc, checked)}
                                                    aria-label={`Select ${mc.customerName}`}
                                                />
                                            </TableCell>
                                            <TableCell>{mc.customerName}</TableCell>
                                            <TableCell>{mc.plateNumber}</TableCell>
                                            <TableCell>
                                                <div className="font-mono text-xs">{mc.engineNumber}</div>
                                                <div className="font-mono text-xs text-muted-foreground">{mc.chassisNumber}</div>
                                            </TableCell>
                                            <TableCell><Badge variant={mc.status === 'Incomplete' ? 'outline' : 'default'}>{mc.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Endorsed Units ({selectedMotorcycles.length})</CardTitle>
                         <CardDescription>These units will be assigned to the selected liaison.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            {selectedMotorcycles.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedMotorcycles.map(mc => (
                                        <li key={mc.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{mc.customerName}</p>
                                                <p className="text-sm text-muted-foreground">{mc.make} {mc.model} ({mc.plateNumber})</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromEndorsement(mc.id)}>
                                                <X className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Select units from the table above.
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function EndorsementsPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor']}>
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

