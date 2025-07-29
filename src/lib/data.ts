
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
        'Manuel Quezon', 'Sergio Osmeña', 'Ramon Magsaysay', 'Carlos P. Garcia', 'Lapu-Lapu', 'Diego Silang',
        'Trinidad Tecson', 'Vicente Lim', 'Josefa Llanes Escoda', 'Francisco Dagohoy', 'Sultan Kudarat',
        'Rajah Sulayman', 'Panday Pira', 'Graciano López Jaena'
    ];
    const branches = [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];

    // 1. Create a pool of 30 motorcycles
    for (let i = 1; i <= 30; i++) {
        const purchaseDate = addDays(today, -(i * 5));
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
            status: 'Incomplete', // Default status
            customerName: customers[i - 1],
            salesInvoiceNo: `SI-${Math.floor(Math.random() * 90000) + 10000}`,
            accountCode: `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };
        motorcycles.push(mc);
    }

    const fillOutDetails = (mc: Motorcycle) => {
        mc.cocNumber = `COC-${Math.floor(Math.random() * 9000) + 1000}`;
        mc.policyNumber = `POL-${Math.floor(Math.random() * 9000) + 1000}`;
        mc.insuranceType = 'TPL';
        mc.insuranceEffectiveDate = mc.purchaseDate;
        mc.insuranceExpirationDate = addDays(mc.purchaseDate, 365);
        mc.hpgControlNumber = `HPG-${Math.floor(Math.random() * 9000) + 1000}`;
        mc.sarCode = `SAR-${Math.floor(Math.random() * 9000) + 1000}`;
        mc.csrNumber = `CSR-${Math.floor(Math.random() * 9000) + 1000}`;
        mc.crNumber = `CR-${Math.floor(Math.random() * 9000) + 1000}`;
        return mc;
    }
    
    // 2. Set 5 Motorcycles to "Ready to Register"
    motorcycles.slice(5, 10).forEach(mc => {
        fillOutDetails(mc);
        mc.status = 'Ready to Register';
    });

    // 3. Create 10 Endorsements to Bryle, 2 MCs each, for a total of 20 MCs
    // These are motorcycles from index 10 to 29
    const mcsForEndorsement = motorcycles.slice(10); 
    for (let i = 0; i < 10; i++) {
        const mc1 = mcsForEndorsement[i * 2];
        const mc2 = mcsForEndorsement[i * 2 + 1];
        
        // Vary the dates, making the first 3 recent
        const daysAgo = (i < 3) ? (i * 2) + 1 : (i * 5) + 8;

        // First MC of endorsement is ready, second is incomplete
        fillOutDetails(mc1);
        mc1.status = 'Endorsed - Ready';
        mc1.assignedLiaison = DEMO_LIAISON.name;
        
        mc2.status = 'Endorsed - Incomplete';
        mc2.assignedLiaison = DEMO_LIAISON.name;

        const endorsement: Endorsement = {
            id: `ENDO-2407-${i.toString().padStart(3, '0')}`,
            transactionDate: addDays(today, -daysAgo),
            liaisonId: DEMO_LIAISON.id,
            liaisonName: DEMO_LIAISON.name,
            motorcycleIds: [mc1.id, mc2.id],
            createdBy: i % 2 === 0 ? SUPERVISOR_NAME : CASHIER_NAME,
            remarks: "Generated for mock data"
        };
        endorsements.push(endorsement);
    }

    // 4. Create CAs for some endorsed units to move them to "Processing"
    // Use an older endorsement to create a CA
    const endorsementForCA1 = endorsements.find(e => e.id === 'ENDO-2407-04')!;
    const mcsForCA1 = endorsementForCA1.motorcycleIds;
    const ca1: CashAdvance = {
        id: 'ca-072024-001',
        personnel: DEMO_LIAISON.name,
        personnelBranch: DEMO_LIAISON.assignedBranch,
        purpose: `Cash advance for registration of ${mcsForCA1.length} units.`,
        amount: mcsForCA1.length * (DEMO_LIAISON.processingFee + DEMO_LIAISON.orFee),
        date: addDays(today, -8),
        status: 'CV Released',
        motorcycleIds: mcsForCA1,
        checkVoucherNumber: 'CV-2024-07-010',
        checkVoucherReleaseDate: addDays(today, -7)
    };
    cashAdvances.push(ca1);
    mcsForCA1.forEach(mcId => {
        const mc = motorcycles.find(m => m.id === mcId)!;
        mc.status = 'Processing';
    });
    
    // 5. Create a liquidated CA to move some units to "For Review"
    const endorsementForCA2 = endorsements.find(e => e.id === 'ENDO-2407-05')!;
    const mcsForLiquidation = endorsementForCA2.motorcycleIds;
    const ca2: CashAdvance = {
        id: 'ca-071524-002',
        personnel: DEMO_LIAISON.name,
        personnelBranch: DEMO_LIAISON.assignedBranch,
        purpose: `Cash advance for registration of ${mcsForLiquidation.length} units.`,
        amount: mcsForLiquidation.length * (DEMO_LIAISON.processingFee + DEMO_LIAISON.orFee),
        date: addDays(today, -15),
        status: 'Liquidated',
        motorcycleIds: mcsForLiquidation,
        checkVoucherNumber: 'CV-2024-07-005',
        checkVoucherReleaseDate: addDays(today, -14)
    };
    cashAdvances.push(ca2);
    mcsForLiquidation.forEach(mcId => {
        const mc = motorcycles.find(m => m.id === mcId)!;
        mc.status = 'For Review';
        mc.liquidationDetails = {
            parentCaId: ca2.id,
            ltoOrNumber: `LTO-OR-${Math.floor(Math.random() * 90000)}`,
            ltoOrAmount: DEMO_LIAISON.orFee,
            ltoProcessFee: DEMO_LIAISON.processingFee,
            totalLiquidation: DEMO_LIAISON.orFee + DEMO_LIAISON.processingFee,
            shortageOverage: 0,
            remarks: 'Full Liquidation Complete',
            liquidatedBy: DEMO_LIAISON.name,
            liquidationDate: addDays(today, -12)
        };
    });

    return { motorcycles, endorsements, cashAdvances };
};


const MC_KEY = 'lto_motorcycles';
const CA_KEY = 'lto_cash_advances';
const ENDO_KEY = 'lto_endorsements';
const DATA_FLAG = 'data_generated_flag_v6'; // Increment version to force reset

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
                window.location.reload();
            }
        }
    }
};

initializeData();

const getData = <T,>(key: string): T[] => {
    if (typeof window === 'undefined') {
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
