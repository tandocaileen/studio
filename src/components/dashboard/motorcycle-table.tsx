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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Motorcycle } from '@/types';
import { MoreHorizontal, PlusCircle, FileText, Truck, Wrench } from 'lucide-react';
import { getBranches } from '@/lib/data';
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
import { format } from 'date-fns';

type MotorcycleTableProps = {
  motorcycles: Motorcycle[];
};

export function MotorcycleTable({ motorcycles: initialMotorcycles }: MotorcycleTableProps) {
  const [motorcycles, setMotorcycles] = React.useState(initialMotorcycles);
  
  const statusVariant = (status: Motorcycle['status']): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Registered':
        return 'secondary';
      case 'For Renewal':
        return 'destructive';
      case 'Unregistered':
        return 'default';
      default:
        return 'default';
    }
  };

  const branches = getBranches();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Motorcycles</CardTitle>
          <CardDescription>
            Manage and monitor all motorcycle units.
          </CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Motorcycle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Motorcycle</DialogTitle>
              <DialogDescription>
                Fill in the details for the new unit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plate" className="text-right">Plate No.</Label>
                <Input id="plate" placeholder="ABC 1234" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="make" className="text-right">Make</Label>
                <Input id="make" placeholder="e.g., Honda" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">Model</Label>
                <Input id="model" placeholder="e.g., Click 125i" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">Branch</Label>
                 <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Motorcycle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate No.</TableHead>
              <TableHead>Make & Model</TableHead>
              <TableHead>Assigned Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Insurance Expiry</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {motorcycles.map((motorcycle) => {
              const insurance = motorcycle.documents.find(d => d.type === 'Insurance');
              return (
                <TableRow key={motorcycle.id}>
                  <TableCell className="font-medium">{motorcycle.plateNumber}</TableCell>
                  <TableCell>{motorcycle.make} {motorcycle.model}</TableCell>
                  <TableCell>{motorcycle.assignedBranch}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(motorcycle.status)}>{motorcycle.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {insurance?.expiresAt ? format(insurance.expiresAt, 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
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
                          <Truck className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Manage Documents</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className="mr-2 h-4 w-4" />
                          <span>Log Maintenance</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
