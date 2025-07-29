
import { CashAdvance, Motorcycle } from "@/types";
import { format } from "date-fns";
import React from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table";
import { Separator } from "../ui/separator";

type CashAdvanceRequestDocumentProps = {
    advance: CashAdvance;
    motorcycles: Motorcycle[];
}

export const CashAdvanceRequestDocument = React.forwardRef<HTMLDivElement, CashAdvanceRequestDocumentProps>(({ advance, motorcycles }, ref) => {
    
    const getFeePerMc = (feeType: 'processing' | 'or'): number => {
        if (!motorcycles || motorcycles.length === 0) return 0;

        const totalFeeFromMC = motorcycles.reduce((sum, mc) => {
            if (feeType === 'processing') return sum + (mc.processingFee || 0);
            return sum + (mc.orFee || 0);
        }, 0);

        if (totalFeeFromMC > 0) {
            return totalFeeFromMC / motorcycles.length;
        }

        // Fallback for older CAs that only have a total amount
        const totalCAAmount = advance.amount;
        // This is a rough estimation assuming fees are consistent, which they are in this app's logic
        const processingFeeFromCA = 300; // A common value, could be more dynamic
        const orFeeFromCA = (totalCAAmount / motorcycles.length) - processingFeeFromCA;

        if (feeType === 'processing') return processingFeeFromCA;
        return orFeeFromCA > 0 ? orFeeFromCA : 0;
    }
    
    const processingFee = getFeePerMc('processing');
    const orFee = getFeePerMc('or');
    const grandTotal = advance.amount;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
             <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                <div>
                    <h1 className="text-3xl font-bold">CASH ADVANCE</h1>
                    <p className="text-sm">Control No: <span className="font-mono">{advance.id}</span></p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">LTO Portal Inc.</h2>
                    <p className="text-xs">123 Business Rd, Finance City, PH</p>
                </div>
            </header>

            <section className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm">
                            <span className="font-bold">Payee:</span> {advance.personnel}
                        </p>
                        <p className="text-sm">
                           <span className="font-bold">Position:</span> Liaison
                        </p>
                    </div>
                    <div className="text-right">
                         <p className="text-sm">
                            <span className="font-bold">Date:</span> {format(new Date(advance.date), 'MMMM dd, yyyy')}
                        </p>
                         {advance.checkVoucherNumber && (
                            <p className="text-sm">
                                <span className="font-bold">CV Number:</span> {advance.checkVoucherNumber}
                            </p>
                        )}
                    </div>
                </div>
                 <p className="text-sm mt-4">
                    <span className="font-bold">Purpose:</span> {advance.purpose}
                </p>
            </section>

             <section className="mt-6">
                <Table className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-black font-bold">Make & Model</TableHead>
                            <TableHead className="text-black font-bold">Customer</TableHead>
                            <TableHead className="text-right text-black font-bold">Processing Fee</TableHead>
                            <TableHead className="text-right text-black font-bold">OR Fee</TableHead>
                            <TableHead className="text-right text-black font-bold">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {motorcycles.map(mc => {
                            const subtotal = processingFee + orFee;
                            return (
                                <TableRow key={mc.id}>
                                    <TableCell>{mc.make} {mc.model}</TableCell>
                                    <TableCell>{mc.customerName}</TableCell>
                                    <TableCell className="text-right font-mono">₱{processingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right font-mono">₱{orFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right font-mono">₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold text-lg bg-gray-100">
                            <TableCell colSpan={4} className="text-right">Grand Total Cash Advance</TableCell>
                            <TableCell className="text-right font-mono">₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </section>
        </div>
    );
});

CashAdvanceRequestDocument.displayName = 'CashAdvanceRequestDocument';
