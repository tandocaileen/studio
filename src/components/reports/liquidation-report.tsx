

import { CashAdvance, Motorcycle } from "@/types";
import { format } from "date-fns";
import React from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

type LiquidationReportProps = {
    reportData: {
        cashAdvance: CashAdvance;
        motorcycles: Motorcycle[];
    }
}

export const LiquidationReport = React.forwardRef<HTMLDivElement, LiquidationReportProps>(({ reportData }, ref) => {
    
    const { cashAdvance, motorcycles } = reportData;

    const getMcAdvanceAmount = (mc: Motorcycle): number => {
        if (!cashAdvance || !cashAdvance.motorcycleIds) return mc.processingFee! + mc.orFee!;
        return cashAdvance.amount / cashAdvance.motorcycleIds.length;
    };

    const totalCA = motorcycles.reduce((sum, mc) => sum + getMcAdvanceAmount(mc), 0);
    const totalLiquidation = motorcycles.reduce((sum, mc) => sum + (mc.liquidationDetails?.totalLiquidation || 0), 0);
    const totalShortageOverage = totalCA - totalLiquidation;

    const isFullyLiquidated = motorcycles.every(mc => !!mc.liquidationDetails);
    
    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans text-xs">
            <header className="text-center mb-6">
                <h1 className="text-lg font-bold">STO NINO DE CEBU FINANCE CORPORATION</h1>
                <h2 className="text-md font-semibold">LTO Cash Advance and {isFullyLiquidated ? 'Liquidation Report' : 'Initial Liquidation Report'}</h2>
            </header>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <p><strong>Liaison Home Base:</strong> {cashAdvance.personnelBranch || 'SAN FERNANDO'}</p>
                    <p><strong>Date:</strong> {format(new Date(), 'MMMM dd, yyyy')}</p>
                    <p><strong>Liquidation Code:</strong> {`SFO-${cashAdvance.id.slice(-6).toUpperCase()}`}</p>
                </div>
                 <div>
                    <p><strong>LTO CV #:</strong> {cashAdvance.checkVoucherNumber}</p>
                    <p><strong>CV Transaction Date:</strong> {format(new Date(cashAdvance.checkVoucherReleaseDate || cashAdvance.date), 'MM/dd/yyyy')}</p>
                    <p><strong>CA CODE:</strong> {`LTOSFO_Inst_${format(new Date(cashAdvance.date), 'MMddyy')}_${cashAdvance.id}`}</p>
                </div>
            </div>

            <Table className="text-xs">
                <TableHeader>
                    <TableRow>
                        <TableHead className="border h-auto p-1">Seq</TableHead>
                        <TableHead className="border h-auto p-1">SI No.</TableHead>
                        <TableHead className="border h-auto p-1">Customer's Name</TableHead>
                        <TableHead className="border h-auto p-1 text-right">Total CA</TableHead>
                        <TableHead className="border h-auto p-1">LTO OR No.</TableHead>
                        <TableHead className="border h-auto p-1 text-right">LTO OR Amt</TableHead>
                        <TableHead className="border h-auto p-1 text-right">LTO Process</TableHead>
                        <TableHead className="border h-auto p-1 text-right">Total Liq.</TableHead>
                        <TableHead className="border h-auto p-1 text-right">Shtg/Ovg</TableHead>
                        <TableHead className="border h-auto p-1">Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {motorcycles.map((mc, index) => {
                        const liq = mc.liquidationDetails;
                        const mcAdvance = getMcAdvanceAmount(mc);
                        const mcShortageOverage = mcAdvance - (liq?.totalLiquidation || 0);

                        return (
                        <TableRow 
                            key={mc.id}
                            className={cn(!liq && !isFullyLiquidated && "bg-red-100 text-red-900 font-bold")}
                        >
                            <TableCell className="border p-1">{index + 1}</TableCell>
                            <TableCell className="border p-1">{mc.salesInvoiceNo}</TableCell>
                            <TableCell className="border p-1">{mc.customerName}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{mcAdvance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="border p-1">{liq?.ltoOrNumber || ''}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{liq?.ltoOrAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || ''}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{liq?.ltoProcessFee?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || ''}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{liq?.totalLiquidation?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || ''}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{liq ? mcShortageOverage.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</TableCell>
                            <TableCell className="border p-1">{liq?.remarks || ''}</TableCell>
                        </TableRow>
                    )})}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold">
                        <TableCell colSpan={3} className="text-right border p-1">Total</TableCell>
                        <TableCell className="text-right font-mono border p-1">{totalCA.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell colSpan={3} className="text-right font-mono border p-1"></TableCell>
                        <TableCell className="text-right font-mono border p-1">{totalLiquidation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-mono border p-1">{totalShortageOverage.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="border p-1"></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            
            {!isFullyLiquidated && (
                <div className="mt-4">
                    <p className="text-red-600 font-semibold text-xs">* Rows highlighted in red are not yet liquidated.</p>
                </div>
            )}

             <div className="flex justify-between mt-8">
                <div className="w-1/3">
                    <p><strong>Total Expenses:</strong> <span className="font-mono">{totalLiquidation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                    <p><strong>Overage:</strong> <span className="font-mono">{Math.max(0, -totalShortageOverage).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                    <p><strong>Shortage:</strong> <span className="font-mono">{Math.max(0, totalShortageOverage).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                    <Separator className="my-2 bg-black h-[1px]" />
                    <p><strong>Total Amount CA:</strong> <span className="font-mono">{totalCA.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                </div>
            </div>

             <footer className="mt-16 grid grid-cols-3 gap-8 text-center text-xs">
                <div>
                    <p className="font-bold">{cashAdvance.personnel}</p>
                    <p className="border-t-2 border-black pt-2 mt-2">Prepared By (LTO Liaison)</p>
                </div>
                 <div>
                     <p className="font-bold pt-6">&nbsp;</p>
                    <p className="border-t-2 border-black pt-2 mt-2">Received by (HO Bookkeeper)</p>
                </div>
                <div>
                     <p className="font-bold pt-6">&nbsp;</p>
                    <p className="border-t-2 border-black pt-2 mt-2">Approved By (Accounting Supervisor)</p>
                </div>
            </footer>
        </div>
    );
});

LiquidationReport.displayName = 'LiquidationReport';


