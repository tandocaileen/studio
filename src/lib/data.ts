
import type { Motorcycle, CashAdvance, LiaisonUser, Endorsement } from '@/types';

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const initialMotorcycles: Motorcycle[] = [
  {
    id: 'mc-001',
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
    status: 'Endorsed - Ready',
    documents: [],
    customerName: 'Juan Dela Cruz',
    assignedLiaison: 'Bryle Nikko Hamili',
    salesInvoiceNo: 'SI-00123',
    accountCode: 'AC-JDC-001',
    hpgControlNumber: 'HPG-CTRL-001',
    cocNumber: 'COC-123',
    policyNumber: 'POL-123',
    sarCode: 'SAR-123',
    insuranceType: 'TPL',
    insuranceEffectiveDate: new Date('2024-01-01'),
    insuranceExpirationDate: new Date('2025-01-01'),
    crNumber: 'CR12345',
    csrNumber: 'CSR12345',
    processingFee: 300.00,
    orFee: 1526.43,
  },
  {
    id: 'mc-002',
    make: 'Yamaha',
    model: 'NMAX',
    year: 2022,
    color: 'Blue',
    plateNumber: '456 DEF',
    engineNumber: 'E87654321',
    chassisNumber: 'C87654321',
    assignedBranch: 'CEBU',
    purchaseDate: new Date('2022-05-20'),
    supplier: 'Yamaha Motors',
    status: 'Endorsed - Incomplete',
    documents: [],
    customerName: 'Maria Clara',
    assignedLiaison: 'Bryle Nikko Hamili',
    salesInvoiceNo: 'SI-00124',
    accountCode: 'AC-MCL-001',
    hpgControlNumber: 'HPG-CTRL-002',
    cocNumber: undefined,
    policyNumber: undefined,
    sarCode: undefined,
    insuranceType: undefined,
    crNumber: undefined,
    csrNumber: undefined,
  },
    {
    id: 'mc-003',
    make: 'Honda',
    model: 'PCX160',
    year: 2023,
    color: 'Pearl White',
    plateNumber: '212 MNO',
    engineNumber: 'E99887766',
    chassisNumber: 'C99887766',
    assignedBranch: 'CEBU',
    purchaseDate: new Date('2023-08-01'),
    supplier: 'Honda Prestige',
    status: 'Ready to Register',
    documents: [],
    customerName: 'Gabriela Silang',
    salesInvoiceNo: 'SI-00127',
    accountCode: 'AC-GSL-001',
    hpgControlNumber: 'HPG-CTRL-005',
    cocNumber: 'COC-PCX',
    policyNumber: 'POL-PCX',
    sarCode: 'SAR-PCX',
    insuranceType: 'TPL',
    insuranceEffectiveDate: new Date('2024-01-01'),
    insuranceExpirationDate: new Date('2025-01-01'),
    crNumber: 'CRPCX160',
    csrNumber: 'CSRPXC160'
  },
   {
    id: 'mc-004',
    make: 'Suzuki',
    model: 'Raider 150',
    year: 2024,
    color: 'Red',
    plateNumber: '789 GHI',
    engineNumber: 'E98765432',
    chassisNumber: 'C98765432',
    assignedBranch: 'SAN FERNANDO',
    purchaseDate: new Date('2024-02-10'),
    supplier: 'Suzuki Motors',
    status: 'Incomplete',
    documents: [],
    customerName: 'Jose Rizal',
    assignedLiaison: undefined,
    salesInvoiceNo: 'SI-00125',
    accountCode: 'AC-JRZ-001',
    hpgControlNumber: 'HPG-CTRL-003',
  },
];

const initialCashAdvances: CashAdvance[] = [
  {
    id: 'ca-070124-001',
    personnel: 'Bryle Nikko Hamili',
    purpose: 'Registration for 1 unit',
    amount: 1826.43,
    date: addDays(today, -30),
    status: 'Liquidated',
    motorcycleIds: ['mc-001'],
    totalLiquidation: 1800,
    checkVoucherNumber: 'CV-2024-06-010',
    checkVoucherReleaseDate: addDays(today, -28),
  },
];

