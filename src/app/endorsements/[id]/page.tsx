
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';
import { getEndorsements, getMotorcycles } from '@/lib/data';
import { Endorsement, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type EnrichedEndorsement = {
    endorsement: Endorsement;
    motorcycles: Motorcycle[];
};

function EndorsementDetailsContent() {
    const params = useParams();
    const id = params.id as string;
    const [data, setData] = React.useState<EnrichedEndorsement | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (id) {
            Promise.all([getEndorsements(), getMotorcycles()]).then(([endorsements, motorcycles]) => {
                const endorsement = endorsements.find(e => e.id === id);
                if (endorsement) {
                    const associatedMotorcycles = endorsement.motorcycleIds
                        .map(mcId => motorcycles.find(m => m.id === mcId))
                        .filter(Boolean) as Motorcycle[];
                    setData({ endorsement, motorcycles: associatedMotorcycles });
                }
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return <AppLoader />;
    }

    if (!data) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Endorsement Not Found</AlertTitle>
                <AlertDescription>The endorsement with ID "{id}" could not be found.</AlertDescription>
            </Alert>
        );
    }

    const { endorsement, motorcycles } = data;

    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Endorsement Details</CardTitle>
                    <CardDescription>
                        Details for endorsement code: <span className="font-bold text-primary">{endorsement.id}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <div>
                            <p className="font-medium text-muted-foreground">Endorsement Code</p>
                            <p className="font-semibold">{endorsement.id}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Transaction Date</p>
                            <p className="font-semibold">{format(new Date(endorsement.transactionDate), 'MMMM dd, yyyy')}</p>
                        </div>
                         <div>
                            <p className="font-medium text-muted-foreground">Receiving Liaison</p>
                            <p className="font-semibold">{endorsement.liaisonName}</p>
                        </div>
                         <div>
                            <p className="font-medium text-muted-foreground">Total Units</p>
                            <p className="font-semibold">{endorsement.motorcycleIds.length}</p>
                        </div>
                        <div className="lg:col-span-2">
                            <p className="font-medium text-muted-foreground">Remarks</p>
                            <p className="font-semibold">{endorsement.remarks || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Endorsed Units</CardTitle>
                    <CardDescription>List of all motorcycles included in this endorsement.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <ScrollArea className="h-[50vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead>Plate No.</TableHead>
                                    <TableHead>Make & Model</TableHead>
                                    <TableHead>Engine No.</TableHead>
                                    <TableHead>Chassis No.</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {motorcycles.map(mc => (
                                    <TableRow key={mc.id}>
                                        <TableCell className="font-medium">{mc.customerName}</TableCell>
                                        <TableCell>{mc.plateNumber}</TableCell>
                                        <TableCell>{mc.make} {mc.model}</TableCell>
                                        <TableCell>{mc.engineNumber}</TableCell>
                                        <TableCell>{mc.chassisNumber}</TableCell>
                                        <TableCell><Badge variant="outline">{mc.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EndorsementDetailsPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Cashier']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Endorsement Details" showBack={true} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <EndorsementDetailsContent />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
