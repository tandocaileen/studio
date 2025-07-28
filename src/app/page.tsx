
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { getCashAdvances, getEndorsements, getMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";
import { CashAdvance, Endorsement, Motorcycle } from "@/types";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { OverdueAdvances } from "@/components/dashboard/overdue-advances";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { ReceiveLtoDocs } from "@/components/dashboard/receive-lto-docs";
import { EndorsedIncompleteTable } from "@/components/dashboard/endorsed-incomplete-table";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ViewFilter = 'unregistered' | 'all';
type DashboardTab = 'all-motorcycles' | 'pending-endorsements';

function SupervisorDashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  const [endorsements, setEndorsements] = useState<Endorsement[] | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('unregistered');
  const [activeTab, setActiveTab] = useState<DashboardTab>('all-motorcycles');

  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
    getEndorsements().then(setEndorsements);
  }, []);

  const { user } = useAuth();
  const userBranch = "Main Office";

  if (!user || !motorcycles || !endorsements) {
    return <AppLoader />;
  }

  const handleStateUpdate = (updatedMotorcycles: Motorcycle[]) => {
      setMotorcycles(currentMotorcycles => {
          const updatedIds = new Set(updatedMotorcycles.map(um => um.id));
          return currentMotorcycles!.map(cm => {
              const updatedVersion = updatedMotorcycles.find(um => um.id === cm.id);
              return updatedVersion || cm;
          });
      });
  };
  
  const filteredMotorcycles = motorcycles.filter(m => {
    let matchesFilter = true;
    if (viewFilter === 'unregistered') {
        matchesFilter = !['For Review'].includes(m.status);
    }
    
    if (!matchesFilter) return false;

    if (!searchQuery) return true;
    
    const searchFilter =
      m.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.engineNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.customerName && m.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return searchFilter;
  });

  const endorsedIncompleteMotorcycles = motorcycles.filter(
    m => m.status === 'Incomplete' && endorsements.some(e => e.motorcycleIds.includes(m.id))
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
                  {userBranch} - {user?.role}
              </p>
          </div>
      </div>

       <div className="grid gap-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)} className="w-full">
            <div className="flex justify-start border-b">
                <TabsList className="bg-transparent p-0 gap-4">
                    <TabsTrigger 
                        value="all-motorcycles" 
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent pb-3"
                    >
                        Motorcycles List
                    </TabsTrigger>
                    <TabsTrigger 
                        value="pending-endorsements"
                        className={cn(
                            'data-[state=active]:border-destructive data-[state=active]:text-destructive data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent pb-3',
                            endorsedIncompleteMotorcycles.length > 0 && 'text-destructive'
                        )}
                    >
                        Endorsed Units with Incomplete Details ({endorsedIncompleteMotorcycles.length})
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="pending-endorsements">
                <EndorsedIncompleteTable 
                    motorcycles={endorsedIncompleteMotorcycles}
                    onUpdate={handleStateUpdate}
                />
            </TabsContent>
            <TabsContent value="all-motorcycles">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Tabs value={viewFilter} onValueChange={(value) => setViewFilter(value as ViewFilter)}>
                            <TabsList>
                                <TabsTrigger value="unregistered">Unregistered</TabsTrigger>
                                <TabsTrigger value="all">View All</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1 ml-auto">
                                    <PlusCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Receive MC Docs</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-7xl">
                                <ReceiveLtoDocs motorcycles={motorcycles.filter(m => m.status === 'Incomplete')} onSave={handleStateUpdate} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <MotorcycleTable motorcycles={filteredMotorcycles} onStateChange={handleStateUpdate} />
                </CardContent>
            </Card>
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}


function LiaisonDashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  const [viewFilter, setViewFilter] = useState<'pending' | 'all'>('pending');
  
  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
  }, []);

  const { user } = useAuth();
  const userBranch = "Main Office"; 

  if (!user || !motorcycles) {
    return <AppLoader />;
  }

  const handleStateUpdate = (updatedMotorcycles: Motorcycle[]) => {
      setMotorcycles(currentMotorcycles => {
          const updatedIds = new Set(updatedMotorcycles.map(um => um.id));
          return currentMotorcycles!.map(cm => {
              const updatedVersion = updatedMotorcycles.find(um => um.id === cm.id);
              return updatedVersion || cm;
          });
      });
  };

  // Filter logic based on user role
  const filteredMotorcycles = motorcycles.filter(m => {
    const isUserAssigned = m.assignedLiaison === user.name;
    if (!isUserAssigned) return false;

    if (viewFilter === 'pending') {
        const isPending = ['Endorsed', 'Processing'].includes(m.status);
        if(!isPending) return false;
    }
    
    if (!searchQuery) return true;

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
      <div className="flex items-center gap-4">
        <Tabs value={viewFilter} onValueChange={(value) => setViewFilter(value as 'pending' | 'all')}>
            <TabsList>
                <TabsTrigger value="pending">Pending Assignments</TabsTrigger>
                <TabsTrigger value="all">View All</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>
      <MotorcycleTable motorcycles={filteredMotorcycles} onStateChange={handleStateUpdate} />
    </>
  );
}

function CashierDashboardContent({searchQuery}: {searchQuery: string}) {
    const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
    const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([getMotorcycles(), getCashAdvances()]).then(([motorcycleData, cashAdvanceData]) => {
            setMotorcycles(motorcycleData);
            setCashAdvances(cashAdvanceData);
            setLoading(false);
        });
    }, []);

    if (loading || !user) {
        return <AppLoader />;
    }

     // Use Supervisor content for Cashier as they have same permissions
    return <SupervisorDashboardContent searchQuery={searchQuery} />;
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <AppLoader />
  }

  const getTitle = () => {
    if (user?.role === 'Liaison') return 'Home';
    return 'Dashboard';
  }

  const renderContent = () => {
      switch(user?.role) {
          case 'Store Supervisor':
              return <SupervisorDashboardContent searchQuery={searchQuery} />;
          case 'Liaison':
              return <LiaisonDashboardContent searchQuery={searchQuery} />;
          case 'Cashier':
                return <CashierDashboardContent searchQuery={searchQuery} />;
          default:
              return <AppLoader />;
      }
  }

  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
          <Header title={getTitle()} onSearch={setSearchQuery} />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
                {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </ProtectedPage>
  );
}
