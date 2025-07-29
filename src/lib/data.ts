
import type { Motorcycle, CashAdvance, LiaisonUser, Endorsement } from '@/types';

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- SINGLE LIAISON ---
const SINGLE_LIAISON_USER: LiaisonUser = { id: 'user-001', name: 'Bryle Nikko Hamili', assignedBranch: 'CEBU', processingFee: 1500, orFee: 1000 };


const initialMotorcycles: Motorcycle[] = [
    // 10 'Ready to Register' Motorcycles
    {
        id: 'mc-001', make: 'Honda', model: 'Click 125i', year: 2024, color: 'Red', plateNumber: 'TBA-001', engineNumber: 'ENG001', chassisNumber: 'CHS001', assignedBranch: 'CEBU', purchaseDate: addDays(today, -60), supplier: 'Honda Prestige',
        status: 'Ready to Register', customerName: 'Andres Bonifacio', salesInvoiceNo: 'SI-001', accountCode: 'AC-001',
        cocNumber: 'COC-001', policyNumber: 'POL-001', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -60), insuranceExpirationDate: addDays(today, 305), hpgControlNumber: 'HPG-001', sarCode: 'SAR-001', crNumber: 'CR-001', csrNumber: 'CSR-001', documents: []
    },
    {
        id: 'mc-002', make: 'Honda', model: 'Beat Street', year: 2024, color: 'Black', plateNumber: 'TBA-002', engineNumber: 'ENG002', chassisNumber: 'CHS002', assignedBranch: 'CEBU', purchaseDate: addDays(today, -58), supplier: 'Honda Prestige',
        status: 'Ready to Register', customerName: 'Apolinario Mabini', salesInvoiceNo: 'SI-002', accountCode: 'AC-002',
        cocNumber: 'COC-002', policyNumber: 'POL-002', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -58), insuranceExpirationDate: addDays(today, 307), hpgControlNumber: 'HPG-002', sarCode: 'SAR-002', crNumber: 'CR-002', csrNumber: 'CSR-002', documents: []
    },
    {
        id: 'mc-003', make: 'Yamaha', model: 'Mio Aerox', year: 2024, color: 'Blue', plateNumber: 'TBA-003', engineNumber: 'ENG003', chassisNumber: 'CHS003', assignedBranch: 'CEBU', purchaseDate: addDays(today, -55), supplier: 'Yamaha Motors',
        status: 'Ready to Register', customerName: 'Emilio Jacinto', salesInvoiceNo: 'SI-003', accountCode: 'AC-003',
        cocNumber: 'COC-003', policyNumber: 'POL-003', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -55), insuranceExpirationDate: addDays(today, 310), hpgControlNumber: 'HPG-003', sarCode: 'SAR-003', crNumber: 'CR-003', csrNumber: 'CSR-003', documents: []
    },
    {
        id: 'mc-004', make: 'Yamaha', model: 'NMAX 155', year: 2023, color: 'Gunmetal', plateNumber: 'TBA-004', engineNumber: 'ENG004', chassisNumber: 'CHS004', assignedBranch: 'CEBU', purchaseDate: addDays(today, -54), supplier: 'Yamaha Motors',
        status: 'Ready to Register', customerName: 'Gregorio del Pilar', salesInvoiceNo: 'SI-004', accountCode: 'AC-004',
        cocNumber: 'COC-004', policyNumber: 'POL-004', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -54), insuranceExpirationDate: addDays(today, 311), hpgControlNumber: 'HPG-004', sarCode: 'SAR-004', crNumber: 'CR-004', csrNumber: 'CSR-004', documents: []
    },
    {
        id: 'mc-005', make: 'Suzuki', model: 'Raider R150', year: 2024, color: 'Yellow', plateNumber: 'TBA-005', engineNumber: 'ENG005', chassisNumber: 'CHS005', assignedBranch: 'CEBU', purchaseDate: addDays(today, -50), supplier: 'Suzuki Motors',
        status: 'Ready to Register', customerName: 'Juan Luna', salesInvoiceNo: 'SI-005', accountCode: 'AC-005',
        cocNumber: 'COC-005', policyNumber: 'POL-005', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -50), insuranceExpirationDate: addDays(today, 315), hpgControlNumber: 'HPG-005', sarCode: 'SAR-005', crNumber: 'CR-005', csrNumber: 'CSR-005', documents: []
    },
    {
        id: 'mc-006', make: 'Suzuki', model: 'Burgman Street', year: 2024, color: 'White', plateNumber: 'TBA-006', engineNumber: 'ENG006', chassisNumber: 'CHS006', assignedBranch: 'CEBU', purchaseDate: addDays(today, -48), supplier: 'Suzuki Motors',
        status: 'Ready to Register', customerName: 'Antonio Luna', salesInvoiceNo: 'SI-006', accountCode: 'AC-006',
        cocNumber: 'COC-006', policyNumber: 'POL-006', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -48), insuranceExpirationDate: addDays(today, 317), hpgControlNumber: 'HPG-006', sarCode: 'SAR-006', crNumber: 'CR-006', csrNumber: 'CSR-006', documents: []
    },
    {
        id: 'mc-007', make: 'Kawasaki', model: 'Dominar 400', year: 2023, color: 'Green', plateNumber: 'TBA-007', engineNumber: 'ENG007', chassisNumber: 'CHS007', assignedBranch: 'CEBU', purchaseDate: addDays(today, -45), supplier: 'Kawasaki Leisure Bikes',
        status: 'Ready to Register', customerName: 'Marcelo H. del Pilar', salesInvoiceNo: 'SI-007', accountCode: 'AC-007',
        cocNumber: 'COC-007', policyNumber: 'POL-007', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -45), insuranceExpirationDate: addDays(today, 320), hpgControlNumber: 'HPG-007', sarCode: 'SAR-007', crNumber: 'CR-007', csrNumber: 'CSR-007', documents: []
    },
    {
        id: 'mc-008', make: 'Kawasaki', model: 'Ninja 400', year: 2024, color: 'KRT Edition', plateNumber: 'TBA-008', engineNumber: 'ENG008', chassisNumber: 'CHS008', assignedBranch: 'CEBU', purchaseDate: addDays(today, -42), supplier: 'Kawasaki Leisure Bikes',
        status: 'Ready to Register', customerName: 'Graciano López Jaena', salesInvoiceNo: 'SI-008', accountCode: 'AC-008',
        cocNumber: 'COC-008', policyNumber: 'POL-008', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -42), insuranceExpirationDate: addDays(today, 323), hpgControlNumber: 'HPG-008', sarCode: 'SAR-008', crNumber: 'CR-008', csrNumber: 'CSR-008', documents: []
    },
    {
        id: 'mc-009', make: 'KTM', model: 'Duke 200', year: 2024, color: 'Orange', plateNumber: 'TBA-009', engineNumber: 'ENG009', chassisNumber: 'CHS009', assignedBranch: 'CEBU', purchaseDate: addDays(today, -30), supplier: 'KTM Cebu',
        status: 'Ready to Register', customerName: 'Sultan Kudarat', salesInvoiceNo: 'SI-009', accountCode: 'AC-009',
        cocNumber: 'COC-009', policyNumber: 'POL-009', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -30), insuranceExpirationDate: addDays(today, 335), hpgControlNumber: 'HPG-009', sarCode: 'SAR-009', crNumber: 'CR-009', csrNumber: 'CSR-009', documents: []
    },
    {
        id: 'mc-010', make: 'Yamaha', model: 'YZF-R15', year: 2023, color: 'Racing Blue', plateNumber: 'TBA-010', engineNumber: 'ENG010', chassisNumber: 'CHS010', assignedBranch: 'CEBU', purchaseDate: addDays(today, -38), supplier: 'Yamaha Motors',
        status: 'Ready to Register', customerName: 'Melchora Aquino', salesInvoiceNo: 'SI-010', accountCode: 'AC-010',
        cocNumber: 'COC-010', policyNumber: 'POL-010', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -38), insuranceExpirationDate: addDays(today, 327), hpgControlNumber: 'HPG-010', sarCode: 'SAR-010', crNumber: 'CR-010', csrNumber: 'CSR-010', documents: []
    },
    // 10 'Incomplete' Motorcycles
    {
        id: 'mc-011', make: 'Honda', model: 'PCX160', year: 2024, color: 'Matte Grey', plateNumber: 'TBA-011', engineNumber: 'ENG011', chassisNumber: 'CHS011', assignedBranch: 'CEBU', purchaseDate: addDays(today, -35), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Teresa Magbanua', salesInvoiceNo: 'SI-011', accountCode: 'AC-011', documents: []
    },
    {
        id: 'mc-012', make: 'Suzuki', model: 'Gixxer 250', year: 2023, color: 'Metallic Triton Blue', plateNumber: 'TBA-012', engineNumber: 'ENG012', chassisNumber: 'CHS012', assignedBranch: 'CEBU', purchaseDate: addDays(today, -32), supplier: 'Suzuki Motors',
        status: 'Incomplete', customerName: 'Gabriela Silang', salesInvoiceNo: 'SI-012', accountCode: 'AC-012', documents: []
    },
    {
        id: 'mc-013', make: 'Honda', model: 'CBR150R', year: 2024, color: 'Tricolor', plateNumber: 'TBA-013', engineNumber: 'ENG013', chassisNumber: 'CHS013', assignedBranch: 'CEBU', purchaseDate: addDays(today, -40), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Jose Rizal', salesInvoiceNo: 'SI-013', accountCode: 'AC-013', documents: []
    },
    {
        id: 'mc-014', make: 'Honda', model: 'XR150L', year: 2023, color: 'Red', plateNumber: 'TBA-014', engineNumber: 'ENG014', chassisNumber: 'CHS014', assignedBranch: 'CEBU', purchaseDate: addDays(today, -28), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Rajah Sulayman', salesInvoiceNo: 'SI-014', accountCode: 'AC-014', documents: []
    },
    {
        id: 'mc-015', make: 'Yamaha', model: 'PG-1', year: 2024, color: 'Sand', plateNumber: 'TBA-015', engineNumber: 'ENG015', chassisNumber: 'CHS015', assignedBranch: 'CEBU', purchaseDate: addDays(today, -25), supplier: 'Yamaha Motors',
        status: 'Incomplete', customerName: 'Francisco Dagohoy', salesInvoiceNo: 'SI-015', accountCode: 'AC-015', documents: []
    },
    {
        id: 'mc-016', make: 'Honda', model: 'ADV 160', year: 2024, color: 'Pearl White', plateNumber: 'TBA-016', engineNumber: 'ENG016', chassisNumber: 'CHS016', assignedBranch: 'CEBU', purchaseDate: addDays(today, -22), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Diego Silang', salesInvoiceNo: 'SI-016', accountCode: 'AC-016', documents: []
    },
    {
        id: 'mc-017', make: 'Suzuki', model: 'Skydrive Sport', year: 2023, color: 'Pink', plateNumber: 'TBA-017', engineNumber: 'ENG017', chassisNumber: 'CHS017', assignedBranch: 'CEBU', purchaseDate: addDays(today, -20), supplier: 'Suzuki Motors',
        status: 'Incomplete', customerName: 'Panday Pira', salesInvoiceNo: 'SI-017', accountCode: 'AC-017', documents: []
    },
    {
        id: 'mc-018', make: 'Yamaha', model: 'Sniper 155R', year: 2024, color: 'Cyan', plateNumber: 'TBA-018', engineNumber: 'ENG018', chassisNumber: 'CHS018', assignedBranch: 'CEBU', purchaseDate: addDays(today, -18), supplier: 'Yamaha Motors',
        status: 'Incomplete', customerName: 'Mariano Ponce', salesInvoiceNo: 'SI-018', accountCode: 'AC-018', documents: []
    },
    {
        id: 'mc-019', make: 'Honda', model: 'Airblade 160', year: 2023, color: 'Matte Blue', plateNumber: 'TBA-019', engineNumber: 'ENG019', chassisNumber: 'CHS019', assignedBranch: 'CEBU', purchaseDate: addDays(today, -15), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Jose Abad Santos', salesInvoiceNo: 'SI-019', accountCode: 'AC-019', documents: []
    },
    {
        id: 'mc-020', make: 'Suzuki', model: 'Avenis', year: 2024, color: 'Black', plateNumber: 'TBA-020', engineNumber: 'ENG020', chassisNumber: 'CHS020', assignedBranch: 'CEBU', purchaseDate: addDays(today, -12), supplier: 'Suzuki Motors',
        status: 'Incomplete', customerName: 'Claro M. Recto', salesInvoiceNo: 'SI-020', accountCode: 'AC-020', documents: []
    },
];

const initialEndorsements: Endorsement[] = [];

const initialCashAdvances: CashAdvance[] = [];

const initialLiaisonUsers: LiaisonUser[] = [
    SINGLE_LIAISON_USER,
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
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored, (key, value) => {
                // Reviver to convert ISO strings back to Date objects
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
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
