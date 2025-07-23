
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { getMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";
import { Motorcycle } from "@/types";

function DashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  
  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
  }, []);

  const { user } = useAuth();
  const userBranch = "Main Office"; 

  if (!user || !motorcycles) {
    return <AppLoader />;
  }

  // Filter logic based on user role
  const filteredMotorcycles = motorcycles.filter(m => {
    const isUserAssigned = m.assignedLiaison === user.name;
    const isUnregistered = ['Incomplete', 'Ready to Register'].includes(m.status);

    // Role-based filtering
    let roleFilter = false;
    if (user.role === 'Store Supervisor') {
      roleFilter = true; // Supervisor sees all
    } else if (user.role === 'Liaison') {
      roleFilter = isUserAssigned && isUnregistered;
    }

    if (!roleFilter) return false;

    // Search query filtering
    const searchFilter =
      m.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.engineNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.customerName && m.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return searchFilter;
  });


  return (
    <>
      <div className="flex items-center justify-between">
          <div>
              <p className="text-lg text-muted-foreground">Welcome back,</p>
              <h2 className="text-2xl font-bold leading-tight tracking-tighter">
                  {user?.name}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                  {userBranch} - {user?.role}
              </p>
          </div>
      </div>
      <MotorcycleTable motorcycles={filteredMotorcycles} />
    </>
  );
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const getTitle = () => {
    if (user?.role === 'Liaison') return 'Home';
    return 'Dashboard';
  }

  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison']}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
          <Header title={getTitle()} onSearch={setSearchQuery} />
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
