
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getEndorsements } from '@/lib/data';
import { Endorsement } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DateRange = '7d' | '30d' | 'all';

function EndorsementsContent() {
    const [endorsements, setEndorsements] = React.useState<Endorsement[] | null>(null);
    const [liaisonFilter, setLiaisonFilter] = React.useState<string>('all');
    const [dateRange, setDateRange] = React.useState<DateRange>('7d');
    const router = useRouter();

    React.useEffect(() => {
        getEndorsements().then(setEndorsements);
    }, []);

    if (!endorsements) {
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Endorsements</CardTitle>
                    <CardDescription>
                        Browse and manage all created endorsements.
                    </CardDescription>
                </div>
                 <Button onClick={() => router.push('/endorsements/create')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Endorsement
                </Button>
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
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/endorsements/${e.id}`)}>
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
    )
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
