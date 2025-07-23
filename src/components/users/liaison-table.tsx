
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
              Manage liaison personnel, their assigned branches, and fees.
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Liaison
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Liaison</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new liaison.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="e.g., John Doe" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="branch">Branch Assigned</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="processing-fee">Processing Fee</Label>
                        <Input id="processing-fee" type="number" placeholder="e.g., 1500" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="or-fee">OR Fee</Label>
                        <Input id="or-fee" type="number" placeholder="e.g., 1000" />
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => (document.querySelector('[aria-label="Close"]') as HTMLElement)?.click()}>Cancel</Button>
                    <Button type="submit" onClick={() => handleAction('New liaison added.')}>Save Liaison</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead className="text-right">Processing Fee</TableHead>
                <TableHead className="text-right">OR Fee</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liaisons.map((liaison) => (
                <TableRow key={liaison.id}>
                  <TableCell className="font-medium">{liaison.name}</TableCell>
                  <TableCell>{liaison.assignedBranch}</TableCell>
                  <TableCell className="text-right">₱{liaison.processingFee.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₱{liaison.orFee.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
