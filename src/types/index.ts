

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
  status: 'Incomplete' | 'Ready to Register' | 'Endorsed - Incomplete' | 'Endorsed - Ready' | 'Processing' | 'For Review';
  customerName?: string;
  cocNumber?: string;
  policyNumber?: string;
  insuranceType?: string;
  insuranceEffectiveDate?: Date;
  insuranceExpirationDate?: Date;
  hpgControlNumber?: string;
  sarCode?: string;
  processingFee?: number;
  orFee?: number;
  assignedLiaison?: string;
  salesInvoiceNo?: string;
  accountCode?: string;
  endorsementCode?: string;
  csrNumber?: string;
  crNumber?: string;
  liquidationDetails?: {
    ltoOrNumber: string;
    ltoOrAmount: number;
    ltoProcessFee: number;
    totalLiquidation: number;
    shortageOverage: number;
    remarks: string;
    liquidatedBy: string;
    liquidationDate: Date;
    parentCaId: string;
  };
};

export type CashAdvance = {
  id: string;
  personnel: string; 
  personnelBranch?: string;
  purpose: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved' | 'Liquidated' | 'Rejected' | 'Check Voucher Released' | 'CV Received';
  receipts?: string[];
  motorcycleId?: string;
  motorcycleIds?: string[];
  checkVoucherNumber?: string;
  checkVoucherReleaseDate?: Date;
  ltoOrNumber?: string;
  ltoOrAmount?: number;
  ltoProcessFee?: number;
  totalLiquidation?: number;
  shortageOverage?: number;
  liquidationRemarks?: string;
};

export type LiaisonUser = {
    id: string;
    name: string;
    assignedBranch: string;
    processingFee: number;
    orFee: number;
}

export type Endorsement = {
    id: string;
    transactionDate: Date;
    liaisonId: string;
    liaisonName: string;
    remarks?: string;
    motorcycleIds: string[];
}
