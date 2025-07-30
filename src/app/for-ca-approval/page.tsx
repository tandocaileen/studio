
'use client';

import { Header } from "@/components/layout/header";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { getCashAdvances, getMotorcycles, updateMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { CashAdvance, Motorcycle } from "@/types";
import { EnrichedCashAdvance } from "../cash-advances/page";
import { useAuth } from "@/context/AuthContext";

function ForCaApprovalContent({ searchQuery }: { searchQuery: string }) {
    const [allCAs, setAllCAs] = useState<CashAdvance[] | null>(null);
    const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[] | null>(null);
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchData = async () => {
            const [cashAdvances, motorcycles] = await Promise.all([
                getCashAdvances(), 
                getMotorcycles(), 
            ]);
            setAllCAs(cashAdvances);
            setAllMotorcycles(motorcycles);
        };

        fetchData();
    }, []);
    
    if (!allCAs || !allMotorcycles || !user) {
        return <AppLoader />;
    }

    const enrichCashAdvances = (cas: CashAdvance[], motorcycles: Motorcycle[]): EnrichedCashAdvance[] => {
        return cas.map(ca => {
            const associatedMotorcycles = (ca.motorcycleIds || [])
                .map(id => motorcycles.find(m => m.id === id))
                .filter((m): m is Motorcycle => !!m);
            
            return { 
                cashAdvance: ca, 
                motorcycles: associatedMotorcycles
            };
        });
    };
    
    const handleUpdateMotorcycles = async (updatedItems: Motorcycle[]) => {
        await updateMotorcycles(updatedItems);
        const [cashAdvances, motorcycles] = await Promise.all([getCashAdvances(), getMotorcycles()]);
        setAllCAs(cashAdvances);
        setAllMotorcycles(motorcycles);
    };

    const getDynamicCAStatus = (motorcycles: Motorcycle[]): string | 'N/A' => {
        if (!motorcycles || motorcycles.length === 0) return 'N/A';
        return motorcycles[0].status;
    };
    
    let relevantAdvances = allCAs;
    if (user.role === 'Liaison') {
        relevantAdvances = allCAs.filter(ca => ca.personnel === user.name);
    }

    const filteredByStatus = enrichCashAdvances(relevantAdvances, allMotorcycles).filter(item => {
        const dynamicStatus = getDynamicCAStatus(item.motorcycles);
        return dynamicStatus === 'For CA Approval';
    });

    const filteredBySearch = filteredByStatus.filter(item => {
        const { cashAdvance, motorcycles } = item;
        const query = searchQuery.toLowerCase();

        if (motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
        if (motorcycles.some(m => m.model.toLowerCase().includes(query))) return true;
        if (motorcycles.some(m => m.plateNumber?.toLowerCase().includes(query))) return true;
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;
        
        if (query === '') return true;

        return false;
    });

    return (
        <CashAdvanceTable 
            advances={filteredBySearch} 
            onMotorcycleUpdate={handleUpdateMotorcycles}
        />
    );
}

export default function ForCaApprovalPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ProtectedPage allowedRoles={['Liaison', 'Accounting']}>
             <div className="w-full">
                <Header title="For CA Approval" onSearch={setSearchQuery} />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <ForCaApprovalContent searchQuery={searchQuery} />
                </main>
            </div>
        </ProtectedPage>
    );
}
