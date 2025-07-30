
'use client';
import { ProtectedPage } from "@/components/auth/protected-page";
import { Header } from "@/components/layout/header";
import { LiaisonTable } from "@/components/users/liaison-table";

export default function UsersPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Cashier']}>
            <div className="w-full">
                <Header title="User Management" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <LiaisonTable />
                </main>
            </div>
        </ProtectedPage>
    );
}
