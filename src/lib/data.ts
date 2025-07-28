

import type { Motorcycle, CashAdvance, LiaisonUser } from '@/types';

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
    assignedBranch: 'Main Office',
    purchaseDate: new Date('2023-01-15'),
    supplier: 'Honda Prestige',
    status: 'Registered',
    documents: [
      { type: 'OR/CR', url: '#/doc/orcr123', uploadedAt: new Date('2023-01-20'), expiresAt: addDays(today, 300) },
      { type: 'COC', url: '#', uploadedAt: new Date('2023-01-20') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2023-01-20'), expiresAt: addDays(today, 25) },
    ],
    customerName: 'Juan Dela Cruz',
    assignedLiaison: 'Liaison A',
    processingFee: 1500,
    orFee: 1000,
    salesInvoiceNo: 'SI-00123',
    accountCode: 'AC-JDC-001',
    hpgControlNumber: 'HPG-CTRL-001',
    cocNumber: 'COC-123',
    policyNumber: 'POL-123',
    sarCode: 'SAR-123'
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
    assignedBranch: 'East Branch',
    purchaseDate: new Date('2022-05-20'),
    supplier: 'Yamaha Motors',
    status: 'For Renewal',
    documents: [
      { type: 'OR/CR', url: '#/doc/orcr456', uploadedAt: new Date('2022-05-25'), expiresAt: addDays(today, -10) },
      { type: 'COC', url: '#', uploadedAt: new Date('2022-05-25') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2022-05-25'), expiresAt: addDays(today, 5) },
    ],
    customerName: 'Maria Clara',
    assignedLiaison: 'Liaison B',
    processingFee: 1500,
    orFee: 1000,
    salesInvoiceNo: 'SI-00124',
    accountCode: 'AC-MCL-001',
    hpgControlNumber: 'HPG-CTRL-002',
    cocNumber: 'COC-456',
    policyNumber: 'POL-456',
    sarCode: 'SAR-456'
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
    assignedBranch: 'West Branch',
    purchaseDate: new Date('2023-03-10'),
    supplier: 'Suzuki Philippines',
    status: 'Registered',
    documents: [
      { type: 'OR/CR', url: '#/doc/orcr789', uploadedAt: new Date('2023-03-15'), expiresAt: addDays(today, 400) },
      { type: 'COC', url: '#', uploadedAt: new Date('2023-03-15') },
      { type: 'Insurance', url: '#', uploadedAt: new Date('2023-03-15'), expiresAt: addDays(today, 150) },
    ],
    customerName: 'Jose Rizal',
    assignedLiaison: 'Liaison A',
    processingFee: 1600,
    orFee: 1100,
    salesInvoiceNo: 'SI-00125',
    accountCode: 'AC-JRZ-001',
    hpgControlNumber: 'HPG-CTRL-003',
    cocNumber: 'COC-789',
    policyNumber: 'POL-789',
    sarCode: 'SAR-789'
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
    hpgControlNumber: 'HPG-CTRL-004',
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
    assignedLiaison: 'Demo Liaison',
    processingFee: 1550,
    orFee: 1050,
    salesInvoiceNo: 'SI-00127',
    accountCode: 'AC-GSL-001',
    hpgControlNumber: 'HPG-CTRL-005',
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
    status: 'Ready to Register',
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
    status: 'Incomplete',
    documents: [],
    customerName: 'Emilio Aguinaldo',
    assignedLiaison: 'Demo Liaison',
    processingFee: 1500,
    orFee: 1000,
    salesInvoiceNo: 'SI-00129',
    accountCode: 'AC-EAG-001',
  }
];

const cashAdvances: CashAdvance[] = [
  {
    id: 'ca-070124-001',
    personnel: 'Liaison B',
    purpose: 'Renewal for 1 unit',
    amount: 2500,
    date: addDays(today, -40),
    status: 'Pending',
    motorcycleIds: ['2']
  },
  {
    id: 'ca-070124-002',
    personnel: 'Liaison A',
    purpose: 'Registration for 2 units',
    amount: 5250,
    date: addDays(today, -30),
    status: 'Liquidated',
    motorcycleIds: ['1', '3'],
    totalLiquidation: 5250,
    checkVoucherNumber: 'CV-2024-06-010',
    checkVoucherReleaseDate: addDays(today, -28),
    ltoOrNumber: 'LTO-OR-123, LTO-OR-456',
    ltoOrAmount: 4000,
    ltoProcessFee: 1250,
    liquidationRemarks: 'Fully Liquidated',
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
    personnel: 'Liaison B',
    purpose: 'Renewal for 1 unit',
    amount: 2800,
    date: addDays(today, -2),
    status: 'CV Received',
    checkVoucherNumber: 'CV-2024-07-002',
    checkVoucherReleaseDate: addDays(today, -2),
    motorcycleIds: ['2']
  },
];

const liaisonUsers: LiaisonUser[] = [
    { id: '1', name: 'Demo Liaison', assignedBranch: 'Main Office', processingFee: 1500, orFee: 1000 },
    { id: '2', name: 'Liaison A', assignedBranch: 'East Branch', processingFee: 1550, orFee: 1050 },
    { id: '3', name: 'Liaison B', assignedBranch: 'West Branch', processingFee: 1600, orFee: 1100 },
];

export async function getMotorcycles() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return motorcycles;
}

export async function getCashAdvances() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return cashAdvances;
}

export function getBranches() {
  return [...new Set(motorcycles.map(m => m.assignedBranch))];
}

export async function getLiaisons() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return liaisonUsers;
}
