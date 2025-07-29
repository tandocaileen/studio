
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Motorcycle, MotorcycleStatus } from '@/types';
import { Wrench, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { MotorcycleDetailsDialog } from './motorcycle-details-dialog';

type MotorcycleTableProps = {
  motorcycles: Motorcycle[];
  onStateChange?: (updatedMotorcycles: Motorcycle | Motorcycle[]) => void;
};

type SortableColumn = keyof Motorcycle;

const ITEMS_PER_PAGE = 10;

export function MotorcycleTable({ motorcycles: initialMotorcycles, onStateChange }: MotorcycleTableProps) {
  const [motorcycles, setMotorcycles] = React.useState(initialMotorcycles);
  const [editingMotorcycle, setEditingMotorcycle] = React.useState<Motorcycle | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState<SortableColumn>('status');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  React.useEffect(() => {
    setMotorcycles(initialMotorcycles);
    setCurrentPage(1);
  }, [initialMotorcycles]);

  const { toast } = useToast();
  const { user } = useAuth();
  
  const isLiaison = user?.role === 'Liaison';
  const isSupervisor = user?.role === 'Store Supervisor';
  const isCashier = user?.role === 'Cashier';


  const handleAction = (message: string) => {
    toast({
      title: 'Action Triggered',
      description: message,
    });
  };

  const statusVariant = (status: Motorcycle['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Ready to Register': return 'default';
      case 'Endorsed - Ready': return 'secondary';
      case 'Endorsed - Incomplete': return 'destructive';
      case 'Processing': return 'default';
      case 'For Review': return 'secondary';
      case 'Incomplete': return 'outline';
      default: return 'outline';
    }
  };

  const handleEditClick = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
  };

  const handleSaveEdit = async (updatedData: Partial<Motorcycle>) => {
    if (!editingMotorcycle) return;

    let updatedMotorcycle: Motorcycle = {
      ...editingMotorcycle,
      ...updatedData,
    };
    
    const requiredFields: (keyof Motorcycle)[] = [
        'csrNumber', 'crNumber', 'hpgControlNumber', 
        'cocNumber', 'policyNumber', 'insuranceType', 'insuranceEffectiveDate', 'insuranceExpirationDate', 'sarCode'
    ];
    const allFieldsFilled = requiredFields.every(field => !!updatedMotorcycle[field]);

    if (allFieldsFilled) {
        if (updatedMotorcycle.status === 'Incomplete') {
            updatedMotorcycle.status = 'Ready to Register';
            toast({
                title: 'Status Updated',
                description: `Motorcycle status automatically set to "Ready to Register".`,
            });
        } else if (updatedMotorcycle.status === 'Endorsed - Incomplete') {
            updatedMotorcycle.status = 'Endorsed - Ready';
            toast({
                title: 'Status Updated',
                description: `Motorcycle status automatically set to "Endorsed - Ready".`,
            });
        }
    }
    
    if (onStateChange) onStateChange(updatedMotorcycle);
    handleAction(`Motorcycle details updated.`);
    setEditingMotorcycle(null);
  };
  
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const sortedMotorcycles = React.useMemo(() => {
    return [...motorcycles].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [motorcycles, sortColumn, sortDirection]);
  

  const totalPages = Math.ceil(sortedMotorcycles.length / ITEMS_PER_PAGE);
  const paginatedMotorcycles = sortedMotorcycles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortableHeader = ({ column, children }: { column: SortableColumn, children: React.ReactNode }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer">
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && <ArrowUpDown className="h-4 w-4" />}
      </div>
    </TableHead>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Motorcycles</CardTitle>
            <CardDescription>
              {isLiaison 
                ? "Unregistered motorcycles assigned to you."
                : "Manage and monitor all motorcycle units."
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 {!isLiaison && (isSupervisor || isCashier) && <TableHead className="w-[40px]"></TableHead>}
                <SortableHeader column="salesInvoiceNo">SI No.</SortableHeader>
                <SortableHeader column="customerName">Customer Name</SortableHeader>
                <SortableHeader column="accountCode">Account Code</SortableHeader>
                <SortableHeader column="chassisNumber">Chassis No.</SortableHeader>
                <SortableHeader column="csrNumber">CSR No.</SortableHeader>
                <SortableHeader column="crNumber">CR No.</SortableHeader>
                <SortableHeader column="hpgControlNumber">HPG Control</SortableHeader>
                <SortableHeader column="status">Status</SortableHeader>
                <TableHead className="w-[100px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMotorcycles.map((motorcycle) => (
                  <TableRow key={motorcycle.id}>
                    {!isLiaison && (isSupervisor || isCashier) && <TableCell></TableCell>}
                    <TableCell>{motorcycle.salesInvoiceNo}</TableCell>
                    <TableCell className="font-medium">{motorcycle.customerName}</TableCell>
                    <TableCell>{motorcycle.accountCode}</TableCell>
                    <TableCell>{motorcycle.chassisNumber}</TableCell>
                    <TableCell>{motorcycle.csrNumber || 'N/A'}</TableCell>
                    <TableCell>{motorcycle.crNumber || 'N/A'}</TableCell>
                    <TableCell>{motorcycle.hpgControlNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(motorcycle.status)}>{motorcycle.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(motorcycle)}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Edit
                      </Button>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
           {motorcycles.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">No motorcycles to display.</div>
            )}
        </CardContent>
         <CardFooter>
            <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                    Showing {Math.min(paginatedMotorcycles.length, motorcycles.length)} of {motorcycles.length} motorcycles.
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
      
      {editingMotorcycle && (
        <MotorcycleDetailsDialog
            motorcycle={editingMotorcycle}
            isOpen={!!editingMotorcycle}
            onClose={() => setEditingMotorcycle(null)}
            onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
