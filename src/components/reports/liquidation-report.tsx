
import { CashAdvance, Motorcycle } from "@/types";
import { format } from "date-fns";
import React from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table";
import { Separator } from "../ui/separator";

type LiquidationReportProps = {
    reportData: {
        cashAdvance: CashAdvance;
        motorcycles: (Motorcycle & { liquidation: Partial<CashAdvance>})[];
    }
}

export const LiquidationReport = React.forwardRef<HTMLDivElement, LiquidationReportProps>(({ reportData }, ref) => {
    
    const { cashAdvance, motorcycles } = reportData;

    const totalCA = motorcycles.reduce((sum, mc) => sum + (mc.liquidation.amount || 0), 0);
    const totalLiquidation = motorcycles.reduce((sum, mc) => sum + (mc.liquidation.totalLiquidation || 0), 0);
    const totalShortageOverage = motorcycles.reduce((sum, mc) => sum + (mc.liquidation.shortageOverage || 0), 0);
    

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans text-xs">
            <header className="text-center mb-6">
                <h1 className="text-lg font-bold">STO NINO DE CEBU FINANCE CORPORATION</h1>
                <h2 className="text-md font-semibold">LTO Cash Advance and Liquidation Report</h2>
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
                    {motorcycles.map((mc, index) => (
                        <TableRow key={mc.id}>
                            <TableCell className="border p-1">{index + 1}</TableCell>
                            <TableCell className="border p-1">{mc.salesInvoiceNo}</TableCell>
                            <TableCell className="border p-1">{mc.customerName}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{(mc.liquidation.amount)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="border p-1">{mc.liquidation.ltoOrNumber}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{(mc.liquidation.ltoOrAmount)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{(mc.liquidation.ltoProcessFee)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{(mc.liquidation.totalLiquidation)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="border p-1 text-right font-mono">{(mc.liquidation.shortageOverage)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="border p-1">{mc.liquidation.liquidationRemarks || "FULL LIQUIDATION"}</TableCell>
                        </TableRow>
                    ))}
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
