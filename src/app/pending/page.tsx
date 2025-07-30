
'use client';

import { Header } from "@/components/layout/header";
import { MotorcycleTable } from "@/components/dashboard/motorcycle-table";
import { getMotorcycles, updateMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/context/AuthContext";
import { Motorcycle, MotorcycleStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


const ALL_SUPERVISOR_STATUSES: MotorcycleStatus[] = ['Lacking Requirements', 'Endorsed', 'For CA Approval', 'For CV Issuance', 'Released CVs', 'For Liquidation', 'For Verification', 'Completed'];

type DateRange = '7d' | '30d' | 'all';


function PendingContent({ searchQuery, onSearchQueryChange }: { searchQuery: string, onSearchQueryChange: (query: string) => void }) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[] | null>(null);
  
  const [activeStatusFilters, setActiveStatusFilters] = useState<MotorcycleStatus[]>(['Lacking Requirements']);
  const [tempStatusFilters, setTempStatusFilters] = useState<MotorcycleStatus[]>(['Lacking Requirements']);
  
  const [activeDateRange, setActiveDateRange] = useState<DateRange>('all');
  const [tempDateRange, setTempDateRange] = useState<DateRange>('all');

  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

  useEffect(() => {
    getMotorcycles().then(setMotorcycles);
  }, []);

  const { user } = useAuth();

  if (!user || !motorcycles) {
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
    <div className="w-full">
        <Header title="Pending Motorcycles" onSearch={onSearchQueryChange} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
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
            </div>
        </main>
    </div>
  );
}


export default function PendingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <ProtectedPage allowedRoles={['Store Supervisor', 'Cashier']}>
        <PendingContent searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
    </ProtectedPage>
  );
}
