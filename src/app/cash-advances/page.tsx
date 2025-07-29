
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { getCashAdvances, getLiaisons, getMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { CashAdvance, LiaisonUser, Motorcycle } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type EnrichedCashAdvance = {
    cashAdvance: CashAdvance;
    motorcycles: Motorcycle[];
}

type DateRange = '7d' | '30d' | 'all';
type CashAdvanceStatus = CashAdvance['status'];
const ALL_CA_STATUSES: CashAdvanceStatus[] = ['Pending', 'Approved', 'Check Voucher Released', 'CV Received', 'Liquidated', 'Rejected'];


function CashAdvancesContent({ searchQuery }: { searchQuery: string }) {
    const [advances, setAdvances] = useState<EnrichedCashAdvance[] | null>(null);
    const [liaisons, setLiaisons] = useState<LiaisonUser[] | null>(null);
    const { user } = useAuth();
    
    // Filter state
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

    const [activeDateRange, setActiveDateRange] = useState<DateRange>('all');
    const [tempDateRange, setTempDateRange] = useState<DateRange>('all');
    
    const [activeStatusFilters, setActiveStatusFilters] = useState<CashAdvanceStatus[]>([]);
    const [tempStatusFilters, setTempStatusFilters] = useState<CashAdvanceStatus[]>([]);

    const [activeLiaisonFilters, setActiveLiaisonFilters] = useState<string[]>([]);
    const [tempLiaisonFilters, setTempLiaisonFilters] = useState<string[]>([]);


    useEffect(() => {
        Promise.all([getCashAdvances(), getMotorcycles(), getLiaisons()]).then(([cashAdvances, motorcycles, liaisonData]) => {
            const enriched: EnrichedCashAdvance[] = cashAdvances.map(ca => {
                const associatedMotorcycles = ca.motorcycleIds
                    ? motorcycles.filter(m => ca.motorcycleIds!.includes(m.id))
                    : (ca.motorcycleId ? [motorcycles.find(m => m.id === ca.motorcycleId)!] : []);

                return { 
                    cashAdvance: ca, 
                    motorcycles: associatedMotorcycles.filter(Boolean) as Motorcycle[]
                };
            });
            setAdvances(enriched);
            setLiaisons(liaisonData);
        });
    }, []);
    
    if (!advances || !user || !liaisons) {
        return <AppLoader />;
    }
    
    const applyFilters = () => {
        setActiveDateRange(tempDateRange);
        setActiveStatusFilters(tempStatusFilters);
        setActiveLiaisonFilters(tempLiaisonFilters);
    };

    const clearFilters = () => {
        setTempDateRange('all');
        setActiveDateRange('all');
        setTempStatusFilters([]);
        setActiveStatusFilters([]);
        setTempLiaisonFilters([]);
        setActiveLiaisonFilters([]);
    };
    
    const handleStatusCheckboxChange = (status: CashAdvanceStatus, checked: boolean) => {
        setTempStatusFilters(prev => checked ? [...prev, status] : prev.filter(s => s !== status));
    };

    const handleLiaisonCheckboxChange = (liaisonName: string, checked: boolean) => {
        setTempLiaisonFilters(prev => checked ? [...prev, liaisonName] : prev.filter(l => l !== liaisonName));
    };

    const uniqueLiaisonsInCAs = [...new Set(advances.map(a => a.cashAdvance.personnel))];
    
    const filteredByFilters = advances.filter(item => {
        const { cashAdvance } = item;
        
        // Date Range Filter
        if (activeDateRange !== 'all') {
            const days = activeDateRange === '7d' ? 7 : 30;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            if (new Date(cashAdvance.date) < cutoff) return false;
        }

        // Status Filter
        if (activeStatusFilters.length > 0 && !activeStatusFilters.includes(cashAdvance.status)) {
            return false;
        }

        // Liaison Filter
        if (activeLiaisonFilters.length > 0 && !activeLiaisonFilters.includes(cashAdvance.personnel)) {
            return false;
        }

        return true;
    });

    const filteredBySearch = filteredByFilters.filter(item => {
        const { cashAdvance, motorcycles } = item;
        const query = searchQuery.toLowerCase();

        if (user.role === 'Liaison' && cashAdvance.personnel !== user.name) {
            return false;
        }

        if (motorcycles && motorcycles.length > 0) { 
            if (motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
            if (motorcycles.some(m => m.model.toLowerCase().includes(query))) return true;
            if (motorcycles.some(m => m.plateNumber?.toLowerCase().includes(query))) return true;
        }
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;
        
        if (query === '') return true;

        return false;
    });

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-4 gap-6 items-start", !isFilterPanelVisible && "lg:grid-cols-1")}>
            <div className={cn("lg:col-span-3", !isFilterPanelVisible && "lg:col-span-4")}>
                <CashAdvanceTable advances={filteredBySearch} />
            </div>
            {isFilterPanelVisible && (
                 <div className="lg:col-span-1 lg:sticky top-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Refine cash advances</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                             <Collapsible defaultOpen>
                                <CollapsibleTrigger className="flex justify-between items-center w-full [&[data-state=open]>svg]:rotate-180">
                                    <Label className="font-semibold text-sm">Status</Label>
                                    <ChevronDown className="h-4 w-4 transition-transform" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Separator className="my-2" />
                                    <div className="grid gap-2">
                                        {ALL_CA_STATUSES.map(status => (
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
                                    <Label className="font-semibold text-sm">Liaison</Label>
                                    <ChevronDown className="h-4 w-4 transition-transform" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Separator className="my-2" />
                                    <div className="grid gap-2">
                                        {uniqueLiaisonsInCAs.map(liaison => (
                                            <div key={liaison} className="flex items-center gap-2">
                                                <Checkbox 
                                                    id={`filter-liaison-${liaison}`}
                                                    checked={tempLiaisonFilters.includes(liaison)}
                                                    onCheckedChange={(checked) => handleLiaisonCheckboxChange(liaison, !!checked)}
                                                />
                                                <Label htmlFor={`filter-liaison-${liaison}`} className="font-normal text-sm">{liaison}</Label>
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
                                            <RadioGroupItem value="7d" id="r-d-7d" />
                                            <Label htmlFor="r-d-7d" className="font-normal text-sm">Last 7 days</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="30d" id="r-d-30d" />
                                            <Label htmlFor="r-d-30d" className="font-normal text-sm">Last 30 days</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="r-d-all" />
                                            <Label htmlFor="r-d-all" className="font-normal text-sm">All time</Label>
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
    );
}

export default function CashAdvancesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ProtectedPage allowedRoles={['Liaison', 'Cashier', 'Store Supervisor']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Cash Advances" onSearch={setSearchQuery} />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <CashAdvancesContent searchQuery={searchQuery} />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
