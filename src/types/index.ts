
export type DocumentType = 'OR/CR' | 'COC' | 'Insurance' | 'CSR' | 'HPG Control Form';

export type Document = {
  type: DocumentType;
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
  // New fields for Store Supervisor
  customerName?: string;
  cocNumber?: string;
  policyNumber?: string;
  insuranceType?: string;
  hpgControlNumber?: string;
  sarCode?: string;
  processingFee?: number;
  orFee?: number;
  assignedLiaison?: string;
};

export type CashAdvance = {
  id: string;
  personnel: string; // This will be the Liaison's name
  purpose: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved' | 'Liquidated' | 'Rejected' | 'Check Voucher Released' | 'Encashed';
  receipts?: string[];
  // New fields for Cashier & Liaison
  motorcycleId?: string;
  checkVoucherNumber?: string;
  checkVoucherReleaseDate?: Date;
  ltoOrNumber?: string;
  ltoOrAmount?: number;
  ltoProcessFee?: number;
  totalLiquidation?: number;
  shortageOverage?: number;
  liquidationRemarks?: string;
};
