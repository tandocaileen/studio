
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ProtectedPage } from '@/components/auth/protected-page';
import { getCashAdvances, getMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, DollarSign, Eye, FileText, ShieldCheck, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CashAdvanceRequestDocument } from '@/components/cash-advances/cash-advance-request-document';

type ReportDataType = {
  cashAdvance: CashAdvance;
  motorcycles: Motorcycle[];
};

function CompletedReportContent() {
  const params = useParams();
  const id = params.id as string;
  const [reportData, setReportData] = React.useState<ReportDataType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isCaDialogOpen, setIsCaDialogOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (id) {
      Promise.all([getCashAdvances(), getMotorcycles()]).then(([cas, mcs]) => {
        const mainCA = cas.find(ca => ca.id === id);
        if (mainCA && mainCA.motorcycleIds) {
          const associatedMotorcycles = mainCA.motorcycleIds
            .map(mcId => mcs.find(m => m.id === mcId))
            .filter(Boolean) as Motorcycle[];

          setReportData({
            cashAdvance: mainCA,
            motorcycles: associatedMotorcycles,
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <AppLoader />;
  }

  if (!reportData) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Report Not Found</AlertTitle>
            <AlertDescription>The report with ID "{id}" could not be found.</AlertDescription>
        </Alert>
    );
  }
  
  const { cashAdvance, motorcycles } = reportData;
    
  const totalLiquidation = motorcycles.reduce((sum, mc) => sum + (mc.liquidationDetails?.totalLiquidation || 0), 0);
  const shortageOverage = cashAdvance.amount - totalLiquidation;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle>Completed Report</CardTitle>
                        <CardDescription>Read-only view of verified details for CA #{cashAdvance.id}.</CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <Check className="mr-2 h-4 w-4"/>
                            Verified
                        </Badge>
                        <Button variant="secondary" onClick={() => setIsCaDialogOpen(true)}>
                            <DollarSign className="mr-2 h-4 w-4" /> View Liquidation Report
                        </Button>
                    </div>
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

            {cashAdvance.verifiedBy && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <User className="h-4 w-4" /> Verification Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Verified By:</span>
                            <span className="font-semibold">{cashAdvance.verifiedBy}</span>
                        </div>
                        {cashAdvance.verificationRemarks && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-muted-foreground">Remarks:</span>
                                <p className="font-semibold p-2 bg-muted/50 rounded-md border text-xs">{cashAdvance.verificationRemarks}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    </div>
    
    <Dialog open={isCaDialogOpen} onOpenChange={setIsCaDialogOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Cash Advance Request</DialogTitle>
                <DialogDescription>
                    Original cash advance request for CA #{cashAdvance.id}.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[70vh] overflow-y-auto p-2">
                <CashAdvanceRequestDocument 
                    advance={cashAdvance} 
                    motorcycles={motorcycles} 
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCaDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

export default function LiquidationReportPage() {
  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier', 'Accounting']}>
        <Header title="Completed Transaction Report" showBack={true} />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
            <CompletedReportContent />
        </main>
    </ProtectedPage>
  );
}
