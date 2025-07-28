
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { ProtectedPage } from '@/components/auth/protected-page';
import { getCashAdvances, getMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { Card, CardContent } from '@/components/ui/card';
import { LiquidationReport } from '@/components/reports/liquidation-report';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePdf } from '@/lib/pdf';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type ReportDataType = {
  cashAdvance: CashAdvance;
  motorcycles: (Motorcycle & { liquidation: Partial<CashAdvance> })[];
};

function LiquidationReportContent() {
  const params = useParams();
  const id = params.id as string;
  const [reportData, setReportData] = React.useState<ReportDataType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reportRef = React.useRef(null);

  React.useEffect(() => {
    if (id) {
      Promise.all([getCashAdvances(), getMotorcycles()]).then(([cas, mcs]) => {
        const mainCA = cas.find(ca => ca.id === id);
        if (mainCA) {
          // This is a simplified logic. In a real app, you'd fetch the specific motorcycles associated with this CA.
          // For demo, we find related CAs that make up this main one
           const relatedMotorcycleCAs = cas.filter(ca => (ca.motorcycleId && mainCA.motorcycleIds?.includes(ca.motorcycleId)) || ca.id === id);

            const motorcyclesWithLiquidation = relatedMotorcycleCAs.map(ca => {
                const motorcycle = mcs.find(mc => mc.id === ca.motorcycleId);
                return {
                    ...motorcycle,
                    liquidation: ca,
                } as (Motorcycle & { liquidation: Partial<CashAdvance> });
            }).filter(item => item.id); // Filter out items where motorcycle wasn't found

          setReportData({
            cashAdvance: mainCA,
            motorcycles: motorcyclesWithLiquidation,
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleDownload = async () => {
    if (!reportRef.current) {
        toast({ title: 'Error', description: 'Cannot download PDF. No document to download.', variant: 'destructive' });
        return;
    };
    await generatePdf(reportRef.current, `liquidation_report_${id}.pdf`);
    toast({ title: 'Download Started', description: `Downloading PDF for Liquidation Report #${id}`});
  }

  if (loading) {
    return <AppLoader />;
  }

  if (!reportData) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Report Not Found</AlertTitle>
            <AlertDescription>The liquidation report with ID "{id}" could not be found.</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <Card className="p-4">
        <CardContent className="p-0">
          <LiquidationReport ref={reportRef} reportData={reportData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LiquidationReportPage() {
  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
          <Header title="Liquidation Report" />
          <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <LiquidationReportContent />
          </main>
        </div>
      </div>
    </ProtectedPage>
  );
}
