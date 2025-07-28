
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiaisonUser } from '@/types';
import { getBranches, getLiaisons } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { AppLoader } from '../layout/loader';

export function LiaisonTable() {
  const [liaisons, setLiaisons] = React.useState<LiaisonUser[] | null>(null);
  const [branches, setBranches] = React.useState<string[]>([]);
  const { toast } = useToast();

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
              {liaisons.map((liaison) => (
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
      </Card>
    </>
  );
}
