
import { getCashAdvances } from '@/lib/data';
import { ProtectedPage } from '@/components/auth/protected-page';
import { Header } from '@/components/layout/header';
import VerificationClientPage from '@/components/verify/VerificationClientPage';

export async function generateStaticParams() {
    const cashAdvances = await getCashAdvances();
    return cashAdvances.map(ca => ({
        id: ca.id,
    }));
}

export default function VerificationPage() {
    return (
        <ProtectedPage allowedRoles={['Accounting']}>
            <div className="flex flex-col sm:gap-4 sm:py-4 w-full">
                <Header title="Verify Liquidation" showBack={true} />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <VerificationClientPage />
                </main>
            </div>
        </ProtectedPage>
    );
}
