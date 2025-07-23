
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { getMotorcycles, getCashAdvances } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";
import { Motorcycle, CashAdvance } from "@/types";

function DashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  const [cashAdvances, setCashAdvances] = useState<CashAdvance[] | null>(null);
  
  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
    getCashAdvances().then(setCashAdvances);
  }, []);

  const { user } = useAuth();
  // In a real app, user's branch would come from their profile data.
  const userBranch = "Main Office"; 

  if (!motorcycles || !cashAdvances) {
    return <AppLoader />;
  }

  const filteredMotorcycles = motorcycles.filter(m => 
    m.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.engineNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between">
          <div>
              <p className="text-lg text-muted-foreground">Welcome back,</p>
              <h2 className="text-2xl font-bold leading-tight tracking-tighter">
                  {user?.name}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                  {userBranch}
              </p>
          </div>
      </div>
      <SummaryCards
        motorcycles={motorcycles}
        cashAdvances={cashAdvances}
      />
      <MotorcycleTable motorcycles={filteredMotorcycles} />
    </>
  );
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ProtectedPage>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
          <Header title="Dashboard" onSearch={setSearchQuery} />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
                <DashboardContent searchQuery={searchQuery} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedPage>
  );
}
