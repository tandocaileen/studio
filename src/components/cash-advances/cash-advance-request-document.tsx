
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
    
    const totalProcessingFee = motorcycles.reduce((sum, mc) => sum + (mc.processingFee || 0), 0);
    const totalOrFee = motorcycles.reduce((sum, mc) => sum + (mc.orFee || 0), 0);
    const grandTotal = totalProcessingFee + totalOrFee;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
             <header className="flex justify-between items-center pb-4 border-b-2 border-black">
                <div>
                    <h1 className="text-3xl font-bold">CASH ADVANCE</h1>
                    <p className="text-sm">Control No: <span className="font-mono">{advance.id}</span></p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold">LTO Portal Inc.</h2>
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
                    </div>
                </div>
            </section>

             <section className="mt-6">
                <p className="font-semibold mb-2">Purpose: <span className="font-normal">{advance.purpose}</span></p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Make & Model</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Processing Fee</TableHead>
                            <TableHead className="text-right">OR Fee</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {motorcycles.map(mc => (
                            <TableRow key={mc.id}>
                                <TableCell>{mc.make} {mc.model}</TableCell>
                                <TableCell>{mc.customerName}</TableCell>
                                <TableCell className="text-right font-mono">₱{(mc.processingFee || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono">₱{(mc.orFee || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono">₱{((mc.orFee || 0) + (mc.processingFee || 0)).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold text-lg bg-gray-100">
                            <TableCell colSpan={4} className="text-right">Grand Total Cash Advance</TableCell>
                            <TableCell className="text-right font-mono">₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </section>
            
            <section className="mt-8">
                <p className="text-sm leading-relaxed">
                    Received from LTO Portal Inc. the sum of <span className="font-bold">________________</span> PESOS (₱{advance.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}) as Cash Advance for the purpose stated above. I agree to liquidate this amount within five (5) working days from the completion of the task.
                </p>
            </section>
            
            <footer className="mt-16 grid grid-cols-3 gap-8 text-center text-xs">
                <div>
                    <p className="border-t-2 border-black pt-2 mt-8">Prepared by:</p>
                    <p className="font-bold mt-2">Accounting Department</p>
                </div>
                 <div>
                    <p className="border-t-2 border-black pt-2 mt-8">Noted by:</p>
                    <p className="font-bold mt-2">Finance Manager</p>
                </div>
                <div>
                    <p className="border-t-2 border-black pt-2 mt-8">Received by:</p>
                    <p className="font-bold mt-2">{advance.personnel}</p>
                </div>
            </footer>
        </div>
    );
});

CashAdvanceRequestDocument.displayName = 'CashAdvanceRequestDocument';
