
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';
import { getCashAdvances, getMotorcycles, updateCashAdvances, updateMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Check, Eye, FileCheck, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


type ReportData = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
}

function VerificationContent() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    
    const [reportData, setReportData] = React.useState<ReportData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isVerifying, setIsVerifying] = React.useState(false);

    const [arNumber, setArNumber] = React.useState('');
    const [arDate, setArDate] = React.useState<Date | undefined>(new Date());
    const [arAmount, setArAmount] = React.useState<number | string>('');

    React.useEffect(() => {
        if (id) {
            Promise.all([getCashAdvances(), getMotorcycles()]).then(([cas, mcs]) => {
                const mainCA = cas.find(ca => ca.id === id);
                if (mainCA) {
                    const associatedMotorcycles = (mainCA.motorcycleIds || [])
                        .map(mcId => mcs.find(m => m.id === mcId))
                        .filter((m): m is Motorcycle => !!m);
                    
                    setReportData({
                        cashAdvance: mainCA,
                        motorcycles: associatedMotorcycles,
                    });
                    
                    if (mainCA.status === 'Verified') {
                        setArNumber(mainCA.arNumber || '');
                        setArDate(mainCA.arDate ? new Date(mainCA.arDate) : undefined);
                        setArAmount(mainCA.arAmount || '');
                    } else {
                        setArAmount(mainCA.amount.toLocaleString());
                    }

                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleVerify = async () => {
        if (!arNumber || !arDate || !arAmount) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all AR (Acknowledgement Receipt) details.',
                variant: 'destructive',
            });
            return;
        }

        setIsVerifying(true);

        const updatedCA: CashAdvance = {
            ...reportData!.cashAdvance,
            status: 'Verified',
            arNumber,
            arDate,
            arAmount: typeof arAmount === 'string' ? parseFloat(arAmount.replace(/,/g, '')) : arAmount,
        };

        const updatedMotorcycles = reportData!.motorcycles.map(mc => ({...mc, status: 'Registered' as const}));

        try {
            await updateCashAdvances(updatedCA);
            await updateMotorcycles(updatedMotorcycles);
            toast({
                title: 'Verification Complete!',
                description: `Cash Advance ${reportData!.cashAdvance.id} has been successfully verified.`,
            });
            router.push('/home');
        } catch (error) {
            toast({
                title: 'Verification Failed',
                description: 'An error occurred while saving the verification details.',
                variant: 'destructive',
            });
            setIsVerifying(false);
        }
    };
    
    if (loading) return <AppLoader />;

    if (!reportData) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Cash Advance with ID "{id}" could not be found.</AlertDescription>
            </Alert>
        );
    }
    
    const { cashAdvance, motorcycles } = reportData;
    
    const totalLiquidation = motorcycles.reduce((sum, mc) => sum + (mc.liquidationDetails?.totalLiquidation || 0), 0);
    const shortageOverage = cashAdvance.amount - totalLiquidation;

    const isVerified = cashAdvance.status === 'Verified';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6 sticky top-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Verification</CardTitle>
                        <CardDescription>Enter Acknowledgment Receipt details to finalize.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ar-number">AR Number</Label>
                            <Input id="ar-number" value={arNumber} onChange={(e) => setArNumber(e.target.value)} disabled={isVerified} placeholder="Enter AR Number"/>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="ar-date">AR Date</Label>
                            <Input id="ar-date" type="date" value={arDate ? format(arDate, 'yyyy-MM-dd') : ''} onChange={(e) => setArDate(new Date(e.target.value))} disabled={isVerified}/>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="ar-amount">AR Amount</Label>
                            <Input id="ar-amount" value={arAmount} onChange={(e) => setArAmount(e.target.value)} disabled={isVerified} placeholder="Enter AR Amount"/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                       {isVerified ? (
                            <div className='w-full text-center p-2 bg-green-100 text-green-800 rounded-md flex items-center justify-center gap-2'>
                                <Check className="h-5 w-5" />
                                <span className='font-semibold'>Transaction Verified</span>
                            </div>
                       ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" disabled={!arNumber || !arDate || !arAmount}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Verify Transaction
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will mark the cash advance as verified and update all associated motorcycles to 'Registered'. This cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleVerify} disabled={isVerifying}>
                                    {isVerifying ? 'Verifying...' : 'Yes, verify transaction'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                       )}
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Cash Advance</span>
                            <span className="font-semibold">₱{cashAdvance.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Liquidation</span>
                            <span className="font-semibold">₱{totalLiquidation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Separator />
                        <div className={cn("flex justify-between font-bold", shortageOverage < 0 ? 'text-destructive' : 'text-green-600')}>
                            <span>{shortageOverage < 0 ? 'Shortage' : 'Overage'}</span>
                            <span>₱{Math.abs(shortageOverage).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Cash Advance Details</CardTitle>
                            <CardDescription>CA #{cashAdvance.id} | {cashAdvance.personnel}</CardDescription>
                        </div>
                         <Button variant="outline" size="sm" onClick={() => router.push(`/reports/liquidation/${id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Report
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[70vh]">
                            <div className="pr-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Make & Model</TableHead>
                                            <TableHead>OR Number</TableHead>
                                            <TableHead className="text-right">Amount Liquidated</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {motorcycles.map(mc => (
                                            <TableRow key={mc.id}>
                                                <TableCell>{mc.customerName}</TableCell>
                                                <TableCell>{mc.make} {mc.model}</TableCell>
                                                <TableCell>{mc.liquidationDetails?.ltoOrNumber || 'N/A'}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ₱{(mc.liquidationDetails?.totalLiquidation || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function VerificationPage() {
    return (
        <ProtectedPage allowedRoles={['Accounting']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Verify Liquidation" showBack={true} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <VerificationContent />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}

    