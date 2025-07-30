
'use client';

import { Header } from "@/components/layout/header";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { getCashAdvances, getMotorcycles, updateMotorcycles } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AppLoader } from "@/components/layout/loader";
import { ProtectedPage } from "@/components/auth/protected-page";
import { CashAdvance, Motorcycle } from "@/types";
import { EnrichedCashAdvance } from "../cash-advances/page";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, ChevronDown, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

type GroupedByCV = {
    cvNumber: string;
    advances: EnrichedCashAdvance[];
}

const ITEMS_PER_PAGE_LIAISON = 5;

function ReleasedCvContentLiaison({ searchQuery }: { searchQuery: string }) {
    const [allCAs, setAllCAs] = useState<CashAdvance[] | null>(null);
    const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[] | null>(null);
    const [openCvGroups, setOpenCvGroups] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            const [cashAdvances, motorcycles] = await Promise.all([
                getCashAdvances(), 
                getMotorcycles(), 
            ]);
            console.log('[Liaison View] Fetched Cash Advances:', cashAdvances);
            console.log('[Liaison View] Fetched Motorcycles:', motorcycles);
            console.log('[Liaison View] Current User:', user);
            setAllCAs(cashAdvances);
            setAllMotorcycles(motorcycles);
        };

        fetchData();
    }, [user]);
    
    if (!allCAs || !allMotorcycles || !user) {
        return <AppLoader />;
    }

    const enrichCashAdvances = (cas: CashAdvance[], motorcycles: Motorcycle[]): EnrichedCashAdvance[] => {
        return cas.map(ca => {
            const associatedMotorcycles = (ca.motorcycleIds || [])
                .map(id => motorcycles.find(m => m.id === id))
                .filter((m): m is Motorcycle => !!m);
            
            return { 
                cashAdvance: ca, 
                motorcycles: associatedMotorcycles
            };
        });
    };
    
    const relevantAdvances = allCAs;
    console.log('[Liaison View] Relevant Advances for Liaison:', relevantAdvances);

    const filteredByCvNumber = enrichCashAdvances(relevantAdvances, allMotorcycles).filter(item => {
        return !!item.cashAdvance.checkVoucherNumber;
    });
    console.log('[Liaison View] Filtered by CV Number:', filteredByCvNumber);

    const filteredBySearch = filteredByCvNumber.filter(item => {
        const { cashAdvance, motorcycles } = item;
        const query = searchQuery.toLowerCase();

        if (motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
        if (motorcycles.some(m => m.model.toLowerCase().includes(query))) return true;
        if (motorcycles.some(m => m.plateNumber?.toLowerCase().includes(query))) return true;
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.id.toLowerCase().includes(query)) return true;
        if (cashAdvance.checkVoucherNumber?.toLowerCase().includes(query)) return true;
        
        if (query === '') return true;

        return false;
    });
    console.log('[Liaison View] Filtered by Search:', filteredBySearch);

    const groupedByCvNumber = filteredBySearch.reduce((acc, item) => {
        const cv = item.cashAdvance.checkVoucherNumber || 'Unassigned';
        if (!acc[cv]) {
            acc[cv] = { cvNumber: cv, advances: [] };
        }
        acc[cv].advances.push(item);
        return acc;
    }, {} as Record<string, GroupedByCV>);

    const groupedArray = Object.values(groupedByCvNumber);
    console.log('[Liaison View] Final Grouped Array for display:', groupedArray);
    
    const toggleOpenCvGroup = (cvNumber: string) => {
        setOpenCvGroups(prev => prev.includes(cvNumber) ? prev.filter(cv => cv !== cvNumber) : [...prev, cvNumber]);
    };

    const totalPages = Math.ceil(groupedArray.length / ITEMS_PER_PAGE_LIAISON);
    const paginatedGroups = groupedArray.slice(
        (currentPage - 1) * ITEMS_PER_PAGE_LIAISON,
        currentPage * ITEMS_PER_PAGE_LIAISON
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Released Check Vouchers</CardTitle>
                 <Alert className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 mt-2">
                    <AlertCircle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
                    <AlertDescription className="text-sm">
                        Only Check Vouchers that have been released to you as the logged-in Liaison will be displayed here.
                    </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent className="grid gap-4">
                {paginatedGroups.map(group => {
                    const totalMotorcycles = group.advances.reduce((sum, item) => sum + item.motorcycles.length, 0);

                    return (
                        <Collapsible 
                            key={group.cvNumber} 
                            className="border rounded-lg"
                            open={openCvGroups.includes(group.cvNumber)}
                            onOpenChange={() => toggleOpenCvGroup(group.cvNumber)}
                        >
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-4 cursor-pointer bg-muted/50 rounded-t-lg">
                                <div className="flex items-center gap-4">
                                    <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                                    <div>
                                        <h3 className="font-semibold">CV #{group.cvNumber}</h3>
                                        <p className="text-sm text-muted-foreground">{totalMotorcycles} Motorcycle(s) included</p>
                                    </div>
                                </div>
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                        <Check className="mr-2 h-4 w-4"/>
                                        Released
                                    </Badge>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>CA Number</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.advances.map(item => (
                                            <TableRow key={item.cashAdvance.id}>
                                                <TableCell>{item.cashAdvance.id}</TableCell>
                                                <TableCell>{item.cashAdvance.purpose}</TableCell>
                                                <TableCell>{format(new Date(item.cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell className="text-right">₱{item.cashAdvance.amount.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
                {groupedArray.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No released CVs found.
                    </div>
                )}
            </CardContent>
            {totalPages > 1 && (
                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-muted-foreground">
                            Showing {paginatedGroups.length} of {groupedArray.length} check vouchers.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}


function ReleasedCvContentSupervisor({ searchQuery }: { searchQuery: string }) {
    const [allCAs, setAllCAs] = useState<CashAdvance[] | null>(null);
    const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[] | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            const [cashAdvances, motorcycles] = await Promise.all([
                getCashAdvances(), 
                getMotorcycles(), 
            ]);
            console.log('[Supervisor View] Fetched Cash Advances:', cashAdvances);
            console.log('[Supervisor View] Fetched Motorcycles:', motorcycles);
            setAllCAs(cashAdvances);
            setAllMotorcycles(motorcycles);
        };
        fetchData();
    }, []);
    
    if (!allCAs || !allMotorcycles) {
        return <AppLoader />;
    }

    const enrichCashAdvances = (cas: CashAdvance[], motorcycles: Motorcycle[]): EnrichedCashAdvance[] => {
        return cas.map(ca => {
            const associatedMotorcycles = (ca.motorcycleIds || [])
                .map(id => motorcycles.find(m => m.id === id))
                .filter((m): m is Motorcycle => !!m);
            
            return { 
                cashAdvance: ca, 
                motorcycles: associatedMotorcycles
            };
        });
    };
    
    const handleUpdateMotorcycles = async (updatedItems: Motorcycle[]) => {
        await updateMotorcycles(updatedItems);
        const [cashAdvances, motorcycles] = await Promise.all([getCashAdvances(), getMotorcycles()]);
        setAllCAs(cashAdvances);
        setAllMotorcycles(motorcycles);
    };

    const getDynamicCAStatus = (motorcycles: Motorcycle[]): string | 'N/A' => {
        if (!motorcycles || motorcycles.length === 0) return 'N/A';
        return motorcycles[0].status;
    };

    const filteredByStatus = enrichCashAdvances(allCAs, allMotorcycles).filter(item => {
        const dynamicStatus = getDynamicCAStatus(item.motorcycles);
        return dynamicStatus === 'Released CVs';
    });
     console.log('[Supervisor View] Filtered by Status (Released CVs):', filteredByStatus);


    const filteredBySearch = filteredByStatus.filter(item => {
        const { cashAdvance, motorcycles } = item;
        const query = searchQuery.toLowerCase();

        if (motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
        if (motorcycles.some(m => m.model.toLowerCase().includes(query))) return true;
        if (motorcycles.some(m => m.plateNumber?.toLowerCase().includes(query))) return true;
        if (cashAdvance.purpose.toLowerCase().includes(query)) return true;
        if (cashAdvance.personnel.toLowerCase().includes(query)) return true;
        if (cashAdvance.checkVoucherNumber?.toLowerCase().includes(query)) return true;

        
        if (query === '') return true;

        return false;
    });
    console.log('[Supervisor View] Filtered by Search:', filteredBySearch);

    return (
        <CashAdvanceTable 
            advances={filteredBySearch} 
            onMotorcycleUpdate={handleUpdateMotorcycles}
        />
    );
}

export default function ReleasedCvPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    if (!user) return <AppLoader />;

    const renderContent = () => {
        if (user.role === 'Liaison') {
            return <ReleasedCvContentLiaison searchQuery={searchQuery} />
        }
        return <ReleasedCvContentSupervisor searchQuery={searchQuery} />
    }

    return (
        <ProtectedPage allowedRoles={['Cashier', 'Store Supervisor', 'Liaison', 'Accounting']}>
            <div className="w-full">
                <Header title="Released CVs" onSearch={setSearchQuery} />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    {renderContent()}
                </main>
            </div>
        </ProtectedPage>
    );

    
