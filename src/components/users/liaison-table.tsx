
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiaisonUser } from '@/types';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getBranches, getLiaisons } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
              View liaison personnel, their assigned branches, and fees.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead className="text-right">Processing Fee</TableHead>
                <TableHead className="text-right">OR Fee</TableHead>
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
