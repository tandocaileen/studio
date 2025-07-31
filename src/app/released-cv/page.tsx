
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
import { format, subDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CashAdvanceRequestDocument } from "@/components/cash-advances/cash-advance-request-document";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type DateRange = '7d' | '30d' | 'all';

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
    const [previewingAdvance, setPreviewingAdvance] = useState<EnrichedCashAdvance | null>(null);
    const documentRef = React.useRef(null);
    
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
        <>
        <Card>
            <CardHeader>
                <CardTitle>My Released CVs</CardTitle>
                 <CardDescription>
                    These are the check vouchers released to you. Expand each CV to view and act on the associated cash advances.
                 </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {paginatedGroups.map(group => {
                    const totalMotorcycles = group.advances.reduce((sum, item) => sum + item.motorcycles.length, 0);
                    const releaseDate = group.advances[0]?.cashAdvance.checkVoucherReleaseDate;

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
                                    <Badge variant="outline">
                                        CV Released: {releaseDate ? format(new Date(releaseDate), 'MMM dd, yyyy') : 'N/A'}
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
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.advances.map(item => (
                                            <TableRow key={item.cashAdvance.id}>
                                                <TableCell>{item.cashAdvance.id}</TableCell>
                                                <TableCell>{item.cashAdvance.purpose}</TableCell>
                                                <TableCell>{format(new Date(item.cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell className="text-right">₱{item.cashAdvance.amount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => setPreviewingAdvance(item)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
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
        
        <Dialog open={!!previewingAdvance} onOpenChange={(open) => !open && setPreviewingAdvance(null)}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Cash Advance Preview</DialogTitle>
                    <DialogDescription>
                        Review the details of the cash advance request.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[70vh] overflow-y-auto p-2">
                    {previewingAdvance && (
                        <CashAdvanceRequestDocument 
                            ref={documentRef} 
                            advance={previewingAdvance.cashAdvance} 
                            motorcycles={previewingAdvance.motorcycles} 
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setPreviewingAdvance(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}


function ReleasedCvContentSupervisor({ searchQuery }: { searchQuery: string }) {
    const [allCAs, setAllCAs] = useState<CashAdvance[] | null>(null);
    const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[] | null>(null);
    const [dateRange, setDateRange] = useState<DateRange>('all');
    
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

    const filteredByDate = filteredByStatus.filter(item => {
        if (dateRange === 'all') return true;
        const releaseDate = item.cashAdvance.checkVoucherReleaseDate;
        if (!releaseDate) return false;

        const days = dateRange === '7d' ? 7 : 30;
        const cutoff = subDays(new Date(), days);
        return new Date(releaseDate) >= cutoff;
    });

    const filteredBySearch = filteredByDate.filter(item => {
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
        <div className="grid gap-4">
            <div className="flex justify-end">
                 <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <CashAdvanceTable 
                advances={filteredBySearch} 
                onMotorcycleUpdate={handleUpdateMotorcycles}
                showStatusColumn={false}
            />
        </div>
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
                <Header title="Released Check Vouchers" onSearch={setSearchQuery} />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    {renderContent()}
                </main>
            </div>
        </ProtectedPage>
    );
}

    
