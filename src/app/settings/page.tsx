
import { ProtectedPage } from "@/components/auth/protected-page";
import { Header } from "@/components/layout/header";

export default function SettingsPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier', 'Accounting']}>
            <div className="w-full">
                <Header title="Settings" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <div className="flex items-center justify-center h-96 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Settings content goes here</p>
                    </div>
                </main>
            </div>
        </ProtectedPage>
    );
}
