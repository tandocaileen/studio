import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { getCashAdvances } from "@/lib/data";

export default async function CashAdvancesPage() {
    const cashAdvances = await getCashAdvances();

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppSidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <Header title="Cash Advances" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <CashAdvanceTable cashAdvances={cashAdvances} />
                </main>
            </div>
        </div>
    );
}
