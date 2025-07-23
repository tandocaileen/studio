import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { getMotorcycles, getCashAdvances } from "@/lib/data";
import React from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";

async function DashboardContent() {
  const motorcycles = await getMotorcycles();
  const cashAdvances = await getCashAdvances();

  // In a real app, this would come from user session.
  const userName = "John Doe"; 
  const userPosition = "Liaison Supervisor";

  return (
    <>
      <div className="flex items-center justify-between">
          <div>
              <p className="text-lg text-muted-foreground">Welcome back,</p>
              <h2 className="text-2xl font-bold leading-tight tracking-tighter">
                  {userName} 
              </h2>
          </div>
      </div>
      <SummaryCards
        motorcycles={motorcycles}
        cashAdvances={cashAdvances}
      />
      <MotorcycleTable motorcycles={motorcycles} />
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header title="Dashboard" />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
              <React.Suspense fallback={<AppLoader />}>
                <DashboardContent />
              </React.Suspense>
            </div>
          </main>
        </div>
      </div>
    </ProtectedPage>
  );
}