const initialLiaisonUsers: LiaisonUser[] = [
    { id: 'user-001', name: 'Bryle Nikko Hamili', assignedBranch: 'CEBU', processingFee: 300.00, orFee: 1526.43 },
    { id: 'user-002', name: 'Rodel Pastrano', assignedBranch: 'SAN FERNANDO', processingFee: 300.00, orFee: 1585.18 },
    { id: 'user-003', name: 'Demo Liaison', assignedBranch: 'Main Office', processingFee: 250, orFee: 1500 },
];

const initialEndorsements: Endorsement[] = [
    { id: 'ENDO-20240728-001', transactionDate: addDays(today, -2), liaisonId: 'user-001', liaisonName: 'Bryle Nikko Hamili', motorcycleIds: ['mc-001', 'mc-002'], remarks: 'For processing.', createdBy: 'Demo Supervisor'},
];

const MC_KEY = 'lto_motorcycles';
const CA_KEY = 'lto_cash_advances';
const ENDO_KEY = 'lto_endorsements';

// Helper to get data from localStorage or initialize it
const getData = <T,>(key: string, initialData: T[]): T[] => {
    if (typeof window === 'undefined') {
        return initialData;
    }
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored, (key, value) => {
                // Reviver to convert ISO strings back to Date objects
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
        } else {
            localStorage.setItem(key, JSON.stringify(initialData));
            return initialData;
        }
    } catch (error) {
        console.error(`Error with localStorage for key ${key}:`, error);
        return initialData;
    }
};

// Helper to save data to localStorage
const saveData = <T,>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage for key ${key}:`, error);
    }
};


// --- Motorcycles ---
export async function getMotorcycles(): Promise<Motorcycle[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return getData<Motorcycle>(MC_KEY, initialMotorcycles);
}

export async function updateMotorcycles(updatedMotorcycles: Motorcycle | Motorcycle[]) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allMotorcycles = await getMotorcycles();
    const motorcyclesMap = new Map(allMotorcycles.map(m => [m.id, m]));
    
    const toUpdate = Array.isArray(updatedMotorcycles) ? updatedMotorcycles : [updatedMotorcycles];
    toUpdate.forEach(um => motorcyclesMap.set(um.id, um));

    saveData(MC_KEY, Array.from(motorcyclesMap.values()));
}


// --- Cash Advances ---
export async function getCashAdvances(): Promise<CashAdvance[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return getData<CashAdvance>(CA_KEY, initialCashAdvances);
}

export async function addCashAdvance(newAdvance: CashAdvance) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allCAs = await getCashAdvances();
    saveData(CA_KEY, [...allCAs, newAdvance]);
}

export async function updateCashAdvances(updatedCAs: CashAdvance | CashAdvance[]) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allCAs = await getCashAdvances();
    const caMap = new Map(allCAs.map(ca => [ca.id, ca]));

    const toUpdate = Array.isArray(updatedCAs) ? updatedCAs : [updatedCAs];
    toUpdate.forEach(uca => caMap.set(uca.id, uca));
    
    saveData(CA_KEY, Array.from(caMap.values()));
}


// --- Liaisons ---
export async function getLiaisons(): Promise<LiaisonUser[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    // Liaisons are considered static for this demo
    return initialLiaisonUsers;
}


// --- Endorsements ---
export async function getEndorsements(): Promise<Endorsement[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return getData<Endorsement>(ENDO_KEY, initialEndorsements);
}

export async function addEndorsement(newEndorsement: Endorsement) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allEndorsements = await getEndorsements();
    saveData(ENDO_KEY, [...allEndorsements, newEndorsement]);
}

export function getBranches() {
  return [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];
}
