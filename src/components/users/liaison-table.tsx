
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
import { LiaisonUser } from '@/types';
import { getBranches, getLiaisons } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { AppLoader } from '../layout/loader';
import { Button } from '../ui/button';

const ITEMS_PER_PAGE = 5;

export function LiaisonTable() {
  const [liaisons, setLiaisons] = React.useState<LiaisonUser[] | null>(null);
  const [branches, setBranches] = React.useState<string[]>([]);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
      getLiaisons().then(setLiaisons);
      setBranches(getBranches());
  }, []);

  const handleAction = (message: string) => {
    toast({
      title: 'Action Triggered',
      description: message,
    });
  };
  
  if (!liaisons) {
      return <AppLoader />
  }

  const totalPages = Math.ceil(liaisons.length / ITEMS_PER_PAGE);
  const paginatedLiaisons = liaisons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liaisons</CardTitle>
            <CardDescription>
              View liaison personnel and their assigned branches.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead className="text-right">Default Processing Fee</TableHead>
                <TableHead className="text-right">Default OR Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLiaisons.map((liaison) => (
                <TableRow key={liaison.id}>
                  <TableCell className="font-medium">{liaison.name}</TableCell>
                  <TableCell>{liaison.assignedBranch}</TableCell>
                  <TableCell className="text-right">₱{liaison.processingFee.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₱{liaison.orFee.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
            <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                    Showing {paginatedLiaisons.length} of {liaisons.length} liaisons.
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
    </>
  );
}

