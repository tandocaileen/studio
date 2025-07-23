
'use client';
import { ProtectedPage } from "@/components/auth/protected-page";
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { LiaisonTable } from "@/components/users/liaison-table";

export default function UsersPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="User Management" />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <LiaisonTable />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
