
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Motorcycle } from '@/types';
import { MotorcycleTable } from './motorcycle-table';


type EndorsedIncompleteTableProps = {
  motorcycles: Motorcycle[];
  onUpdate: (updatedMotorcycles: Motorcycle[]) => void;
};

export function EndorsedIncompleteTable({ motorcycles, onUpdate }: EndorsedIncompleteTableProps) {
  
  if (motorcycles.length === 0) {
    return (
        <Card className="border-dashed">
            <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                    <p>No endorsed units are pending details.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardHeader>
        <CardTitle>Action Required: Endorsed Units with Incomplete Details</CardTitle>
        <CardDescription>
          These units have been endorsed but require insurance and control details before a CA can be generated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MotorcycleTable motorcycles={motorcycles} onStateChange={onUpdate} />
      </CardContent>
    </Card>
  );
}
