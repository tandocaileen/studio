
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
    const motorcycles: Motorcycle[] = [];
    const endorsements: Endorsement[] = [];
    const cashAdvances: CashAdvance[] = [];

    const DEMO_LIAISON = initialLiaisonUsers.find(l => l.name === 'BRYLE NIKKO HAMILI')!;
    const SUPERVISOR_NAME = 'Naruto Uzumaki';
    const CASHIER_NAME = 'Sasuke Uchiha';

    const makes = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki'];
    const models = ['Click 125i', 'NMAX', 'Raider R150', 'Ninja 400', 'Mio Aerox', 'PCX 160'];
    const customers = [
        'Juan Dela Cruz', 'Maria Santos', 'Peter Jones', 'Mei Lin', 'Kenji Tanaka', 'Fatima Al-Jamil',
        'Andres Bonifacio', 'Gabriela Silang', 'Jose Rizal', 'Apolinario Mabini', 'Gregorio Del Pilar',
        'Teresa Magbanua', 'Emilio Aguinaldo', 'Melchora Aquino', 'Antonio Luna', 'Claro M. Recto',
        'Manuel Quezon', 'Sergio Osmeña', 'Ramon Magsaysay', 'Carlos P. Garcia'
    ];
    const branches = [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];

    for (let i = 1; i <= 20; i++) {
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
            status: 'Incomplete', // Start all as incomplete, will be updated by logic
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

    const createEndorsement = (id: string, date: Date, mcIds: string[], createdBy: string) => {
        endorsements.push({
            id, transactionDate: date, liaisonId: DEMO_LIAISON.id,
            liaisonName: DEMO_LIAISON.name, motorcycleIds: mcIds, createdBy, remarks: "Please process"
        });
        mcIds.forEach(mcId => {
            const mc = motorcycles.find(m => m.id === mcId);
            if (mc) {
                mc.status = mc.status === 'Ready to Register' ? 'Endorsed - Ready' : 'Endorsed - Incomplete';
                mc.assignedLiaison = DEMO_LIAISON.name;
            }
        });
    };

    createEndorsement('ENDO-20240801-001', addDays(today, -15), ['mc-0002', 'mc-0004'], SUPERVISOR_NAME);
    createEndorsement('ENDO-20240802-002', addDays(today, -14), ['mc-0006', 'mc-0001'], CASHIER_NAME);
    createEndorsement('ENDO-20240803-003', addDays(today, -13), ['mc-0008', 'mc-0010', 'mc-0003', 'mc-0005'], SUPERVISOR_NAME);

    const createCA = (id: string, date: Date, mcIds: string[], status: CashAdvance['status'], cvNumber?: string, cvDate?: Date) => {
        const liaison = initialLiaisonUsers.find(l => l.name === DEMO_LIAISON.name);
        if (!liaison) return;
        const amount = mcIds.reduce((sum, mcId) => {
            const mc = motorcycles.find(m => m.id === mcId);
            if (mc) {
                return sum + (liaison.processingFee || 0) + (liaison.orFee || 0);
            }
            return sum;
        }, 0);
        
        const ca: CashAdvance = {
            id, personnel: liaison.name, personnelBranch: liaison.assignedBranch, 
            purpose: `Cash advance for registration of ${mcIds.length} units.`,
            amount, date, status, motorcycleIds: mcIds,
        };
        if (cvNumber) ca.checkVoucherNumber = cvNumber;
        if (cvDate) ca.checkVoucherReleaseDate = cvDate;
        cashAdvances.push(ca);
        mcIds.forEach(mcId => {
            const mc = motorcycles.find(m => m.id === mcId);
            if (mc) {
                mc.status = 'Processing';
            }
        });
    };
    
    // CA 1: Liquidated
    const ca1_mcIds = ['mc-0002', 'mc-0004'];
    createCA('ca-081524-001', addDays(today, -10), ca1_mcIds, 'Liquidated', 'CV-2024-08-001', addDays(today, -9));
    ca1_mcIds.forEach(mcId => {
        const mc = motorcycles.find(m => m.id === mcId);
        const liaison = initialLiaisonUsers.find(l => l.name === DEMO_LIAISON.name);
        if (mc && liaison) {
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
    
    // CA 3: Processing for CV
    createCA('ca-081724-003', addDays(today, -5), ['mc-0008', 'mc-0010'], 'Processing for CV');

    // CA 4 & 5 for "CV Released" Status
    createEndorsement('ENDO-20240804-004', addDays(today, -12), ['mc-0012', 'mc-0014'], CASHIER_NAME);
    createEndorsement('ENDO-20240805-005', addDays(today, -11), ['mc-0016', 'mc-0018'], SUPERVISOR_NAME);
    createCA('ca-081824-004', addDays(today, -4), ['mc-0012', 'mc-0014'], 'CV Released');
    createCA('ca-081924-005', addDays(today, -3), ['mc-0016', 'mc-0018'], 'CV Released');

    return { motorcycles, endorsements, cashAdvances };
};


const MC_KEY = 'lto_motorcycles';
const CA_KEY = 'lto_cash_advances';
const ENDO_KEY = 'lto_endorsements';

const getInitialData = <T,>(key: string, initialData: T[]): T[] => {
    if (typeof window === 'undefined') {
        return initialData;
    }
    const storedData = localStorage.getItem(key);
    if (!storedData) {
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    }
    try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
             return parsedData;
        }
        throw new Error("Invalid data structure");
    } catch (error) {
        console.warn(`Could not parse ${key} from localStorage, falling back to initial data.`, error);
        localStorage.setItem(key, JSON.stringify(initialData));
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

const ensureDataGenerated = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('data_generated_flag')) {
        console.log("Generating fresh data set...");
        const { motorcycles, endorsements, cashAdvances } = generateInitialData();
        setData(MC_KEY, motorcycles);
        setData(ENDO_KEY, endorsements);
        setData(CA_KEY, cashAdvances);
        localStorage.setItem('data_generated_flag', 'true');
        // A small delay to allow localStorage to settle before potential reload.
        if (window.location.search.includes('reset_data=true')) {
            setTimeout(() => {
                // Remove the query param to prevent re-triggering on next refresh
                const url = new URL(window.location.href);
                url.searchParams.delete('reset_data');
                window.history.replaceState({}, '', url.toString());
                window.location.reload();
            }, 100);
        }
    }
};

// On first load of this module, check if data needs to be generated.
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset_data')) {
        localStorage.removeItem('data_generated_flag');
    }
    ensureDataGenerated();
}


// --- Motorcycles ---
export async function getMotorcycles(): Promise<Motorcycle[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return getInitialData(MC_KEY, []);
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
    return getInitialData(CA_KEY, []);
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
    return initialLiaisonUsers;
}


// --- Endorsements ---
export async function getEndorsements(): Promise<Endorsement[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return getInitialData(ENDO_KEY, []);
}

export async function addEndorsement(newEndorsement: Endorsement) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allEndorsements = await getEndorsements();
    setData(ENDO_KEY, [...allEndorsements, newEndorsement]);
}

export function getBranches() {
  return [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];
}
