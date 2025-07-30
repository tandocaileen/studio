
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { getCashAdvances, getEndorsements, getLiaisons, getMotorcycles, updateMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";
import { CashAdvance, Endorsement, Motorcycle, MotorcycleStatus } from "@/types";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { OverdueAdvances } from "@/components/dashboard/overdue-advances";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, PlusCircle, RotateCcw, AlertCircle } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReceiveLtoDocs } from "@/components/dashboard/receive-lto-docs";
import { EndorsedIncompleteTable } from "@/components/dashboard/endorsed-incomplete-table";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LiaisonEndorsementTable } from "@/components/dashboard/liaison-endorsement-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AccountingDashboardContent } from "@/components/dashboard/accounting-dashboard";


const ALL_SUPERVISOR_STATUSES: MotorcycleStatus[] = ['Lacking Requirements', 'Endorsed', 'For CA Approval', 'For CV Issuance', 'Released CVs', 'For Liquidation', 'For Verification', 'Completed'];

type DateRange = '7d' | '30d' | 'all';


function SupervisorDashboardContent({ searchQuery }: { searchQuery: string }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  const [endorsements, setEndorsements] = useState<Endorsement[] | null>(null);
  
  const [activeStatusFilters, setActiveStatusFilters] = useState<MotorcycleStatus[]>(['Lacking Requirements']);
  const [tempStatusFilters, setTempStatusFilters] = useState<MotorcycleStatus[]>(['Lacking Requirements']);
  
  const [activeDateRange, setActiveDateRange] = useState<DateRange>('all');
  const [tempDateRange, setTempDateRange] = useState<DateRange>('all');

  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
    getEndorsements().then(setEndorsements);
  }, []);

  const { user } = useAuth();
  const userBranch = "Main Office";

  if (!user || !motorcycles || !endorsements) {
    return <AppLoader />;
  }
  
  const handleStateUpdate = async (updatedOrNewMotorcycles: Motorcycle | Motorcycle[]) => {
    await updateMotorcycles(updatedOrNewMotorcycles);
    const updatedData = await getMotorcycles();
    setMotorcycles(updatedData);
  };
  
  const applyFilters = () => {
    setActiveStatusFilters(tempStatusFilters);
    setActiveDateRange(tempDateRange);
  };

  const clearFilters = () => {
      setTempStatusFilters([]);
      setActiveStatusFilters([]);
      setTempDateRange('all');
      setActiveDateRange('all');
  };
  
  const handleStatusCheckboxChange = (status: MotorcycleStatus, checked: boolean) => {
    setTempStatusFilters(prev => checked ? [...prev, status] : prev.filter(s => s !== status));
  };

  const handleSelectAllStatuses = (checked: boolean | 'indeterminate') => {
    if(checked) {
        setTempStatusFilters(ALL_SUPERVISOR_STATUSES);
    } else {
        setTempStatusFilters([]);
    }
  };


  const filteredMotorcycles = motorcycles.filter(m => {
    if (activeStatusFilters.length > 0 && !activeStatusFilters.includes(m.status)) {
        return false;
    }
    
    if (activeDateRange !== 'all') {
        const days = activeDateRange === '7d' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(m.purchaseDate) < cutoff) return false;
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    return (
      m.plateNumber.toLowerCase().includes(query) ||
      m.make.toLowerCase().includes(query) ||
      m.model.toLowerCase().includes(query) ||
      m.engineNumber.toLowerCase().includes(query) ||
      m.chassisNumber.toLowerCase().includes(query) ||
      (m.customerName && m.customerName.toLowerCase().includes(query))
    );
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
          <Button variant="outline" onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
          </Button>
      </div>

       <div className={cn("grid grid-cols-1 lg:grid-cols-4 gap-6 items-start", !isFilterPanelVisible && "lg:grid-cols-1")}>
            <div className={cn("lg:col-span-3", !isFilterPanelVisible && "lg:col-span-4")}>
                <Card>
                    <CardContent className="p-6">
                        <MotorcycleTable motorcycles={filteredMotorcycles} onStateChange={handleStateUpdate} />
                    </CardContent>
                </Card>
            </div>
            {isFilterPanelVisible && (
                <div className="lg:col-span-1 lg:sticky top-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Refine motorcycles</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Collapsible defaultOpen>
                                <CollapsibleTrigger asChild>
                                    <div className="flex justify-between items-center w-full cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="filter-status-all"
                                                checked={tempStatusFilters.length === ALL_SUPERVISOR_STATUSES.length ? true : tempStatusFilters.length > 0 ? "indeterminate" : false}
                                                onCheckedChange={handleSelectAllStatuses}
                                            />
                                            <Label htmlFor="filter-status-all" className="font-semibold text-sm">Status</Label>
                                        </div>
                                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Separator className="my-2" />
                                    <div className="grid gap-2 pl-6">
                                        {ALL_SUPERVISOR_STATUSES.map(status => (
                                            <div key={status} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`filter-status-${status}`}
                                                    checked={tempStatusFilters.includes(status)}
                                                    onCheckedChange={(checked) => handleStatusCheckboxChange(status, !!checked)}
                                                />
                                                <Label htmlFor={`filter-status-${status}`} className="font-normal text-sm">{status}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                            <Collapsible defaultOpen>
                                <CollapsibleTrigger className="flex justify-between items-center w-full [&[data-state=open]>svg]:rotate-180">
                                    <Label className="font-semibold text-sm">Purchase Date</Label>
                                    <ChevronDown className="h-4 w-4 transition-transform" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Separator className="my-2" />
                                    <RadioGroup value={tempDateRange} onValueChange={(v) => setTempDateRange(v as DateRange)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="7d" id="r-p-7d" />
                                            <Label htmlFor="r-p-7d" className="font-normal text-sm">Last 7 days</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="30d" id="r-p-30d" />
                                            <Label htmlFor="r-p-30d" className="font-normal text-sm">Last 30 days</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="r-p-all" />
                                            <Label htmlFor="r-p-all" className="font-normal text-sm">All time</Label>
                                        </div>
                                    </RadioGroup>
                                </CollapsibleContent>
                            </Collapsible>
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
            )}
      </div>
    </>
  );
}

function LiaisonDashboardContent({ searchQuery }: { searchQuery: string }) {
    const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
    const [endorsements, setEndorsements] = useState<Endorsement[] | null>(null);
    
    const [activeEndorserFilters, setActiveEndorserFilters] = useState<string[]>([]);
    const [tempEndorserFilters, setTempEndorserFilters] = useState<string[]>([]);

    const [activeDateRange, setActiveDateRange] = useState<DateRange>('all');
    const [tempDateRange, setTempDateRange] = useState<DateRange>('all');
    
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            Promise.all([
                getMotorcycles(),
                getEndorsements()
            ]).then(([motorcycleData, endorsementData]) => {
                setEndorsements(endorsementData);
                setMotorcycles(motorcycleData);
            });
        }
    }, [user]);

    const userBranch = "Main Office";

    if (!user || !motorcycles || !endorsements) {
        return <AppLoader />;
    }

    const handleStateUpdate = async (updatedOrNewMotorcycles: Motorcycle | Motorcycle[]) => {
        await updateMotorcycles(updatedOrNewMotorcycles);
        const updatedMotorcycleData = await getMotorcycles();
        const updatedEndorsementData = await getEndorsements();
        setMotorcycles(updatedMotorcycleData);
        setEndorsements(updatedEndorsementData.filter(e => e.liaisonName === user.name));
    };

    const uniqueEndorsers = [...new Set(endorsements.map(e => e.createdBy))];

    const applyFilters = () => {
        setActiveEndorserFilters(tempEndorserFilters);
        setActiveDateRange(tempDateRange);
    };

    const clearFilters = () => {
        setTempEndorserFilters([]);
        setActiveEndorserFilters([]);
        setTempDateRange('all');
        setActiveDateRange('all');
    };

    const handleEndorserCheckboxChange = (endorser: string, checked: boolean) => {
        setTempEndorserFilters(prev => checked ? [...prev, endorser] : prev.filter(e => e !== endorser));
    };
    
    const handleSelectAllEndorsers = (checked: boolean | 'indeterminate') => {
        if(checked) {
            setTempEndorserFilters(uniqueEndorsers);
        } else {
            setTempEndorserFilters([]);
        }
    };

    const filteredEndorsements = endorsements.filter(e => {
        if (activeDateRange !== 'all') {
            const days = activeDateRange === '7d' ? 7 : 30;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            if (new Date(e.transactionDate) < cutoff) return false;
        }

        if (activeEndorserFilters.length > 0 && !activeEndorserFilters.includes(e.createdBy)) {
            return false;
        }
        
        return true;
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
                <Button variant="outline" onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>
            <div className={cn("grid grid-cols-1 lg:grid-cols-4 gap-6 items-start", !isFilterPanelVisible && "lg:grid-cols-1")}>
                <div className={cn("lg:col-span-3", !isFilterPanelVisible && "lg:col-span-4")}>
                    <Card>
                        <CardContent className="p-6">
                            <LiaisonEndorsementTable 
                                endorsements={filteredEndorsements}
                                motorcycles={motorcycles}
                                onStateChange={handleStateUpdate}
                                searchQuery={searchQuery}
                            />
                        </CardContent>
                    </Card>
                </div>
                {isFilterPanelVisible && (
                    <div className="lg:col-span-1 lg:sticky top-20">
                        <Alert className="mb-4 bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-yellow-900 dark:text-yellow-200">Suggestion</AlertTitle>
                            <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-400">
                                Gemini is faulty, during development,use this logic: Show only endorsements with at least 1 MC in status in filter (Endorsed - Ready or Endorsed - Incomplete). Hide other MCs.
                            </AlertDescription>
                        </Alert>
                        <Card>
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                                <CardDescription>Refine endorsements</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <Collapsible defaultOpen>
                                    <CollapsibleTrigger asChild>
                                        <div className="flex justify-between items-center w-full cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="filter-endorser-all"
                                                    checked={tempEndorserFilters.length === uniqueEndorsers.length ? true : tempEndorserFilters.length > 0 ? "indeterminate" : false}
                                                    onCheckedChange={handleSelectAllEndorsers}
                                                />
                                                <Label htmlFor="filter-endorser-all" className="font-semibold text-sm">Endorsed By</Label>
                                            </div>
                                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Separator className="my-2" />
                                        <div className="grid gap-2 pl-6">
                                            {uniqueEndorsers.map(endorser => (
                                                <div key={endorser} className="flex items-center gap-2">
                                                    <Checkbox 
                                                        id={`filter-endorser-${endorser}`}
                                                        checked={tempEndorserFilters.includes(endorser)}
                                                        onCheckedChange={(checked) => handleEndorserCheckboxChange(endorser, !!checked)}
                                                    />
                                                    <Label htmlFor={`filter-endorser-${endorser}`} className="font-normal text-sm">{endorser}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                                <Collapsible defaultOpen>
                                    <CollapsibleTrigger className="flex justify-between items-center w-full [&[data-state=open]>svg]:rotate-180">
                                        <Label className="font-semibold text-sm">Date Range</Label>
                                        <ChevronDown className="h-4 w-4 transition-transform" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Separator className="my-2" />
                                        <RadioGroup value={tempDateRange} onValueChange={(v) => setTempDateRange(v as DateRange)}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="7d" id="r-7d" />
                                                <Label htmlFor="r-7d" className="font-normal text-sm">Last 7 days</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="30d" id="r-30d" />
                                                <Label htmlFor="r-30d" className="font-normal text-sm">Last 30 days</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="all" id="r-all" />
                                                <Label htmlFor="r-all" className="font-normal text-sm">All time</Label>
                                            </div>
                                        </RadioGroup>
                                    </CollapsibleContent>
                                </Collapsible>
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
                )}
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
          case 'Accounting':
              return <AccountingDashboardContent searchQuery={searchQuery} />;
          default:
              return <AppLoader />;
      }
  }

  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier', 'Accounting']}>
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
