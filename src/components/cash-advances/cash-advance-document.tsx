
import { CashAdvance } from "@/types";
import { format } from "date-fns";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Separator } from "../ui/separator";

type CashAdvanceDocumentProps = {
    advance: CashAdvance;
}

export const CashAdvanceDocument = React.forwardRef<HTMLDivElement, CashAdvanceDocumentProps>(({ advance }, ref) => {
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
                           <span className="font-bold">Position:</span> Liaison Supervisor
                        </p>
                    </div>
                    <div className="text-right">
                         <p className="text-sm">
                            <span className="font-bold">Date:</span> {format(new Date(advance.date), 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                 <p className="font-bold mb-2">Particulars:</p>
                 <div className="border-collapse w-full">
                    <div className="flex font-bold border-b border-black">
                        <div className="p-2 w-full">Purpose / Description</div>
                        <div className="p-2 w-48 text-right">Amount</div>
                    </div>
                     <div className="flex border-b border-gray-300">
                        <div className="p-2 w-full">{advance.purpose}</div>
                        <div className="p-2 w-48 text-right font-mono">₱{advance.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex font-bold">
                        <div className="p-2 w-full text-right">TOTAL</div>
                        <div className="p-2 w-48 text-right font-mono border-t-2 border-black">₱{advance.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                 </div>
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

CashAdvanceDocument.displayName = 'CashAdvanceDocument';
