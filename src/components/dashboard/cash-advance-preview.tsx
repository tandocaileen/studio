
import { Motorcycle } from "@/types";
import React from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table";
import { Separator } from "../ui/separator";


type CashAdvancePreviewProps = {
    motorcycles: Motorcycle[];
}

export const CashAdvancePreview = React.forwardRef<HTMLDivElement, CashAdvancePreviewProps>(({ motorcycles }, ref) => {
    
    const totalProcessingFee = motorcycles.reduce((sum, mc) => sum + (mc.processingFee || 0), 0);
    const totalOrFee = motorcycles.reduce((sum, mc) => sum + (mc.orFee || 0), 0);
    const grandTotal = totalProcessingFee + totalOrFee;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
            <header className="flex justify-between items-center pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold">Cash Advance Request Summary</h1>
                    <p className="text-sm text-gray-600">Please review the details before submitting.</p>
                </div>
                 <div className="text-right">
                    <p className="text-sm font-bold">Date: <span className="font-normal">{new Date().toLocaleDateString()}</span></p>
                </div>
            </header>

            <section className="mt-6">
                <p className="font-semibold mb-2">Motorcycles for Processing:</p>
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
                         <TableRow className="font-bold">
                            <TableCell colSpan={4} className="text-right">Total Processing Fee</TableCell>
                            <TableCell className="text-right font-mono">₱{totalProcessingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                         <TableRow className="font-bold">
                            <TableCell colSpan={4} className="text-right">Total OR Fee</TableCell>
                            <TableCell className="text-right font-mono">₱{totalOrFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
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

CashAdvancePreview.displayName = 'CashAdvancePreview';
