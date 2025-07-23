import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { LiquidationTable } from "@/components/liquidations/liquidation-table";
import { getCashAdvances, getMotorcycles } from "@/lib/data";
import { CashAdvance, Motorcycle } from "@/types";
import React from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";

export type LiquidationItem = {
    cashAdvance: CashAdvance;
    motorcycle?: Motorcycle;
}

async function LiquidationsContent() {
    const cashAdvances = await getCashAdvances();
    const motorcycles = await getMotorcycles();

    // Naive association based on plate number in purpose string
    const liquidationItems: LiquidationItem[] = cashAdvances.map(ca => {
        const plateNumberMatch = ca.purpose.match(/([A-Z0-9]{3}\s[A-Z0-9]{3,4})/);
        let motorcycle: Motorcycle | undefined;
        if (plateNumberMatch) {
            motorcycle = motorcycles.find(m => m.plateNumber === plateNumberMatch[0]);
        }
        return { cashAdvance: ca, motorcycle };
    });

    return <LiquidationTable items={liquidationItems} />
}


export default function LiquidationsPage() {
    return (
        <ProtectedPage>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Liquidations" />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <React.Suspense fallback={<AppLoader />}>
                            <LiquidationsContent />
                       </React.Suspense>
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
