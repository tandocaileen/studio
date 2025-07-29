
import type { Motorcycle, CashAdvance, LiaisonUser, Endorsement, MotorcycleStatus } from '@/types';

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- LIAISON USERS from Document ---
const initialLiaisonUsers: LiaisonUser[] = [
    { id: 'user-001', name: 'JINKY JOY AGBALOG', assignedBranch: 'LA UNION', processingFee: 300.00, orFee: 2115.18 },
    { id: 'user-002', name: 'BABY LIEZELL CAUILAN', assignedBranch: 'ILAGAN', processingFee: 250.00, orFee: 2290.18 },
    { id: 'user-003', name: 'RODEL PASTRANO', assignedBranch: 'SAN FERNANDO', processingFee: 300.00, orFee: 1865.18 },
    { id: 'user-004', name: 'JUNIEFE AQUINO', assignedBranch: 'CALAMBA', processingFee: 200.00, orFee: 2319.43 },
    { id: 'user-005', name: 'LYNLYN GENEZA', assignedBranch: 'CALAPAN', processingFee: 250.00, orFee: 2321.43 },
    { id: 'user-006', name: 'RUSHEL MORGA', assignedBranch: 'LEGAZPI', processingFee: 250.00, orFee: 2140.18 },
    { id: 'user-007', name: 'BENJO SEQUIERO', assignedBranch: 'ILOILO', processingFee: 150.00, orFee: 1796.43 },
    { id: 'user-008', name: 'BRYLE NIKKO HAMILI', assignedBranch: 'CEBU', processingFee: 300.00, orFee: 1796.43 },
    { id: 'user-009', name: 'ALLAN ANTONI', assignedBranch: 'TACLOBAN', processingFee: 100.00, orFee: 1655.18 },
    { id: 'user-010', name: 'RODERICK GUTIERREZ', assignedBranch: 'ZAMBOANGA', processingFee: 250.00, orFee: 1702.68 },
    { id: 'user-011', name: 'JASSRAY PAMISA', assignedBranch: 'CDO', processingFee: 100.00, orFee: 1816.43 },
    { id: 'user-012', name: 'ALI VIN SALEH COLINA', assignedBranch: 'DAVAO', processingFee: 244.82, orFee: 1796.43 },
    { id: 'user-013', name: 'EMILY AMADEO', assignedBranch: 'MARBEL', processingFee: 130.00, orFee: 1846.43 },
    { id: 'user-014', name: 'GEORGETH YEE', assignedBranch: 'BUENAVISTA', processingFee: 150.00, orFee: 1846.43 }
];


