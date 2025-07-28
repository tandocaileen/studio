
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type EnrichedCashAdvance = {
    cashAdvance: CashAdvance;
    motorcycle?: Motorcycle;
}

type DateRange = '7d' | '30d' | 'all';
type StatusFilter = 'all' | 'pending' | 'approved';

function CashAdvancesContent({ searchQuery }: { searchQuery: string }) {
    const [advances, setAdvances] = useState<EnrichedCashAdvance[] | null>(null);
    const [dateRange, setDateRange] = useState<DateRange>('7d');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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
    
    const getFilteredByDate = () => {
        if (dateRange === 'all') return advances;
        const days = dateRange === '7d' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return advances.filter(a => new Date(a.cashAdvance.date) >= cutoff);
    };

    const getFilteredByStatus = (items: EnrichedCashAdvance[]) => {
        if (statusFilter === 'all') return items;
        if (statusFilter === 'pending') return items.filter(i => i.cashAdvance.status === 'Pending');
        if (statusFilter === 'approved') return items.filter(i => i.cashAdvance.status === 'Approved');
        return items;
    }


    const filteredBySearch = getFilteredByDate().filter(item => {
        const { cashAdvance, motorcycle } = item;
        const query = searchQuery.toLowerCase();

        if (user.role === 'Liaison' && cashAdvance.personnel !== user.name) {
            return false;
        }

        if (motorcycle) { 
            if (motorcycle.customerName?.toLowerCase().includes(query)) return true;
            if (motorcycle.model.toLowerCase().includes(query)) return true;
             if (motorcycle.plateNumber?.toLowerCase().includes(query)) return true;
        }
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;
        
        // If query is empty, show all
        if (query === '') return true;

        return false;
    });

    const finalFiltered = getFilteredByStatus(filteredBySearch);


    return (
        <div className="grid gap-4">
             <div className="flex items-center gap-4">
                <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="ml-auto">
                    <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <CashAdvanceTable advances={finalFiltered} />
        </div>
    );
}

export default function CashAdvancesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ProtectedPage allowedRoles={['Liaison', 'Cashier', 'Store Supervisor']}>
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
