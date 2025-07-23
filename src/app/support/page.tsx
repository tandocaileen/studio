import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";

export default function SupportPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppSidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <Header title="Support" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="flex items-center justify-center h-96 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Support content goes here</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
