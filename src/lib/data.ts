
import type { Motorcycle, CashAdvance, LiaisonUser, Endorsement } from '@/types';

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- SINGLE LIAISON ---
const SINGLE_LIAISON_USER: LiaisonUser = { id: 'user-001', name: 'Bryle Nikko Hamili', assignedBranch: 'CEBU', processingFee: 1500, orFee: 1000 };


const initialMotorcycles: Motorcycle[] = [];

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
        // To ensure a clean slate, we directly set the initial (empty) data.
        // This effectively clears localStorage for this key on app load.
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
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
    
    // Since getData now resets, we need to read what's currently in memory for the session
    const stored = localStorage.getItem(MC_KEY);
    const allMotorcycles = stored ? JSON.parse(stored) : [];

    const motorcyclesMap = new Map(allMotorcycles.map((m: Motorcycle) => [m.id, m]));
    
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
    const stored = localStorage.getItem(CA_KEY);
    const allCAs = stored ? JSON.parse(stored) : [];
    saveData(CA_KEY, [...allCAs, newAdvance]);
}

export async function updateCashAdvances(updatedCAs: CashAdvance | CashAdvance[]) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const stored = localStorage.getItem(CA_KEY);
    const allCAs = stored ? JSON.parse(stored) : [];
    const caMap = new Map(allCAs.map((ca: CashAdvance) => [ca.id, ca]));

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
    const stored = localStorage.getItem(ENDO_KEY);
    const allEndorsements = stored ? JSON.parse(stored) : [];
    saveData(ENDO_KEY, [...allEndorsements, newEndorsement]);
}

export function getBranches() {
  return [...new Set(initialLiaisonUsers.map(l => l.assignedBranch))];
}
