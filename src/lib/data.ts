
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
    // --- Set 1: For Endorsement ENDO-24-001 ---
    {
        id: 'mc-001', make: 'Honda', model: 'Click 125i', year: 2024, color: 'Red', plateNumber: 'TBA-001', engineNumber: 'ENG001', chassisNumber: 'CHS001', assignedBranch: 'CEBU', purchaseDate: addDays(today, -60), supplier: 'Honda Prestige',
        status: 'Endorsed - Ready', customerName: 'Andres Bonifacio', salesInvoiceNo: 'SI-001', accountCode: 'AC-001', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-001', policyNumber: 'POL-001', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -60), insuranceExpirationDate: addDays(today, 305), hpgControlNumber: 'HPG-001', sarCode: 'SAR-001', crNumber: 'CR-001', csrNumber: 'CSR-001'
    },
    {
        id: 'mc-002', make: 'Honda', model: 'Beat Street', year: 2024, color: 'Black', plateNumber: 'TBA-002', engineNumber: 'ENG002', chassisNumber: 'CHS002', assignedBranch: 'CEBU', purchaseDate: addDays(today, -58), supplier: 'Honda Prestige',
        status: 'Endorsed - Incomplete', customerName: 'Apolinario Mabini', salesInvoiceNo: 'SI-002', accountCode: 'AC-002', assignedLiaison: 'Bryle Nikko Hamili'
    },
    // --- Set 2: For Endorsement ENDO-24-002 ---
    {
        id: 'mc-003', make: 'Yamaha', model: 'Mio Aerox', year: 2024, color: 'Blue', plateNumber: 'TBA-003', engineNumber: 'ENG003', chassisNumber: 'CHS003', assignedBranch: 'CEBU', purchaseDate: addDays(today, -55), supplier: 'Yamaha Motors',
        status: 'Processing', customerName: 'Emilio Jacinto', salesInvoiceNo: 'SI-003', accountCode: 'AC-003', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-003', policyNumber: 'POL-003', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -55), insuranceExpirationDate: addDays(today, 310), hpgControlNumber: 'HPG-003', sarCode: 'SAR-003', crNumber: 'CR-003', csrNumber: 'CSR-003'
    },
    {
        id: 'mc-004', make: 'Yamaha', model: 'NMAX 155', year: 2023, color: 'Gunmetal', plateNumber: 'TBA-004', engineNumber: 'ENG004', chassisNumber: 'CHS004', assignedBranch: 'CEBU', purchaseDate: addDays(today, -54), supplier: 'Yamaha Motors',
        status: 'Processing', customerName: 'Gregorio del Pilar', salesInvoiceNo: 'SI-004', accountCode: 'AC-004', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-004', policyNumber: 'POL-004', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -54), insuranceExpirationDate: addDays(today, 311), hpgControlNumber: 'HPG-004', sarCode: 'SAR-004', crNumber: 'CR-004', csrNumber: 'CSR-004'
    },
    // --- Set 3: For Endorsement ENDO-24-003 (Liquidated) ---
    {
        id: 'mc-005', make: 'Suzuki', model: 'Raider R150', year: 2024, color: 'Yellow', plateNumber: 'TBA-005', engineNumber: 'ENG005', chassisNumber: 'CHS005', assignedBranch: 'CEBU', purchaseDate: addDays(today, -50), supplier: 'Suzuki Motors',
        status: 'For Review', customerName: 'Juan Luna', salesInvoiceNo: 'SI-005', accountCode: 'AC-005', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-005', policyNumber: 'POL-005', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -50), insuranceExpirationDate: addDays(today, 315), hpgControlNumber: 'HPG-005', sarCode: 'SAR-005', crNumber: 'CR-005', csrNumber: 'CSR-005',
        liquidationDetails: { ltoOrNumber: 'LTO-OR-001', ltoOrAmount: 1800, ltoProcessFee: 500, totalLiquidation: 2300, shortageOverage: 200, remarks: 'Full Liquidation', liquidatedBy: 'Bryle Nikko Hamili', liquidationDate: addDays(today, -2), parentCaId: 'ca-072024-003' }
    },
    {
        id: 'mc-006', make: 'Suzuki', model: 'Burgman Street', year: 2024, color: 'White', plateNumber: 'TBA-006', engineNumber: 'ENG006', chassisNumber: 'CHS006', assignedBranch: 'CEBU', purchaseDate: addDays(today, -48), supplier: 'Suzuki Motors',
        status: 'For Review', customerName: 'Antonio Luna', salesInvoiceNo: 'SI-006', accountCode: 'AC-006', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-006', policyNumber: 'POL-006', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -48), insuranceExpirationDate: addDays(today, 317), hpgControlNumber: 'HPG-006', sarCode: 'SAR-006', crNumber: 'CR-006', csrNumber: 'CSR-006',
        liquidationDetails: { ltoOrNumber: 'LTO-OR-002', ltoOrAmount: 1900, ltoProcessFee: 500, totalLiquidation: 2400, shortageOverage: 100, remarks: 'Full Liquidation', liquidatedBy: 'Bryle Nikko Hamili', liquidationDate: addDays(today, -2), parentCaId: 'ca-072024-003' }
    },
    // --- Set 4: For Endorsement ENDO-24-004 (CA Status: CV Released) ---
    {
        id: 'mc-007', make: 'Kawasaki', model: 'Dominar 400', year: 2023, color: 'Green', plateNumber: 'TBA-007', engineNumber: 'ENG007', chassisNumber: 'CHS007', assignedBranch: 'CEBU', purchaseDate: addDays(today, -45), supplier: 'Kawasaki Leisure Bikes',
        status: 'Processing', customerName: 'Marcelo H. del Pilar', salesInvoiceNo: 'SI-007', accountCode: 'AC-007', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-007', policyNumber: 'POL-007', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -45), insuranceExpirationDate: addDays(today, 320), hpgControlNumber: 'HPG-007', sarCode: 'SAR-007', crNumber: 'CR-007', csrNumber: 'CSR-007'
    },
    {
        id: 'mc-008', make: 'Kawasaki', model: 'Ninja 400', year: 2024, color: 'KRT Edition', plateNumber: 'TBA-008', engineNumber: 'ENG008', chassisNumber: 'CHS008', assignedBranch: 'CEBU', purchaseDate: addDays(today, -42), supplier: 'Kawasaki Leisure Bikes',
        status: 'Processing', customerName: 'Graciano López Jaena', salesInvoiceNo: 'SI-008', accountCode: 'AC-008', assignedLiaison: 'Bryle Nikko Hamili',
        cocNumber: 'COC-008', policyNumber: 'POL-008', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -42), insuranceExpirationDate: addDays(today, 323), hpgControlNumber: 'HPG-008', sarCode: 'SAR-008', crNumber: 'CR-008', csrNumber: 'CSR-008'
    },
    // --- Set 5: Ready to Register (Not Yet Endorsed) ---
    {
        id: 'mc-009', make: 'Honda', model: 'CBR150R', year: 2024, color: 'Tricolor', plateNumber: 'TBA-009', engineNumber: 'ENG009', chassisNumber: 'CHS009', assignedBranch: 'CEBU', purchaseDate: addDays(today, -40), supplier: 'Honda Prestige',
        status: 'Ready to Register', customerName: 'Jose Rizal', salesInvoiceNo: 'SI-009', accountCode: 'AC-009',
        cocNumber: 'COC-009', policyNumber: 'POL-009', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -40), insuranceExpirationDate: addDays(today, 325), hpgControlNumber: 'HPG-009', sarCode: 'SAR-009', crNumber: 'CR-009', csrNumber: 'CSR-009'
    },
    {
        id: 'mc-010', make: 'Yamaha', model: 'YZF-R15', year: 2023, color: 'Racing Blue', plateNumber: 'TBA-010', engineNumber: 'ENG010', chassisNumber: 'CHS010', assignedBranch: 'CEBU', purchaseDate: addDays(today, -38), supplier: 'Yamaha Motors',
        status: 'Ready to Register', customerName: 'Melchora Aquino', salesInvoiceNo: 'SI-010', accountCode: 'AC-010',
        cocNumber: 'COC-010', policyNumber: 'POL-010', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -38), insuranceExpirationDate: addDays(today, 327), hpgControlNumber: 'HPG-010', sarCode: 'SAR-010', crNumber: 'CR-010', csrNumber: 'CSR-010'
    },
    // --- Set 6: Incomplete (Not Yet Endorsed) ---
    {
        id: 'mc-011', make: 'Honda', model: 'PCX160', year: 2024, color: 'Matte Grey', plateNumber: 'TBA-011', engineNumber: 'ENG011', chassisNumber: 'CHS011', assignedBranch: 'CEBU', purchaseDate: addDays(today, -35), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Teresa Magbanua', salesInvoiceNo: 'SI-011', accountCode: 'AC-011'
    },
    {
        id: 'mc-012', make: 'Suzuki', model: 'Gixxer 250', year: 2023, color: 'Metallic Triton Blue', plateNumber: 'TBA-012', engineNumber: 'ENG012', chassisNumber: 'CHS012', assignedBranch: 'CEBU', purchaseDate: addDays(today, -32), supplier: 'Suzuki Motors',
        status: 'Incomplete', customerName: 'Gabriela Silang', salesInvoiceNo: 'SI-012', accountCode: 'AC-012'
    },
    // --- More Motorcycles for variety ---
    {
        id: 'mc-013', make: 'KTM', model: 'Duke 200', year: 2024, color: 'Orange', plateNumber: 'TBA-013', engineNumber: 'ENG013', chassisNumber: 'CHS013', assignedBranch: 'CEBU', purchaseDate: addDays(today, -30), supplier: 'KTM Cebu',
        status: 'Ready to Register', customerName: 'Sultan Kudarat', salesInvoiceNo: 'SI-013', accountCode: 'AC-013',
        cocNumber: 'COC-013', policyNumber: 'POL-013', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -30), insuranceExpirationDate: addDays(today, 335), hpgControlNumber: 'HPG-013', sarCode: 'SAR-013', crNumber: 'CR-013', csrNumber: 'CSR-013'
    },
    {
        id: 'mc-014', make: 'Honda', model: 'XR150L', year: 2023, color: 'Red', plateNumber: 'TBA-014', engineNumber: 'ENG014', chassisNumber: 'CHS014', assignedBranch: 'CEBU', purchaseDate: addDays(today, -28), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Rajah Sulayman', salesInvoiceNo: 'SI-014', accountCode: 'AC-014'
    },
    {
        id: 'mc-015', make: 'Yamaha', model: 'PG-1', year: 2024, color: 'Sand', plateNumber: 'TBA-015', engineNumber: 'ENG015', chassisNumber: 'CHS015', assignedBranch: 'CEBU', purchaseDate: addDays(today, -25), supplier: 'Yamaha Motors',
        status: 'Ready to Register', customerName: 'Francisco Dagohoy', salesInvoiceNo: 'SI-015', accountCode: 'AC-015',
        cocNumber: 'COC-015', policyNumber: 'POL-015', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -25), insuranceExpirationDate: addDays(today, 340), hpgControlNumber: 'HPG-015', sarCode: 'SAR-015', crNumber: 'CR-015', csrNumber: 'CSR-015'
    },
    {
        id: 'mc-016', make: 'Honda', model: 'ADV 160', year: 2024, color: 'Pearl White', plateNumber: 'TBA-016', engineNumber: 'ENG016', chassisNumber: 'CHS016', assignedBranch: 'CEBU', purchaseDate: addDays(today, -22), supplier: 'Honda Prestige',
        status: 'Incomplete', customerName: 'Diego Silang', salesInvoiceNo: 'SI-016', accountCode: 'AC-016'
    },
    {
        id: 'mc-017', make: 'Suzuki', model: 'Skydrive Sport', year: 2023, color: 'Pink', plateNumber: 'TBA-017', engineNumber: 'ENG017', chassisNumber: 'CHS017', assignedBranch: 'CEBU', purchaseDate: addDays(today, -20), supplier: 'Suzuki Motors',
        status: 'Ready to Register', customerName: 'Panday Pira', salesInvoiceNo: 'SI-017', accountCode: 'AC-017',
        cocNumber: 'COC-017', policyNumber: 'POL-017', insuranceType: 'TPL', insuranceEffectiveDate: addDays(today, -20), insuranceExpirationDate: addDays(today, 345), hpgControlNumber: 'HPG-017', sarCode: 'SAR-017', crNumber: 'CR-017', csrNumber: 'CSR-017'
    },
    {
        id: 'mc-018', make: 'Yamaha', model: 'Sniper 155R', year: 2024, color: 'Cyan', plateNumber: 'TBA-018', engineNumber: 'ENG018', chassisNumber: 'CHS018', assignedBranch: 'CEBU', purchaseDate: addDays(today, -18), supplier: 'Yamaha Motors',
        status: 'Incomplete', customerName: 'Mariano Ponce', salesInvoiceNo: 'SI-018', accountCode: 'AC-018'
    },
    {
        id: 'mc-019', make: 'Honda', model: 'Airblade 160', year: 2023, color: 'Matte Blue', plateNumber: 'TBA-019', engineNumber: 'ENG019', chassisNumber: 'CHS019', assignedBranch: 'CEBU', purchaseDate: addDays(today, -15), supplier: 'Honda Prestige',
        status: 'Ready to Register', customerName: 'Jose Abad Santos', salesInvoiceNo: 'SI-019', accountCode: 'AC-019',
        cocNumber: 'COC-019', policyNumber: 'POL-019', insuranceType: 'Comprehensive', insuranceEffectiveDate: addDays(today, -15), insuranceExpirationDate: addDays(today, 350), hpgControlNumber: 'HPG-019', sarCode: 'SAR-019', crNumber: 'CR-019', csrNumber: 'CSR-019'
    },
    {
        id: 'mc-020', make: 'Suzuki', model: 'Avenis', year: 2024, color: 'Black', plateNumber: 'TBA-020', engineNumber: 'ENG020', chassisNumber: 'CHS020', assignedBranch: 'CEBU', purchaseDate: addDays(today, -12), supplier: 'Suzuki Motors',
        status: 'Incomplete', customerName: 'Claro M. Recto', salesInvoiceNo: 'SI-020', accountCode: 'AC-020'
    },
];

