
import type { Motorcycle, CashAdvance, LiaisonUser, Endorsement, MotorcycleStatus } from '@/types';

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- SINGLE LIAISON ---
const SINGLE_LIAISON_USER: LiaisonUser = { id: 'user-001', name: 'Bryle Nikko Hamili', assignedBranch: 'CEBU', processingFee: 1500, orFee: 1000 };


const createMotorcycles = (): Motorcycle[] => {
    const motorcycles: Motorcycle[] = [];
    const makes = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki'];
    const models = ['Click 125i', 'NMAX', 'Raider R150', 'Ninja 400', 'Mio Aerox', 'PCX 160'];
    const colors = ['Red', 'Black', 'Blue', 'White', 'Silver'];
    const customers = [
        'Juan Dela Cruz', 'Maria Santos', 'Peter Jones', 'Mei Lin', 'Kenji Tanaka', 'Fatima Al-Jamil',
        'Andres Bonifacio', 'Gabriela Silang', 'Jose Rizal', 'Apolinario Mabini', 'Gregorio Del Pilar',
        'Teresa Magbanua', 'Emilio Aguinaldo', 'Melchora Aquino', 'Antonio Luna', 'Claro M. Recto',
        'Manuel Quezon', 'Sergio Osmeña', 'Ramon Magsaysay', 'Carlos P. Garcia'
    ];

    for (let i = 1; i <= 20; i++) {
        const isReady = i % 2 === 0;
        const purchaseDate = addDays(today, - (i * 5));
        
        const mc: Motorcycle = {
            id: `mc-${i.toString().padStart(4, '0')}`,
            make: makes[i % makes.length],
            model: models[i % models.length],
            year: 2024,
            color: colors[i % colors.length],
            plateNumber: `${Math.floor(Math.random() * 900) + 100} ABC`,
            engineNumber: `E${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            chassisNumber: `C${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            assignedBranch: 'CEBU',
            purchaseDate: purchaseDate,
            supplier: 'Prestige Honda',
            documents: [],
            status: isReady ? 'Ready to Register' : 'Incomplete',
            customerName: customers[i-1],
            salesInvoiceNo: `SI-${Math.floor(Math.random() * 90000) + 10000}`,
            accountCode: `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };
        
        if (isReady) {
            mc.cocNumber = `COC-${Math.floor(Math.random() * 9000) + 1000}`;
            mc.policyNumber = `POL-${Math.floor(Math.random() * 9000) + 1000}`;
            mc.insuranceType = 'TPL';
            mc.insuranceEffectiveDate = purchaseDate;
            mc.insuranceExpirationDate = addDays(purchaseDate, 365);
            mc.hpgControlNumber = `HPG-${Math.floor(Math.random() * 9000) + 1000}`;
            mc.sarCode = `SAR-${Math.floor(Math.random() * 9000) + 1000}`;
            mc.csrNumber = `CSR-${Math.floor(Math.random() * 9000) + 1000}`;
            mc.crNumber = `CR-${Math.floor(Math.random() * 9000) + 1000}`;
        }
        
        motorcycles.push(mc);
    }
    return motorcycles;
};

const initialMotorcycles: Motorcycle[] = createMotorcycles();

// Process Endorsements
const initialEndorsements: Endorsement[] = [];
const endorsement1MCs = ['mc-0002', 'mc-0004'];
const endorsement2MCs = ['mc-0006', 'mc-0008', 'mc-0001'];
const endorsement3MCs = ['mc-0010', 'mc-0012', 'mc-0003', 'mc-0005'];

initialEndorsements.push({
    id: 'ENDO-20240801-001',
    transactionDate: addDays(today, -15),
    liaisonId: 'user-001',
    liaisonName: 'Bryle Nikko Hamili',
    motorcycleIds: endorsement1MCs,
    createdBy: 'Demo Store Supervisor'
});
initialEndorsements.push({
    id: 'ENDO-20240802-002',
    transactionDate: addDays(today, -14),
    liaisonId: 'user-001',
    liaisonName: 'Bryle Nikko Hamili',
    motorcycleIds: endorsement2MCs,
    createdBy: 'Demo Cashier'
});
initialEndorsements.push({
    id: 'ENDO-20240803-003',
    transactionDate: addDays(today, -13),
    liaisonId: 'user-001',
    liaisonName: 'Bryle Nikko Hamili',
    motorcycleIds: endorsement3MCs,
    createdBy: 'Demo Store Supervisor'
});

[...endorsement1MCs, ...endorsement2MCs, ...endorsement3MCs].forEach(mcId => {
    const mc = initialMotorcycles.find(m => m.id === mcId);
    if (mc) {
        mc.status = mc.status === 'Ready to Register' ? 'Endorsed - Ready' : 'Endorsed - Incomplete';
        mc.assignedLiaison = 'Bryle Nikko Hamili';
    }
});


// Process Cash Advances
const initialCashAdvances: CashAdvance[] = [];

// CA 1: Liquidated
const ca1_mcIds = ['mc-0002', 'mc-0004'];
const ca1_amount = ca1_mcIds.length * (SINGLE_LIAISON_USER.processingFee + SINGLE_LIAISON_USER.orFee);
initialCashAdvances.push({
    id: 'ca-081524-001',
    personnel: 'Bryle Nikko Hamili',
    purpose: `Cash advance for registration of ${ca1_mcIds.length} units.`,
    amount: ca1_amount,
    date: addDays(today, -10),
    status: 'Liquidated',
    motorcycleIds: ca1_mcIds,
    checkVoucherNumber: 'CV-2024-08-001',
    checkVoucherReleaseDate: addDays(today, -9)
});
ca1_mcIds.forEach(mcId => {
    const mc = initialMotorcycles.find(m => m.id === mcId);
    if (mc) {
        mc.status = 'For Review';
        mc.liquidationDetails = {
            parentCaId: 'ca-081524-001',
            ltoOrNumber: `LTO-OR-${Math.floor(Math.random() * 90000)}`,
            ltoOrAmount: 950,
            ltoProcessFee: 1450,
            totalLiquidation: 2400,
            shortageOverage: 100, // (1500 + 1000) - 2400
            remarks: 'Full Liquidation Complete',
            liquidatedBy: 'Bryle Nikko Hamili',
            liquidationDate: addDays(today, -2)
        };
    }
});

// CA 2: CV Received (Ready for liquidation)
const ca2_mcIds = ['mc-0006', 'mc-0008'];
const ca2_amount = ca2_mcIds.length * (SINGLE_LIAISON_USER.processingFee + SINGLE_LIAISON_USER.orFee);
initialCashAdvances.push({
    id: 'ca-081624-002',
    personnel: 'Bryle Nikko Hamili',
    purpose: `Cash advance for registration of ${ca2_mcIds.length} units.`,
    amount: ca2_amount,
    date: addDays(today, -8),
    status: 'CV Received',
    motorcycleIds: ca2_mcIds,
    checkVoucherNumber: 'CV-2024-08-005',
    checkVoucherReleaseDate: addDays(today, -7)
});
ca2_mcIds.forEach(mcId => {
    const mc = initialMotorcycles.find(m => m.id === mcId);
    if (mc) {
        mc.status = 'Processing';
    }
});

// CA 3: Processing for CV
const ca3_mcIds = ['mc-0010', 'mc-0012'];
const ca3_amount = ca3_mcIds.length * (SINGLE_LIAISON_USER.processingFee + SINGLE_LIAISON_USER.orFee);
initialCashAdvances.push({
    id: 'ca-081724-003',
    personnel: 'Bryle Nikko Hamili',
    purpose: `Cash advance for registration of ${ca3_mcIds.length} units.`,
    amount: ca3_amount,
    date: addDays(today, -5),
    status: 'Processing for CV',
    motorcycleIds: ca3_mcIds,
});
ca3_mcIds.forEach(mcId => {
    const mc = initialMotorcycles.find(m => m.id === mcId);
    if (mc) {
        mc.status = 'Processing';
    }
});


const initialLiaisonUsers: LiaisonUser[] = [
    SINGLE_LIAISON_USER,
    // Add other non-liaison users for login purposes
    { id: 'user-002', name: 'Demo Cashier', assignedBranch: 'CEBU', processingFee: 0, orFee: 0 },
    { id: 'user-003', name: 'Demo Store Supervisor', assignedBranch: 'CEBU', processingFee: 0, orFee: 0 },
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
        const storedData = localStorage.getItem(key);
        if (!storedData) {
            localStorage.setItem(key, JSON.stringify(initialData));
            return initialData;
        }
        // If data exists, return it, don't overwrite with initialData
        return JSON.parse(storedData);
    } catch (error) {
        console.error(`Error with localStorage for key ${key}:`, error);
        return initialData;
    }
};

const setData = <T,>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
     try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage for key ${key}:`, error);
    }
}


// --- Motorcycles ---
export async function getMotorcycles(): Promise<Motorcycle[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const stored = localStorage.getItem(MC_KEY);
    if (!stored) {
        setData(MC_KEY, initialMotorcycles);
        return initialMotorcycles;
    }
    return JSON.parse(stored);
}

export async function updateMotorcycles(updatedMotorcycles: Motorcycle | Motorcycle[]) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const allMotorcycles = await getMotorcycles();
    const motorcyclesMap = new Map(allMotorcycles.map((m: Motorcycle) => [m.id, m]));
    
    const toUpdate = Array.isArray(updatedMotorcycles) ? updatedMotorcycles : [updatedMotorcycles];
    toUpdate.forEach(um => motorcyclesMap.set(um.id, um));

    setData(MC_KEY, Array.from(motorcyclesMap.values()));
}


