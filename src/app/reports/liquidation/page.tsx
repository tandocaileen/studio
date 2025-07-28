
'use client';

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { ProtectedPage } from "@/components/auth/protected-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCashAdvances } from "@/lib/data";
import { CashAdvance } from "@/types";
import { AppLoader } from "@/components/layout/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import React from "react";

function LiquidationReportsContent() {
    const [reports, setReports] = React.useState<CashAdvance[] | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        getCashAdvances().then(allCAs => {
            // Assuming a report is generated for any CA that is fully liquidated
            const liquidatedCAs = allCAs.filter(ca => ca.status === 'Liquidated');
            setReports(liquidatedCAs);
        });
    }, []);

    if (!reports) {
        return <AppLoader />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Liquidation Reports</CardTitle>
                <CardDescription>
                    Browse all generated liquidation reports.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>CA Number</TableHead>
                            <TableHead>Liaison</TableHead>
                            <TableHead>Date Liquidated</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map(report => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.id}</TableCell>
                                <TableCell>{report.personnel}</TableCell>
                                <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">₱{report.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/reports/liquidation/${report.id}`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {reports.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No liquidated reports found.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function LiquidationReportsPage() {
    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col pt-14 sm:gap-4 sm:py-4 sm:pl-14">
                    <Header title="Liquidation Reports" />
                    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       <LiquidationReportsContent />
                    </main>
                </div>
            </div>
        </ProtectedPage>
    );
}