const generateInitialData = () => {
    let motorcycles: Motorcycle[] = [];
    let endorsements: Endorsement[] = [];
    let cashAdvances: CashAdvance[] = [];

    const DEMO_LIAISON = initialLiaisonUsers.find(l => l.name === 'BRYLE NIKKO HAMILI')!;
    const SUPERVISOR_NAME = 'Naruto Uzumaki';
    const CASHIER_NAME = 'Sasuke Uchiha';

    const makes = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki'];
    const models = ['Click 125i', 'NMAX', 'Raider R150', 'Ninja 400', 'Mio Aerox', 'PCX 160'];
    const customers = [
        'Juan Dela Cruz', 'Maria Santos', 'Peter Jones', 'Mei Lin', 'Kenji Tanaka', 'Fatima Al-Jamil',
        'Andres Bonifacio', 'Gabriela Silang', 'Jose Rizal', 'Apolinario Mabini', 'Gregorio Del Pilar',
        'Teresa Magbanua', 'Emilio Aguinaldo', 'Melchora Aquino', 'Antonio Luna', 'Claro M. Recto',
        'Manuel Quezon', 'Sergio Osmeña', 'Ramon Magsaysay', 'Carlos P. Garcia', 'Diego Silang', 'Lapu-Lapu'
    ];
    const branches = [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];

    for (let i = 1; i <= 22; i++) {
        const isReady = i % 2 === 0;
        const purchaseDate = addDays(today, -(i * 5) - 30);

        const mc: Motorcycle = {
            id: `mc-${i.toString().padStart(4, '0')}`,
            make: makes[i % makes.length],
            model: models[i % models.length],
            year: 2024,
            color: 'Black',
            plateNumber: `${Math.floor(Math.random() * 900) + 100} ABC`,
            engineNumber: `E${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            chassisNumber: `C${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            assignedBranch: branches[i % branches.length],
            purchaseDate: purchaseDate,
            supplier: 'Prestige Honda',
            documents: [],
            status: 'Incomplete', 
            customerName: customers[i - 1],
            salesInvoiceNo: `SI-${Math.floor(Math.random() * 90000) + 10000}`,
            accountCode: `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };

        if (isReady) {
            mc.status = 'Ready to Register';
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
    
    // --- Endorsements to Bryle ---
    const endorsementData = [
      { id: 'ENDO-20240801-001', date: -2, mcIds: ['mc-0001', 'mc-0002'], creator: SUPERVISOR_NAME },
      { id: 'ENDO-20240802-002', date: -3, mcIds: ['mc-0003', 'mc-0004'], creator: CASHIER_NAME },
      { id: 'ENDO-20240803-003', date: -4, mcIds: ['mc-0005', 'mc-0006'], creator: SUPERVISOR_NAME },
      { id: 'ENDO-20240804-004', date: -5, mcIds: ['mc-0007', 'mc-0008'], creator: CASHIER_NAME },
      { id: 'ENDO-20240805-005', date: -6, mcIds: ['mc-0009', 'mc-0010'], creator: SUPERVISOR_NAME },
      { id: 'ENDO-20240806-006', date: -1, mcIds: ['mc-0011', 'mc-0012'], creator: CASHIER_NAME },
      { id: 'ENDO-20240807-007', date: -2, mcIds: ['mc-0013', 'mc-0014'], creator: SUPERVISOR_NAME },
      { id: 'ENDO-20240808-008', date: -3, mcIds: ['mc-0015', 'mc-0016'], creator: CASHIER_NAME },
      { id: 'ENDO-20240809-009', date: -4, mcIds: ['mc-0017', 'mc-0018'], creator: SUPERVISOR_NAME },
      { id: 'ENDO-20240810-010', date: -5, mcIds: ['mc-0019', 'mc-0020'], creator: CASHIER_NAME },
    ];

    endorsementData.forEach(e => {
        endorsements.push({
            id: e.id, transactionDate: addDays(today, e.date), liaisonId: DEMO_LIAISON.id,
            liaisonName: DEMO_LIAISON.name, motorcycleIds: e.mcIds, createdBy: e.creator, remarks: "Generated for mock data"
        });
        e.mcIds.forEach(mcId => {
            const mc = motorcycles.find(m => m.id === mcId);
            if (mc) {
                mc.status = mc.status === 'Ready to Register' ? 'Endorsed - Ready' : 'Endorsed - Incomplete';
                mc.assignedLiaison = DEMO_LIAISON.name;
            }
        });
    });

    const createCA = (id: string, date: Date, mcIds: string[], status: CashAdvance['status'], cvNumber?: string, cvDate?: Date) => {
        const liaison = initialLiaisonUsers.find(l => l.name === DEMO_LIAISON.name);
        if (!liaison) return;
        const amount = mcIds.reduce((sum) => {
             return sum + (liaison.processingFee || 0) + (liaison.orFee || 0);
        }, 0);
        
        const ca: CashAdvance = {
            id, personnel: liaison.name, personnelBranch: liaison.assignedBranch, 
            purpose: `Cash advance for registration of ${mcIds.length} units.`,
            amount, date, status, motorcycleIds: mcIds,
        };
        if (cvNumber) ca.checkVoucherNumber = cvNumber;
        if (cvDate) ca.checkVoucherReleaseDate = cvDate;
        cashAdvances.push(ca);
        // This is where the status was being incorrectly updated. It should be updated on a separate action.
        // mcIds.forEach(mcId => {
        //     const mc = motorcycles.find(m => m.id === mcId);
        //     if (mc) mc.status = 'Processing';
        // });
    };
    
    // --- Cash Advances with Various Statuses ---
    // CA 1: Liquidated
    const ca1_mcIds = ['mc-0002', 'mc-0004'];
    createCA('ca-081524-001', addDays(today, -10), ca1_mcIds, 'Liquidated', 'CV-2024-08-001', addDays(today, -9));
    ca1_mcIds.forEach(mcId => {
        const mc = motorcycles.find(m => m.id === mcId);
        const liaison = initialLiaisonUsers.find(l => l.name === DEMO_LIAISON.name);
        if (mc && liaison) {
            // Manually set status for already processed items
            mc.status = 'For Review';
            mc.liquidationDetails = {
                parentCaId: 'ca-081524-001', ltoOrNumber: `LTO-OR-${Math.floor(Math.random() * 90000)}`,
                ltoOrAmount: liaison.orFee, ltoProcessFee: liaison.processingFee, 
                totalLiquidation: liaison.orFee + liaison.processingFee,
                shortageOverage: 0,
                remarks: 'Full Liquidation Complete', liquidatedBy: liaison.name, liquidationDate: addDays(today, -2)
            };
        }
    });

    // CA 2: CV Received
    createCA('ca-081624-002', addDays(today, -8), ['mc-0006'], 'CV Received', 'CV-2024-08-005', addDays(today, -7));
    motorcycles.find(m => m.id === 'mc-0006')!.status = 'Processing';
    
    // CA 3: Processing for CV
    createCA('ca-081724-003', addDays(today, -5), ['mc-0008', 'mc-0010'], 'Processing for CV');
    motorcycles.find(m => m.id === 'mc-0008')!.status = 'Processing';
    motorcycles.find(m => m.id === 'mc-0010')!.status = 'Processing';

    // CA 4 & 5 for "CV Released" Status
    createCA('ca-081824-004', addDays(today, -4), ['mc-0012'], 'CV Released');
    motorcycles.find(m => m.id === 'mc-0012')!.status = 'Processing';

    createCA('ca-081924-005', addDays(today, -3), ['mc-0014'], 'CV Released');
    motorcycles.find(m => m.id === 'mc-0014')!.status = 'Processing';

    return { motorcycles, endorsements, cashAdvances };
};


const MC_KEY = 'lto_motorcycles';
const CA_KEY = 'lto_cash_advances';
const ENDO_KEY = 'lto_endorsements';
const DATA_FLAG = 'data_generated_flag_v3'; // Increment version to force reset

const initializeData = () => {
    if (typeof window !== 'undefined') {
        const needsReset = localStorage.getItem(DATA_FLAG) !== 'true' || window.location.search.includes('reset_data=true');
        
        if (needsReset) {
            console.log("Forcing data reset. Generating fresh, consistent data set...");
            const { motorcycles, endorsements, cashAdvances } = generateInitialData();
            
            localStorage.setItem(MC_KEY, JSON.stringify(motorcycles));
            localStorage.setItem(ENDO_KEY, JSON.stringify(endorsements));
            localStorage.setItem(CA_KEY, JSON.stringify(cashAdvances));
            localStorage.setItem(DATA_FLAG, 'true');

            if (window.location.search.includes('reset_data=true')) {
                const url = new URL(window.location.href);
                url.searchParams.delete('reset_data');
                window.history.replaceState({}, '', url.toString());
                // Force a reload to ensure all components re-fetch the new data
                window.location.reload();
            }
        }
    }
};

// Run initialization logic when the module is loaded
initializeData();

const getData = <T,>(key: string): T[] => {
    if (typeof window === 'undefined') {
        // Return empty array for server-side rendering
        return [];
    }
    const storedData = localStorage.getItem(key);
    try {
        return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error(`Failed to parse data for key ${key}, returning empty array.`, e);
        return [];
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
    return Promise.resolve(getData<Motorcycle>(MC_KEY));
}

export async function updateMotorcycles(updatedMotorcycles: Motorcycle | Motorcycle[]) {
    const allMotorcycles = await getMotorcycles();
    const motorcyclesMap = new Map(allMotorcycles.map((m: Motorcycle) => [m.id, m]));
    
    const toUpdate = Array.isArray(updatedMotorcycles) ? updatedMotorcycles : [updatedMotorcycles];
    toUpdate.forEach(um => motorcyclesMap.set(um.id, um));

    setData(MC_KEY, Array.from(motorcyclesMap.values()));
}

// --- Cash Advances ---
export async function getCashAdvances(): Promise<CashAdvance[]> {
    return Promise.resolve(getData<CashAdvance>(CA_KEY));
}

export async function addCashAdvance(newAdvance: CashAdvance) {
    const allCAs = await getCashAdvances();
    setData(CA_KEY, [...allCAs, newAdvance]);
}

export async function updateCashAdvances(updatedCAs: CashAdvance | CashAdvance[]) {
    const allCAs = await getCashAdvances();
    const caMap = new Map(allCAs.map((ca: CashAdvance) => [ca.id, ca]));

    const toUpdate = Array.isArray(updatedCAs) ? updatedCAs : [updatedCAs];
    toUpdate.forEach(uca => caMap.set(uca.id, uca));
    
    setData(CA_KEY, Array.from(caMap.values()));
}

// --- Liaisons ---
export async function getLiaisons(): Promise<LiaisonUser[]> {
    // This data is static and doesn't need to be in local storage
    return Promise.resolve(initialLiaisonUsers);
}

// --- Endorsements ---
export async function getEndorsements(): Promise<Endorsement[]> {
    return Promise.resolve(getData<Endorsement>(ENDO_KEY));
}

export async function addEndorsement(newEndorsement: Endorsement) {
    const allEndorsements = await getEndorsements();
    setData(ENDO_KEY, [...allEndorsements, newEndorsement]);
}

export function getBranches() {
  return [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];
}
