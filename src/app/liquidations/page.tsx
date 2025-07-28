
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { LiquidationsContent } from "@/components/liquidations/liquidation-table";
import React, { useState } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";


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
