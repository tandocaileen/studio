
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { LiquidationTable } from "@/components/liquidations/liquidation-table";
import { getCashAdvances, getMotorcycles } from "@/lib/data";
import { CashAdvance, Motorcycle } from "@/types";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";

export type LiquidationItem = {
    cashAdvance: CashAdvance;
    motorcycle?: Motorcycle;
}

function LiquidationsContent({ searchQuery }: { searchQuery: string }) {
    const [items, setItems] = useState<LiquidationItem[] | null>(null);

    useEffect(() => {
        Promise.all([getCashAdvances(), getMotorcycles()]).then(([cashAdvances, motorcycles]) => {
            const liquidationItems: LiquidationItem[] = cashAdvances.map(ca => {
                // Improved logic to find motorcycle by plate number, engine, or chassis from purpose
                const plateNumberMatch = ca.purpose.match(/([A-Z0-9]{3}\s[A-Z0-9]{3,4})/);
                const engineNumberMatch = ca.purpose.match(/Engine No\.?\s*([A-Z0-9]+)/i);
                const chassisNumberMatch = ca.purpose.match(/Chassis No\.?\s*([A-Z0-9]+)/i);
                
                let motorcycle: Motorcycle | undefined;

                if (plateNumberMatch) {
                    motorcycle = motorcycles.find(m => m.plateNumber === plateNumberMatch[0]);
                } else if (engineNumberMatch) {
                    motorcycle = motorcycles.find(m => m.engineNumber === engineNumberMatch[1]);
                } else if (chassisNumberMatch) {
                    motorcycle = motorcycles.find(m => m.chassisNumber === chassisNumberMatch[1]);
                }
                
                return { cashAdvance: ca, motorcycle };
            });
            setItems(liquidationItems);
        });
    }, []);

    if (!items) {
        return <AppLoader />;
    }

    const filteredItems = items.filter(item => {
        const motorcycle = item.motorcycle;
        const cashAdvance = item.cashAdvance;
        const query = searchQuery.toLowerCase();

        if (motorcycle?.engineNumber.toLowerCase().includes(query)) return true;
        if (motorcycle?.chassisNumber.toLowerCase().includes(query)) return true;
        if (motorcycle?.model.toLowerCase().includes(query)) return true;
        if (motorcycle?.plateNumber.toLowerCase().includes(query)) return true;
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;

        return false;
    });


    return <LiquidationTable items={filteredItems} />
}


export default function LiquidationsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ProtectedPage>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Liquidations" onSearch={setSearchQuery} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <LiquidationsContent searchQuery={searchQuery} />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
