export type Document = {
  type: 'OR/CR' | 'COC' | 'Insurance';
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
};

export type Motorcycle = {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  engineNumber: string;
  chassisNumber: string;
  assignedBranch: string;
  purchaseDate: Date;
  supplier: string;
  documents: Document[];
  status: 'Incomplete' | 'Ready to Register' | 'Registered' | 'For Renewal';
};

export type CashAdvance = {
  id: string;
  personnel: string;
  purpose: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved' | 'Liquidated' | 'Rejected';
  receipts?: string[];
};