// --- Cash Advances ---
export async function getCashAdvances(): Promise<CashAdvance[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const stored = localStorage.getItem(CA_KEY);
    if (!stored) {
        setData(CA_KEY, initialCashAdvances);
        return initialCashAdvances;
    }
    return JSON.parse(stored);
}

export async function addCashAdvance(newAdvance: CashAdvance) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allCAs = await getCashAdvances();
    setData(CA_KEY, [...allCAs, newAdvance]);
}

export async function updateCashAdvances(updatedCAs: CashAdvance | CashAdvance[]) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allCAs = await getCashAdvances();
    const caMap = new Map(allCAs.map((ca: CashAdvance) => [ca.id, ca]));

    const toUpdate = Array.isArray(updatedCAs) ? updatedCAs : [updatedCAs];
    toUpdate.forEach(uca => caMap.set(uca.id, uca));
    
    setData(CA_KEY, Array.from(caMap.values()));
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
    const stored = localStorage.getItem(ENDO_KEY);
    if (!stored) {
        setData(ENDO_KEY, initialEndorsements);
        return initialEndorsements;
    }
    return JSON.parse(stored);
}

export async function addEndorsement(newEndorsement: Endorsement) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allEndorsements = await getEndorsements();
    setData(ENDO_KEY, [...allEndorsements, newEndorsement]);
}

export function getBranches() {
  return [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];
}

    