const initialEndorsements: Endorsement[] = [
    { id: 'ENDO-24-001', transactionDate: addDays(today, -20), liaisonId: 'user-001', liaisonName: 'Bryle Nikko Hamili', createdBy: 'Demo Store Supervisor', motorcycleIds: ['mc-001', 'mc-002'], remarks: 'Please prioritize MC-001.' },
    { id: 'ENDO-24-002', transactionDate: addDays(today, -18), liaisonId: 'user-001', liaisonName: 'Bryle Nikko Hamili', createdBy: 'Demo Cashier', motorcycleIds: ['mc-003', 'mc-004'], remarks: 'Standard processing.' },
    { id: 'ENDO-24-003', transactionDate: addDays(today, -15), liaisonId: 'user-001', liaisonName: 'Bryle Nikko Hamili', createdBy: 'Demo Store Supervisor', motorcycleIds: ['mc-005', 'mc-006'] },
    { id: 'ENDO-24-004', transactionDate: addDays(today, -12), liaisonId: 'user-001', liaisonName: 'Bryle Nikko Hamili', createdBy: 'Demo Cashier', motorcycleIds: ['mc-007', 'mc-008'], remarks: 'For Dominar, check papers carefully.' },
];

const initialCashAdvances: CashAdvance[] = [
  {
    id: 'ca-072024-001', personnel: 'Bryle Nikko Hamili', purpose: 'Cash advance for registration of 2 units.', amount: 5000.00, date: addDays(today, -10),
    status: 'CV Received', motorcycleIds: ['mc-003', 'mc-004'], // from ENDO-24-002
    checkVoucherNumber: 'CV-2024-07-101', checkVoucherReleaseDate: addDays(today, -8)
  },
  {
    id: 'ca-072024-002', personnel: 'Bryle Nikko Hamili', purpose: 'Cash advance for registration of 2 units.', amount: 5000.00, date: addDays(today, -5),
    status: 'Processing for CV', motorcycleIds: ['mc-007', 'mc-001'] // from ENDO-24-004 and ENDO-24-001
  },
  {
    id: 'ca-072024-003', personnel: 'Bryle Nikko Hamili', purpose: 'Cash advance for registration of 2 units.', amount: 5000.00, date: addDays(today, -8),
    status: 'Liquidated', motorcycleIds: ['mc-005', 'mc-006'], // from ENDO-24-003
    checkVoucherNumber: 'CV-2024-07-102', checkVoucherReleaseDate: addDays(today, -7),
    totalLiquidation: 4700, shortageOverage: 300
  },
   {
    id: 'ca-072024-004', personnel: 'Bryle Nikko Hamili', purpose: 'Cash advance for registration of 1 unit.', amount: 2500.00, date: addDays(today, -4),
    status: 'CV Released', motorcycleIds: ['mc-008'], // from ENDO-24-004
    checkVoucherNumber: 'CV-2024-07-103', checkVoucherReleaseDate: addDays(today, -3)
  }
];

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

    