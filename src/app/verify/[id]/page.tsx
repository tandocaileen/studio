
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from '@/components/auth/protected-page';

function VerificationContent() {
    return (
        <div className="flex items-center justify-center h-96 border border-dashed rounded-lg">
            <p className="text-muted-foreground">Verification page content goes here.</p>
        </div>
    );
}


export default function VerificationPage() {
    return (
        <ProtectedPage allowedRoles={['Accounting']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Verify Liquidation" showBack={true} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <VerificationContent />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
