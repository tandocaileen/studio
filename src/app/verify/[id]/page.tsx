
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { ProtectedPage } from '@/components/auth/protected-page';
import { getCashAdvances, getMotorcycles, updateCashAdvances, updateMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Check, Download, Eye, FileCheck, FileText, ShieldCheck } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LiquidationReport } from '@/components/reports/liquidation-report';
import { generatePdf } from '@/lib/pdf';


type ReportData = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
}

function VerificationContent() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const id = params.id as string;
    
    const [reportData, setReportData] = React.useState<ReportData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [remarks, setRemarks] = React.useState('');
    const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
    const reportRef = React.useRef<HTMLDivElement>(null);


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
                }
                setLoading(false);
            });
        }
    }, [id]);
    
    const handleDownloadPdf = () => {
        if (reportRef.current && reportData) {
            generatePdf(reportRef.current, `liquidation-report-${reportData.cashAdvance.id}.pdf`);
        }
    };

    const handleVerify = async () => {
        if (!reportData || !user) return;

        setIsVerifying(true);

        const updatedMotorcycles = reportData.motorcycles.map(mc => ({...mc, status: 'Completed' as const}));

        try {
            await updateMotorcycles(updatedMotorcycles);
            
            const updatedCA: Partial<CashAdvance> = {
                id: reportData.cashAdvance.id,
                verifiedBy: user.name,
                verificationRemarks: remarks,
            };
            await updateCashAdvances([updatedCA]);


            toast({
                title: 'Verification Complete!',
                description: `Cash Advance ${reportData.cashAdvance.id} has been successfully verified.`,
            });
            router.push('/home');
        } catch (error) {
            toast({
                title: 'Verification Failed',
                description: 'An error occurred while saving the verification details.',
                variant: 'destructive',
            });
        } finally {
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

    const isVerified = motorcycles.every(mc => mc.status === 'Completed');

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="flex-row items-start justify-between">
                        <div>
                            <CardTitle>Verification Details</CardTitle>
                            <CardDescription>Review all details and documents for CA #{cashAdvance.id}.</CardDescription>
                        </div>
                        {isVerified ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <Check className="mr-2 h-4 w-4"/>
                                Verified
                            </Badge>
                        ) : (
                             <Button variant="outline" size="sm" onClick={() => setIsReportDialogOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Liquidation Report
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {/* CA Details */}
                        <section>
                             <h3 className="font-semibold text-base border-b pb-2 mb-4">Cash Advance Details</h3>
                             <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Liaison Name:</span>
                                    <span className="font-semibold">{cashAdvance.personnel}</span>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">CV Number:</span>
                                    <span className="font-semibold">{cashAdvance.checkVoucherNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">CA Transaction Date:</span>
                                    <span className="font-semibold">{format(new Date(cashAdvance.date), 'MMMM dd, yyyy')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">CV Received Date:</span>
                                    <span className="font-semibold">{cashAdvance.checkVoucherReleaseDate ? format(new Date(cashAdvance.checkVoucherReleaseDate), 'MMMM dd, yyyy') : 'N/A'}</span>
                                </div>
                             </div>
                        </section>

                        {/* Attached Docs */}
                        <section>
                            <h3 className="font-semibold text-base border-b pb-2 mb-4">Attached Documents</h3>
                             <ScrollArea className="h-80 pr-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Make & Model</TableHead>
                                            <TableHead className="text-center">OR</TableHead>
                                            <TableHead className="text-center">CR</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {motorcycles.map(mc => (
                                            <TableRow key={mc.id}>
                                                <TableCell>{mc.customerName}</TableCell>
                                                <TableCell>{mc.make} {mc.model}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="link" size="sm" className="h-auto p-0">View OR</Button>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="link" size="sm" className="h-auto p-0">View CR</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </section>

                    </CardContent>
                    {!isVerified && (
                        <CardFooter className="flex-col items-start gap-4">
                            <div className="w-full grid gap-2">
                                <Label htmlFor="verification-remarks">Verification Remarks (Optional)</Label>
                                <Textarea 
                                    id="verification-remarks" 
                                    placeholder="Add any notes regarding this transaction..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full" loading={isVerifying}>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Verify Transaction
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will mark the cash advance as verified and update all associated motorcycles to 'Completed'. This cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleVerify}>
                                        Yes, verify transaction
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/* Side Column */}
            <div className="lg:col-span-1 flex flex-col gap-6 sticky top-20">
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
        </div>
        
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Liquidation Report</DialogTitle>
                    <DialogDescription>
                        Full liquidation report for Cash Advance #{reportData.cashAdvance.id}.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[70vh] overflow-y-auto p-2">
                    <LiquidationReport ref={reportRef} reportData={reportData} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)}>Close</Button>
                    <Button onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}


export default function VerificationPage() {
    return (
        <ProtectedPage allowedRoles={['Accounting']}>
            <div className="flex flex-col sm:gap-4 sm:py-4 w-full">
                <Header title="Verify Liquidation" showBack={true} />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <VerificationContent />
                </main>
            </div>
        </ProtectedPage>
    );
}
