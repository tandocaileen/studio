
'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Send } from 'lucide-react';
import { ProtectedPage } from '@/components/auth/protected-page';

const faqs = [
    {
        question: "How do I add a new motorcycle?",
        answer: "Navigate to the Dashboard, click the 'Add Motorcycle' button. A dialog will appear where you can fill in the motorcycle's details and upload necessary documents like OR/CR and Insurance."
    },
    {
        question: "How can I generate a Cash Advance for document renewal?",
        answer: "On the Dashboard, select the motorcycles that are 'For Renewal' by checking the box next to them. Once selected, the 'Generate CA' button will become active. Click it to have the AI generate the necessary cash advance requests."
    },
    {
        question: "Where can I see the status of my cash advance requests?",
        answer: "Go to the 'Cash Advances' page from the sidebar. You will see a table with all requests and their current status (Pending, Approved, Liquidated, or Rejected)."
    },
    {
        question: "How do I liquidate an approved cash advance?",
        answer: "Visit the 'Liquidations' page. Find the approved advance in the table and click the 'Liquidate' button. You will be prompted to upload receipts and provide details for the liquidation."
    },
];


export default function SupportPage() {
    const { toast } = useToast();

    const handleSendMessage = () => {
        toast({
            title: "Message Sent!",
            description: "Your message has been sent to the support team. We will get back to you shortly.",
        });
    }

    return (
        <ProtectedPage allowedRoles={['Store Supervisor', 'Liaison', 'Cashier']}>
            <div className='w-full'>
                <Header title="Support" />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <div className="grid gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Frequently Asked Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                                            <AccordionContent>
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Support</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center text-center gap-4">
                                     <LifeBuoy className="w-16 h-16 text-primary" />
                                    <p className="text-muted-foreground">
                                        Can't find the answer you're looking for? <br />
                                        Our support team is here to help.
                                    </p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Send className="mr-2 h-4 w-4" />
                                                Escalate to Personnel
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                             <DialogHeader>
                                                <DialogTitle>Contact Support</DialogTitle>
                                                <DialogDescription>
                                                    Please describe your issue below. A support team member will respond to you via email.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="email" className="text-right">
                                                        Email
                                                    </Label>
                                                    <Input id="email" type="email" placeholder="your.email@example.com" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="subject" className="text-right">
                                                        Subject
                                                    </Label>
                                                    <Input id="subject" placeholder="e.g., Issue with CA generation" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="message" className="text-right">
                                                        Message
                                                    </Label>
                                                    <Textarea id="message" placeholder="Describe your issue in detail..." className="col-span-3" />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" onClick={handleSendMessage}>Send Message</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedPage>
    );
}
