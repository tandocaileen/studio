

import type { Motorcycle, CashAdvance, LiaisonUser, Endorsement } from '@/types';

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const motorcycles: Motorcycle[] = [
  {
    id: '1',
    make: 'Honda',
    model: 'Click 125i',
    year: 2023,
    color: 'Matte Black',
    plateNumber: '123 ABC',
    engineNumber: 'E12345678',
    chassisNumber: 'C12345678',
    assignedBranch: 'CEBU',
    purchaseDate: new Date('2023-01-15'),
    supplier: 'Honda Prestige',
    status: 'For Review',
    documents: [
      { type: 'OR/CR', url: '#/doc/orcr123', uploadedAt: new Date('2023-01-20'), expiresAt: addDays(today, 300) },
      { type: 'COC', url: '#', uploadedAt: new Date('2023-01-20') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2023-01-20'), expiresAt: addDays(today, 25) },
    ],
    customerName: 'Juan Dela Cruz',
    assignedLiaison: 'BRYLE NIKKO HAMILI',
    processingFee: 300.00,
    orFee: 1826.43,
    salesInvoiceNo: 'SI-00123',
    accountCode: 'AC-JDC-001',
    hpgControlNumber: 'HPG-CTRL-001',
    cocNumber: 'COC-123',
    policyNumber: 'POL-123',
    sarCode: 'SAR-123',
    insuranceType: 'TPL',
    liquidationDetails: {
      parentCaId: 'ca-070124-002',
      ltoOrNumber: 'LTO-OR-123',
      ltoOrAmount: 1800,
      ltoProcessFee: 300,
      totalLiquidation: 2100,
      shortageOverage: 26.43,
      remarks: 'Full Liquidation',
      liquidatedBy: 'BRYLE NIKKO HAMILI',
      liquidationDate: addDays(today, -25)
    }
  },
  {
    id: '2',
    make: 'Yamaha',
    model: 'NMAX',
    year: 2022,
    color: 'Blue',
    plateNumber: '456 DEF',
    engineNumber: 'E87654321',
    chassisNumber: 'C87654321',
    assignedBranch: 'SAN FERNANDO',
    purchaseDate: new Date('2022-05-20'),
    supplier: 'Yamaha Motors',
    status: 'Ready to Register',
    documents: [
      { type: 'OR/CR', url: '#/doc/orcr456', uploadedAt: new Date('2022-05-25'), expiresAt: addDays(today, -10) },
      { type: 'COC', url: '#', uploadedAt: new Date('2022-05-25') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2022-05-25'), expiresAt: addDays(today, 5) },
    ],
    customerName: 'Maria Clara',
    assignedLiaison: 'RODEL PASTRANO',
    processingFee: 300.00,
    orFee: 1885.18,
    salesInvoiceNo: 'SI-00124',
    accountCode: 'AC-MCL-001',
    hpgControlNumber: 'HPG-CTRL-002',
    cocNumber: 'COC-456',
    policyNumber: 'POL-456',
    sarCode: 'SAR-456',
    insuranceType: 'TPL',
  },
  {
    id: '3',
    make: 'Suzuki',
    model: 'Burgman Street',
    year: 2023,
    color: 'White',
    plateNumber: '789 GHI',
    engineNumber: 'E11223344',
    chassisNumber: 'C11223344',
    assignedBranch: 'ILOILO',
    purchaseDate: new Date('2023-03-10'),
    supplier: 'Suzuki Philippines',
    status: 'For Review',
    documents: [
      { type: 'OR/CR', url: '#/doc/orcr789', uploadedAt: new Date('2023-03-15'), expiresAt: addDays(today, 400) },
      { type: 'COC', url: '#', uploadedAt: new Date('2023-03-15') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2023-03-15'), expiresAt: addDays(today, 150) },
    ],
    customerName: 'Jose Rizal',
    assignedLiaison: 'BENJO SEQUIERO',
    processingFee: 150.00,
    orFee: 1826.43,
    salesInvoiceNo: 'SI-00125',
    accountCode: 'AC-JRZ-001',
    hpgControlNumber: 'HPG-CTRL-003',
    cocNumber: 'COC-789',
    policyNumber: 'POL-789',
    sarCode: 'SAR-789',
    insuranceType: 'TPL',
     liquidationDetails: {
      parentCaId: 'ca-070124-002',
      ltoOrNumber: 'LTO-OR-456',
      ltoOrAmount: 1800,
      ltoProcessFee: 150,
      totalLiquidation: 1950,
      shortageOverage: 26.43,
      remarks: 'Full Liquidation',
      liquidatedBy: 'BENJO SEQUIERO',
      liquidationDate: addDays(today, -25)
    }
  },
  {
    id: '4',
    make: 'Kawasaki',
    model: 'Rouser NS200',
    year: 2021,
    color: 'Red',
    plateNumber: '101 JKL',
    engineNumber: 'E55667788',
    chassisNumber: 'C55667788',
    assignedBranch: 'Main Office',
    purchaseDate: new Date('2021-11-01'),
    supplier: 'Wheeltek',
    status: 'Incomplete',
    documents: [],
    customerName: 'Andres Bonifacio',
    assignedLiaison: 'Demo Liaison',
    processingFee: 1500,
    orFee: 1000,
    salesInvoiceNo: 'SI-00126',
    accountCode: 'AC-ABF-001',
  },
  {
    id: '5',
    make: 'Honda',
    model: 'PCX160',
    year: 2023,
    color: 'Pearl White',
    plateNumber: '212 MNO',
    engineNumber: 'E99887766',
    chassisNumber: 'C99887766',
    assignedBranch: 'South Branch',
    purchaseDate: new Date('2023-08-01'),
    supplier: 'Honda Prestige',
    status: 'Ready to Register',
    documents: [
        { type: 'COC', url: '#', uploadedAt: new Date('2023-08-05') },
        { type: 'Insurance', url: '#', uploadedAt: new Date('2023-08-05'), expiresAt: addDays(today, 360) },
    ],
    customerName: 'Gabriela Silang',
    processingFee: 1550,
    orFee: 1050,
    salesInvoiceNo: 'SI-00127',
    accountCode: 'AC-GSL-001',
    hpgControlNumber: 'HPG-CTRL-005',
    cocNumber: 'COC-PCX',
    policyNumber: 'POL-PCX',
    sarCode: 'SAR-PCX',
    insuranceType: 'TPL',
  },
   {
    id: '6',
    make: 'Yamaha',
    model: 'Mio Aerox',
    year: 2024,
    color: 'Matte Grey',
    plateNumber: '345 PQR',
    engineNumber: 'E65432198',
    chassisNumber: 'C65432198',
    assignedBranch: 'Main Office',
    purchaseDate: new Date('2024-05-10'),
    supplier: 'Yamaha Motors',
    status: 'Endorsed',
    documents: [
      { type: 'COC', url: '#', uploadedAt: new Date('2024-05-15') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2024-05-15'), expiresAt: addDays(today, 365) },
      { type: 'CSR', url: '#/doc/csr654', uploadedAt: new Date('2024-05-15') },
    ],
    customerName: 'Apolinario Mabini',
    assignedLiaison: 'Demo Liaison',
    processingFee: 1500,
    orFee: 1000,
    salesInvoiceNo: 'SI-00128',
    accountCode: 'AC-APM-001',
    hpgControlNumber: 'HPG-CTRL-006',
    cocNumber: 'COC-AEROX',
    policyNumber: 'POL-AEROX',
    sarCode: 'SAR-AEROX',
    insuranceType: 'TPL',
  },
  {
    id: '7',
    make: 'Honda',
    model: 'ADV 160',
    year: 2024,
    color: 'Red',
    plateNumber: '678 STU',
    engineNumber: 'E78901234',
    chassisNumber: 'C78901234',
    assignedBranch: 'East Branch',
    purchaseDate: new Date('2024-06-01'),
    supplier: 'Honda Prestige',
    status: 'Processing',
    documents: [],
    customerName: 'Emilio Aguinaldo',
    assignedLiaison: 'Demo Liaison',
    processingFee: 1500,
    orFee: 1000,
    salesInvoiceNo: 'SI-00129',
    accountCode: 'AC-EAG-001',
    hpgControlNumber: 'HPG-CTRL-007',
    cocNumber: 'COC-ADV',
    policyNumber: 'POL-ADV',
    sarCode: 'SAR-ADV',
    insuranceType: 'TPL',
  }
];

const cashAdvances: CashAdvance[] = [
  {
    id: 'ca-070124-001',
    personnel: 'RODEL PASTRANO',
    purpose: 'Renewal for 1 unit',
    amount: 2185.18,
    date: addDays(today, -40),
    status: 'Pending',
    motorcycleIds: ['2']
  },
  {
    id: 'ca-070124-002',
    personnel: 'BRYLE NIKKO HAMILI',
    purpose: 'Registration for 2 units',
    amount: 4102.86,
    date: addDays(today, -30),
    status: 'Liquidated',
    motorcycleIds: ['1', '3'],
    totalLiquidation: 4050,
    checkVoucherNumber: 'CV-2024-06-010',
    checkVoucherReleaseDate: addDays(today, -28),
  },
  {
    id: 'ca-070124-003',
    personnel: 'Demo Liaison',
    purpose: 'New registration for 1 unit',
    amount: 2600,
    date: addDays(today, -20),
    status: 'Approved',
    motorcycleIds: ['5']
  },
  {
    id: 'ca-070124-004',
    personnel: 'Demo Liaison',
    purpose: 'Registration for 2 units',
    amount: 5000,
    date: addDays(today, -5),
    status: 'Check Voucher Released',
    checkVoucherNumber: 'CV-2024-07-001',
    checkVoucherReleaseDate: addDays(today, -5),
    motorcycleIds: ['6', '7']
  },
  {
    id: 'ca-070124-005',
    personnel: 'RODEL PASTRANO',
    purpose: 'Renewal for 1 unit',
    amount: 2185.18,
    date: addDays(today, -2),
    status: 'CV Received',
    checkVoucherNumber: 'CV-2024-07-002',
    checkVoucherReleaseDate: addDays(today, -2),
    motorcycleIds: ['2']
  },
];

const liaisonUsers: LiaisonUser[] = [
    { id: '1', name: 'JINKY JOY AGBALOG', assignedBranch: 'LA UNION', processingFee: 300.00, orFee: 2115.18-300 },
    { id: '2', name: 'BABY LIEZELL CAUILAN', assignedBranch: 'ILAGAN', processingFee: 250.00, orFee: 2310.18-250 },
    { id: '3', name: 'RODEL PASTRANO', assignedBranch: 'SAN FERNANDO', processingFee: 300.00, orFee: 1885.18-300 },
    { id: '4', name: 'JUNIEFE AQUINO', assignedBranch: 'CALAMBA', processingFee: 200.00, orFee: 2359.43-200 },
    { id: '5', name: 'LYNLYN GENEZA', assignedBranch: 'CALAPAN', processingFee: 250.00, orFee: 2351.43-250 },
    { id: '6', name: 'RUSHEL MORGA', assignedBranch: 'LEGAZPI', processingFee: 250.00, orFee: 2160.18-250 },
    { id: '7', name: 'BENJO SEQUIERO', assignedBranch: 'ILOILO', processingFee: 150.00, orFee: 1826.43-150 },
    { id: '8', name: 'BRYLE NIKKO HAMILI', assignedBranch: 'CEBU', processingFee: 300.00, orFee: 1826.43-300 },
    { id: '9', name: 'ALLAN ANTONI', assignedBranch: 'TACLOBAN', processingFee: 100.00, orFee: 1655.18-100 },
    { id: '10', name: 'RODERICK GUTIERREZ', assignedBranch: 'ZAMBOANGA', processingFee: 250.00, orFee: 1742.68-250 },
    { id: '11', name: 'JASSRAY PAMISA', assignedBranch: 'CDO', processingFee: 100.00, orFee: 1846.43-100 },
    { id: '12', name: 'ALI VIN SALEH COLINA', assignedBranch: 'DAVAO', processingFee: 244.82, orFee: 1836.43-244.82 },
    { id: '13', name: 'EMILY AMADEO', assignedBranch: 'MARBEL', processingFee: 130.00, orFee: 1896.43-130 },
    { id: '14', name: 'GEORGETH YEE', assignedBranch: 'BUENAVISTA', processingFee: 150.00, orFee: 1846.43-150 },
    { id: '15', name: 'Demo Liaison', assignedBranch: 'Main Office', processingFee: 1500, orFee: 1000 },
];

const endorsements: Endorsement[] = [
    { id: 'ENDO-20240720-001', transactionDate: addDays(today, -10), liaisonId: '15', liaisonName: 'Demo Liaison', motorcycleIds: ['4'], remarks: 'Please prioritize processing for this unit.'},
    { id: 'ENDO-20240722-001', transactionDate: addDays(today, -8), liaisonId: '8', liaisonName: 'BRYLE NIKKO HAMILI', motorcycleIds: ['1', '3']},
    { id: 'ENDO-20240725-001', transactionDate: addDays(today, -5), liaisonId: '15', liaisonName: 'Demo Liaison', motorcycleIds: ['6', '7'], remarks: 'For registration.'},
]

export async function getMotorcycles() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(motorcycles)).map((m: any) => ({...m, purchaseDate: new Date(m.purchaseDate), documents: m.documents.map((d:any) => ({...d, uploadedAt: new Date(d.uploadedAt), expiresAt: d.expiresAt ? new Date(d.expiresAt) : undefined}))}));
}

export async function getCashAdvances() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(cashAdvances)).map((c: any) => ({...c, date: new Date(c.date)}));
}

export function getBranches() {
  return [...new Set(liaisonUsers.map(l => l.assignedBranch))];
}

export async function getLiaisons() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return liaisonUsers;
}

export async function getEndorsements() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return JSON.parse(JSON.stringify(endorsements)).map((e: any) => ({...e, transactionDate: new Date(e.transactionDate)}));
}
