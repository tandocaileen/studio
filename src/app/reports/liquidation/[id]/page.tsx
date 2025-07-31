import { Header } from '@/components/layout/header';
import { ProtectedPage } from '@/components/auth/protected-page';
import { getCashAdvances } from '@/lib/data';
import LiquidationReportClient from '@/components/reports/LiquidationReportClient';

export async function generateStaticParams() {
    const cashAdvances = await getCashAdvances();
    return cashAdvances.map(ca => ({
        id: ca.id,
    }));
}

export default function LiquidationReportPage() {
  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier', 'Accounting']}>
        <Header title="Completed Transaction Report" showBack={true} />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
            <LiquidationReportClient />
        </main>
    </ProtectedPage>
  );
}
