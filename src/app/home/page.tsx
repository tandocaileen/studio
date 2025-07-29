
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { getCashAdvances, getEndorsements, getMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";
import { CashAdvance, Endorsement, Motorcycle, MotorcycleStatus } from "@/types";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { OverdueAdvances } from "@/components/dashboard/overdue-advances";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, PlusCircle, RotateCcw } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReceiveLtoDocs } from "@/components/dashboard/receive-lto-docs";
import { EndorsedIncompleteTable } from "@/components/dashboard/endorsed-incomplete-table";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const ALL_STATUSES: MotorcycleStatus[] = ['Incomplete', 'Ready to Register', 'Endorsed - Incomplete', 'Endorsed - Ready', 'Processing', 'For Review'];

function SupervisorDashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  const [endorsements, setEndorsements] = useState<Endorsement[] | null>(null);
  const [activeStatusFilters, setActiveStatusFilters] = React.useState<string[]>(['Incomplete', 'Ready to Register']);
  const [tempStatusFilters, setTempStatusFilters] = React.useState<string[]>(['Incomplete', 'Ready to Register']);

  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
    getEndorsements().then(setEndorsements);
  }, []);

  const { user } = useAuth();
  const userBranch = "Main Office";

  if (!user || !motorcycles || !endorsements) {
    return <AppLoader />;
  }
  
  const handleCheckboxChange = (status: string, checked: boolean) => {
    setTempStatusFilters(prev => {
        if (checked) {
            return [...prev, status];
        } else {
            return prev.filter(s => s !== status);
        }
    });
  };
  
  const applyFilters = () => {
      setActiveStatusFilters(tempStatusFilters);
  };
  
  const clearFilters = () => {
      setTempStatusFilters([]);
      setActiveStatusFilters([]);
  };

  const handleStateUpdate = (updatedOrNewMotorcycles: Motorcycle | Motorcycle[]) => {
      setMotorcycles(currentMotorcycles => {
          if (!currentMotorcycles) return [];
          const motorcyclesMap = new Map(currentMotorcycles.map(m => [m.id, m]));

          if (Array.isArray(updatedOrNewMotorcycles)) {
              updatedOrNewMotorcycles.forEach(um => motorcyclesMap.set(um.id, um));
          } else {
              motorcyclesMap.set(updatedOrNewMotorcycles.id, updatedOrNewMotorcycles);
          }
          
          return Array.from(motorcyclesMap.values());
      });
  };
  
  const filteredMotorcycles = motorcycles.filter(m => {
    let matchesStatus = true;
    if (activeStatusFilters.length > 0) {
        matchesStatus = activeStatusFilters.includes(m.status);
    }
    
    if (!matchesStatus) return false;

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

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3">
             <Card>
                <CardContent className="p-6">
                    <MotorcycleTable motorcycles={filteredMotorcycles} onStateChange={handleStateUpdate} />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 lg:sticky top-20">
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your view</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <Label className="font-semibold text-sm">Status</Label>
                         <Separator className="my-2" />
                        <div className="grid gap-2">
                           {ALL_STATUSES.map(status => (
                            <div key={status} className="flex items-center gap-2">
                                <Checkbox 
                                    id={`filter-${status}`}
                                    checked={tempStatusFilters.includes(status)}
                                    onCheckedChange={(checked) => handleCheckboxChange(status, !!checked)}
                                />
                                <Label htmlFor={`filter-${status}`} className="font-normal text-sm">
                                    {status}
                                </Label>
                            </div>
                           ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={applyFilters} className="w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>
                    <Button onClick={clearFilters} variant="ghost" className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </>
  );
}

const LIAISON_STATUSES: MotorcycleStatus[] = ['Endorsed - Incomplete', 'Endorsed - Ready', 'Processing', 'For Review'];

function LiaisonDashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>(['Endorsed - Ready', 'Endorsed - Incomplete']);
  const [tempStatusFilters, setTempStatusFilters] = useState<string[]>(['Endorsed - Ready', 'Endorsed - Incomplete']);
  
  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
  }, []);

  const { user } = useAuth();
  const userBranch = "Main Office"; 

  if (!user || !motorcycles) {
    return <AppLoader />;
  }
  
  const handleCheckboxChange = (status: string, checked: boolean) => {
    setTempStatusFilters(prev => {
        if (checked) {
            return [...prev, status];
        } else {
            return prev.filter(s => s !== status);
        }
    });
  };

  const applyFilters = () => {
      setActiveStatusFilters(tempStatusFilters);
  };
  
  const clearFilters = () => {
      setTempStatusFilters([]);
      setActiveStatusFilters([]);
  };

  const handleStateUpdate = (updatedMotorcycles: Motorcycle[]) => {
     if (Array.isArray(updatedMotorcycles)) {
        setMotorcycles(currentMotorcycles => {
            if (!currentMotorcycles) return [];
            const updatedIds = new Set(updatedMotorcycles.map(um => um.id));
            const currentMotorcyclesMap = new Map(currentMotorcycles.map(m => [m.id, m]));
            updatedMotorcycles.forEach(um => currentMotorcyclesMap.set(um.id, um));
            return Array.from(currentMotorcyclesMap.values());
        });
      }
  };

  // Filter logic based on user role
  const filteredMotorcycles = motorcycles.filter(m => {
    const isUserAssigned = m.assignedLiaison === user.name;
    if (!isUserAssigned) return false;

    if (activeStatusFilters.length > 0 && !activeStatusFilters.includes(m.status)) {
        return false;
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3">
             <Card>
                <CardContent className="p-6">
                    <MotorcycleTable motorcycles={filteredMotorcycles} onStateChange={handleStateUpdate} />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 lg:sticky top-20">
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your view</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <Label className="font-semibold text-sm">Status</Label>
                         <Separator className="my-2" />
                        <div className="grid gap-2">
                           {LIAISON_STATUSES.map(status => (
                            <div key={status} className="flex items-center gap-2">
                                <Checkbox 
                                    id={`filter-${status}`}
                                    checked={tempStatusFilters.includes(status)}
                                    onCheckedChange={(checked) => handleCheckboxChange(status, !!checked)}
                                />
                                <Label htmlFor={`filter-${status}`} className="font-normal text-sm">
                                    {status}
                                </Label>
                            </div>
                           ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={applyFilters} className="w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>
                    <Button onClick={clearFilters} variant="ghost" className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
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
