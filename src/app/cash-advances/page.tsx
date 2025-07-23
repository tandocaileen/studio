
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { getCashAdvances } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { CashAdvance } from "@/types";

function CashAdvancesContent({ searchQuery }: { searchQuery: string }) {
    const [cashAdvances, setCashAdvances] = useState<CashAdvance[] | null>(null);

    useEffect(() => {
        getCashAdvances().then(setCashAdvances);
    }, []);

    if (!cashAdvances) {
        return <AppLoader />;
    }

    const filteredCashAdvances = cashAdvances.filter(ca =>
        ca.personnel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ca.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return <CashAdvanceTable cashAdvances={filteredCashAdvances} />;
}

export default function CashAdvancesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ProtectedPage allowedRoles={['Liaison', 'Cashier']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Cash Advances" onSearch={setSearchQuery} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <CashAdvancesContent searchQuery={searchQuery} />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
