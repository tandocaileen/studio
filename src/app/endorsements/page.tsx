
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getEndorsements, getMotorcycles } from '@/lib/data';
import { Endorsement, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { LiaisonEndorsementTable } from '@/components/dashboard/liaison-endorsement-table';

type DateRange = '7d' | '30d' | 'all';
type EnrichedEndorsement = {
    endorsement: Endorsement;
    motorcycles: Motorcycle[];
};

function EndorsementsContent() {
    const [endorsements, setEndorsements] = React.useState<Endorsement[] | null>(null);
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [liaisonFilter, setLiaisonFilter] = React.useState<string>('all');
    const [dateRange, setDateRange] = React.useState<DateRange>('7d');
    const [viewingEndorsement, setViewingEndorsement] = React.useState<EnrichedEndorsement | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        const fetchData = async () => {
            const [endorsementData, motorcycleData] = await Promise.all([
                getEndorsements(),
                getMotorcycles()
            ]);
            setEndorsements(endorsementData);
            setMotorcycles(motorcycleData);
        };
        fetchData();
    }, []);
    
    const handleViewDetails = (endorsement: Endorsement) => {
        if (!motorcycles) return;
        const associatedMotorcycles = endorsement.motorcycleIds
            .map(mcId => motorcycles.find(m => m.id === mcId))
            .filter(Boolean) as Motorcycle[];
        setViewingEndorsement({ endorsement, motorcycles: associatedMotorcycles });
    }

    if (!endorsements || !motorcycles) {
        return <AppLoader />;
    }
    
    const uniqueLiaisons = [...new Set(endorsements.map(e => e.liaisonName))];

    const filteredEndorsements = endorsements.filter(e => {
        const liaisonMatch = liaisonFilter === 'all' || e.liaisonName === liaisonFilter;
        if (!liaisonMatch) return false;

        if (dateRange === 'all') return true;
        const days = dateRange === '7d' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return new Date(e.transactionDate) >= cutoff;
    });


    return (
        <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Endorsements</CardTitle>
                    <CardDescription>
                        Browse and manage all created endorsements.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-4 mb-4">
                    <Select value={liaisonFilter} onValueChange={setLiaisonFilter}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Filter by liaison" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Liaisons</SelectItem>
                            {uniqueLiaisons.map(liaison => (
                                <SelectItem key={liaison} value={liaison}>{liaison}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Endorsement Code</TableHead>
                            <TableHead>Liaison</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Units</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEndorsements.map(e => (
                             <TableRow key={e.id}>
                                <TableCell className="font-medium">{e.id}</TableCell>
                                <TableCell>{e.liaisonName}</TableCell>
                                <TableCell>{format(new Date(e.transactionDate), 'MMMM dd, yyyy')}</TableCell>
                                <TableCell>{e.motorcycleIds.length}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(e)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredEndorsements.length === 0 && (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>No endorsements found for the selected filters.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Dialog open={!!viewingEndorsement} onOpenChange={(open) => !open && setViewingEndorsement(null)}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Endorsement Details</DialogTitle>
                    <DialogDescription>
                        Details for endorsement code: <span className="font-bold text-primary">{viewingEndorsement?.endorsement.id}</span>
                    </DialogDescription>
                </DialogHeader>
                {viewingEndorsement && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="font-medium text-muted-foreground">Transaction Date</p>
                                <p className="font-semibold">{format(new Date(viewingEndorsement.endorsement.transactionDate), 'MMMM dd, yyyy')}</p>
                            </div>
                             <div>
                                <p className="font-medium text-muted-foreground">Receiving Liaison</p>
                                <p className="font-semibold">{viewingEndorsement.endorsement.liaisonName}</p>
                            </div>
                             <div>
                                <p className="font-medium text-muted-foreground">Total Units</p>
                                <p className="font-semibold">{viewingEndorsement.endorsement.motorcycleIds.length}</p>
                            </div>
                            <div className="lg:col-span-2">
                                <p className="font-medium text-muted-foreground">Remarks</p>
                                <p className="font-semibold">{viewingEndorsement.endorsement.remarks || 'N/A'}</p>
                            </div>
                        </div>
                        <Label className="font-semibold mt-4">Endorsed Units</Label>
                        <ScrollArea className="h-64 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Plate No.</TableHead>
                                        <TableHead>Make & Model</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewingEndorsement.motorcycles.map(mc => (
                                        <TableRow key={mc.id}>
                                            <TableCell className="font-medium">{mc.customerName}</TableCell>
                                            <TableCell>{mc.plateNumber}</TableCell>
                                            <TableCell>{mc.make} {mc.model}</TableCell>
                                            <TableCell><Badge variant="outline">{mc.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewingEndorsement(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}

function LiaisonDashboardContent({ searchQuery }: { searchQuery: string }) {
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [endorsements, setEndorsements] = React.useState<Endorsement[] | null>(null);
    
    const { user } = useAuth();

    React.useEffect(() => {
        if (user) {
            Promise.all([
                getMotorcycles(),
                getEndorsements()
            ]).then(([motorcycleData, endorsementData]) => {
                setEndorsements(endorsementData.filter(e => e.liaisonName === user.name));
                setMotorcycles(motorcycleData);
            });
        }
    }, [user]);

    if (!user || !motorcycles || !endorsements) {
        return <AppLoader />;
    }

    const handleStateUpdate = async (updatedOrNewMotorcycles: Motorcycle | Motorcycle[]) => {
        // This is a placeholder for a real state update mechanism
        console.log("State update requested for:", updatedOrNewMotorcycles);
    };

    return (
        <LiaisonEndorsementTable 
            endorsements={endorsements}
            motorcycles={motorcycles}
            onStateChange={handleStateUpdate}
            searchQuery={searchQuery}
        />
    );
}

export default function EndorsementsPage() {
    const { user, loading } = useAuth();
    const [searchQuery, setSearchQuery] = React.useState('');

    if (loading || !user) {
        return <AppLoader />;
    }

    const renderContent = () => {
        if (user.role === 'Liaison') {
            return <LiaisonDashboardContent searchQuery={searchQuery} />;
        }
        return <EndorsementsContent />;
    };

    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Cashier', 'Liaison']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Endorsements" onSearch={setSearchQuery}/>
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       {renderContent()}
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
