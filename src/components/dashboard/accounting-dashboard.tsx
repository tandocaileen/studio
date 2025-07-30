
'use client';

import * as React from 'react';
import { getCashAdvances, getMotorcycles } from '@/lib/data';
import { CashAdvance, Motorcycle } from '@/types';
import { AppLoader } from '../layout/loader';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Filter, RotateCcw, Search, Sheet, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';

type LiquidationStatus = 'Fully Liquidated' | 'Partially Liquidated' | 'Pending Liquidation';

type GroupedCashAdvance = {
  cashAdvance: CashAdvance;
  motorcycles: Motorcycle[];
  liquidationStatus: LiquidationStatus;
};

const ALL_STATUSES: LiquidationStatus[] = ['Fully Liquidated', 'Partially Liquidated', 'Pending Liquidation'];
const ITEMS_PER_PAGE = 10;

export function AccountingDashboardContent({ searchQuery }: { searchQuery: string }) {
  const [allCAs, setAllCAs] = React.useState<CashAdvance[] | null>(null);
  const [allMotorcycles, setAllMotorcycles] = React.useState<Motorcycle[] | null>(null);
  
  const [isFilterPanelVisible, setIsFilterPanelVisible] = React.useState(true);
  const [activeStatusFilters, setActiveStatusFilters] = React.useState<LiquidationStatus[]>(['Fully Liquidated']);
  const [tempStatusFilters, setTempStatusFilters] = React.useState<LiquidationStatus[]>(['Fully Liquidated']);

  const [currentPage, setCurrentPage] = React.useState(1);

  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      const [cas, mcs] = await Promise.all([getCashAdvances(), getMotorcycles()]);
      setAllCAs(cas);
      setAllMotorcycles(mcs);
    };
    fetchData();
  }, []);

  if (!user || !allCAs || !allMotorcycles) {
    return <AppLoader />;
  }

  const groupedCAs: GroupedCashAdvance[] = allCAs
    .map(ca => {
      const motorcycles = (ca.motorcycleIds || [])
        .map(id => allMotorcycles.find(m => m.id === id))
        .filter((m): m is Motorcycle => !!m);
      
      const totalCount = motorcycles.length;
      const liquidatedCount = motorcycles.filter(m => m.status === 'For Review').length;

      let liquidationStatus: LiquidationStatus;
      if (totalCount > 0 && liquidatedCount === totalCount) {
        liquidationStatus = 'Fully Liquidated';
      } else if (liquidatedCount > 0) {
        liquidationStatus = 'Partially Liquidated';
      } else {
        liquidationStatus = 'Pending Liquidation';
      }

      return { cashAdvance: ca, motorcycles, liquidationStatus };
    })
    .filter(group => {
       if (activeStatusFilters.length > 0 && !activeStatusFilters.includes(group.liquidationStatus)) {
            return false;
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (group.cashAdvance.id.toLowerCase().includes(query)) return true;
            if (group.cashAdvance.personnel.toLowerCase().includes(query)) return true;
            if (group.motorcycles.some(m => m.customerName?.toLowerCase().includes(query))) return true;
            return false;
        }

        return true;
    });

  const applyFilters = () => {
    setActiveStatusFilters([...tempStatusFilters]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setTempStatusFilters([]);
    setActiveStatusFilters([]);
    setCurrentPage(1);
  };

  const handleStatusCheckboxChange = (status: LiquidationStatus, checked: boolean) => {
    setTempStatusFilters(prev => checked ? [...prev, status] : prev.filter(s => s !== status));
  };

  const handleSelectAllStatuses = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setTempStatusFilters(ALL_STATUSES);
    } else {
      setTempStatusFilters([]);
    }
  };

  const totalPages = Math.ceil(groupedCAs.length / ITEMS_PER_PAGE);
  const paginatedCAs = groupedCAs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
                  {user?.role}
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
                <CardHeader>
                    <CardTitle>Cash Advance Verification</CardTitle>
                    <CardDescription>Review and verify fully liquidated cash advances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>CA Number</TableHead>
                                <TableHead>Liaison</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Units</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCAs.map(({ cashAdvance, liquidationStatus }) => (
                                <TableRow key={cashAdvance.id}>
                                    <TableCell className="font-medium">{cashAdvance.id}</TableCell>
                                    <TableCell>{cashAdvance.personnel}</TableCell>
                                    <TableCell>{format(new Date(cashAdvance.date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>₱{cashAdvance.amount.toLocaleString()}</TableCell>
                                    <TableCell>{cashAdvance.motorcycleIds?.length || 0}</TableCell>
                                    <TableCell>
                                        <Badge variant={liquidationStatus === 'Fully Liquidated' ? 'default' : 'outline'}>
                                            {liquidationStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            size="sm"
                                            onClick={() => router.push(`/verify/${cashAdvance.id}`)}
                                            disabled={liquidationStatus !== 'Fully Liquidated'}
                                        >
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Verify
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {groupedCAs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No cash advances match the current filters.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-muted-foreground">
                            Showing {paginatedCAs.length} of {groupedCAs.length} cash advances.
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
            </Card>
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
                            <CollapsibleTrigger asChild>
                                <div className="flex justify-between items-center w-full cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="filter-status-all"
                                            checked={tempStatusFilters.length === ALL_STATUSES.length ? true : tempStatusFilters.length > 0 ? "indeterminate" : false}
                                            onCheckedChange={handleSelectAllStatuses}
                                        />
                                        <Label htmlFor="filter-status-all" className="font-semibold text-sm">Liquidation Status</Label>
                                    </div>
                                    <ChevronsUpDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Separator className="my-2" />
                                <div className="grid gap-2 pl-6">
                                    {ALL_STATUSES.map(status => (
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
