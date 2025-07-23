
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { getCashAdvances, getMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { CashAdvance, Motorcycle } from "@/types";
import { useAuth } from "@/context/AuthContext";

export type EnrichedCashAdvance = {
    cashAdvance: CashAdvance;
    motorcycle?: Motorcycle;
}

function CashAdvancesContent({ searchQuery }: { searchQuery: string }) {
    const [advances, setAdvances] = useState<EnrichedCashAdvance[] | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([getCashAdvances(), getMotorcycles()]).then(([cashAdvances, motorcycles]) => {
            const enriched: EnrichedCashAdvance[] = cashAdvances.map(ca => {
                const motorcycle = motorcycles.find(m => m.id === ca.motorcycleId);
                return { cashAdvance: ca, motorcycle };
            });
            setAdvances(enriched);
        });
    }, []);

    if (!advances || !user) {
        return <AppLoader />;
    }

    const filteredCashAdvances = advances.filter(item => {
        const { cashAdvance, motorcycle } = item;
        const query = searchQuery.toLowerCase();

        // Role-based filtering
        if (user.role === 'Liaison' && cashAdvance.personnel !== user.name) {
            return false;
        }

        // Search query filtering
        if (motorcycle) {
            if (motorcycle.customerName?.toLowerCase().includes(query)) return true;
            if (motorcycle.model.toLowerCase().includes(query)) return true;
        }
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;

        return false;
    });

    return <CashAdvanceTable advances={filteredCashAdvances} />;
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
