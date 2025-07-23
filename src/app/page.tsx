import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { getMotorcycles, getCashAdvances } from "@/lib/data";

export default async function DashboardPage() {
  const motorcycles = await getMotorcycles();
  const cashAdvances = await getCashAdvances();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header title="Dashboard" />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <SummaryCards
              motorcycles={motorcycles}
              cashAdvances={cashAdvances}
            />
            <MotorcycleTable motorcycles={motorcycles} />
          </div>
        </main>
      </div>
    </div>
  );
}
