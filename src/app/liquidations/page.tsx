
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { LiquidationTable } from "@/components/liquidations/liquidation-table";
import { getCashAdvances, getMotorcycles } from "@/lib/data";
import { CashAdvance, Motorcycle } from "@/types";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type LiquidationItem = {
    cashAdvance: CashAdvance;
    motorcycle?: Motorcycle;
}

type LiquidationStatusFilter = 'all' | 'unliquidated' | 'liquidated';


function LiquidationsContent({ searchQuery }: { searchQuery: string }) {
    const [items, setItems] = useState<LiquidationItem[] | null>(null);
    const [statusFilter, setStatusFilter] = useState<LiquidationStatusFilter>('unliquidated');


    useEffect(() => {
        Promise.all([getCashAdvances(), getMotorcycles()]).then(([cashAdvances, motorcycles]) => {
            const liquidationItems: LiquidationItem[] = cashAdvances.map(ca => {
                const plateNumberMatch = ca.purpose.match(/([A-Z0-9]{3}\s[A-Z0-9]{3,4})/);
                const engineNumberMatch = ca.purpose.match(/Engine No\.?\s*([A-Z0-9]+)/i);
                const chassisNumberMatch = ca.purpose.match(/Chassis No\.?\s*([A-Z0-9]+)/i);
                
                let motorcycle: Motorcycle | undefined;

                if (ca.motorcycleId) {
                    motorcycle = motorcycles.find(m => m.id === ca.motorcycleId);
                }
                else if (plateNumberMatch) {
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

    const filteredBySearch = items.filter(item => {
        const motorcycle = item.motorcycle;
        const cashAdvance = item.cashAdvance;
        const query = searchQuery.toLowerCase();

        if (motorcycle?.engineNumber.toLowerCase().includes(query)) return true;
        if (motorcycle?.chassisNumber.toLowerCase().includes(query)) return true;
        if (motorcycle?.model.toLowerCase().includes(query)) return true;
        if (motorcycle?.plateNumber?.toLowerCase().includes(query)) return true;
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;
        
        if (query === '') return true;

        return false;
    });

    const getFilteredByStatus = (items: LiquidationItem[]) => {
        switch(statusFilter) {
            case 'liquidated':
                return items.filter(i => i.cashAdvance.status === 'Liquidated');
            case 'unliquidated':
                 return items.filter(i => ['Approved', 'CV Received'].includes(i.cashAdvance.status));
            case 'all':
            default:
                return items.filter(i => ['Approved', 'CV Received', 'Liquidated'].includes(i.cashAdvance.status));
        }
    }

    const finalFilteredItems = getFilteredByStatus(filteredBySearch);


    return (
         <div className="grid gap-4">
             <div className="flex items-center gap-4">
                <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as LiquidationStatusFilter)}>
                    <TabsList>
                        <TabsTrigger value="unliquidated">For Liquidation</TabsTrigger>
                        <TabsTrigger value="liquidated">Liquidated</TabsTrigger>
                        <TabsTrigger value="all">View All</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <LiquidationTable items={finalFilteredItems} />
        </div>
    )
}


export default function LiquidationsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
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
