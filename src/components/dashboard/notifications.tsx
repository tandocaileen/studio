'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { generatePersonalizedNotifications, type GeneratePersonalizedNotificationsInput } from "@/ai/flows/generate-notification";
import { getMotorcycles, getCashAdvances } from "@/lib/data";
import type { Notification } from '@/types';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';

export function Notifications() {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setNotifications([]);

        try {
            const motorcycles = await getMotorcycles();
            const cashAdvances = await getCashAdvances();

            const input: GeneratePersonalizedNotificationsInput = {
                documentExpirations: motorcycles.flatMap(m => m.documents
                    .filter(d => d.expiresAt)
                    .map(d => ({
                        documentType: d.type,
                        motorcycleIdentifier: m.plateNumber,
                        expirationDate: format(d.expiresAt!, 'yyyy-MM-dd'),
                        assignedBranch: m.assignedBranch,
                    }))
                ),
                unliquidatedCashAdvances: cashAdvances
                    .filter(ca => ca.status === 'Pending' || ca.status === 'Approved')
                    .map(ca => ({
                        personnel: ca.personnel,
                        amount: ca.amount,
                        purpose: ca.purpose,
                        date: format(ca.date, 'yyyy-MM-dd'),
                    }))
            };

            const result = await generatePersonalizedNotifications(input);
            setNotifications(result.notifications);
        } catch (error) {
            console.error("Failed to generate notifications:", error);
            // Here you could use the toast to show an error message
        } finally {
            setIsLoading(false);
        }
    };
    
    const getUrgencyVariant = (urgency: Notification['urgency']): 'destructive' | 'secondary' | 'default' => {
        switch (urgency) {
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'default';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>AI-generated reminders and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!isLoading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
                        <Bell className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click the button below to generate notifications.</p>
                    </div>
                )}
                {!isLoading && notifications.length > 0 && (
                     <div className=" flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                        {notifications.map((notification, index) => (
                           <div key={index} className="flex flex-col gap-2">
                             <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Badge variant={getUrgencyVariant(notification.urgency)} className="capitalize text-xs">{notification.urgency}</Badge>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{notification.message}</p>
                                    {notification.recipient && <p className="text-xs text-muted-foreground">Recipient: {notification.recipient}</p>}
                                </div>
                             </div>
                             {index < notifications.length - 1 && <Separator className="mt-2"/>}
                           </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
                    {isLoading ? "Generating..." : "Generate Reminders"}
                </Button>
            </CardFooter>
        </Card>
    );
}
