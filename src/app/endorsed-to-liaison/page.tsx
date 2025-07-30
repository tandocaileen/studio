'use client';

import * as React from 'react';
import { Header } from "@/components/layout/header";
import { ProtectedPage } from "@/components/auth/protected-page";
import { getEndorsements, getMotorcycles, updateMotorcycles } from '@/lib/data';
import { Endorsement, Motorcycle } from '@/types';
import { AppLoader } from '@/components/layout/loader';
import { useAuth } from '@/context/AuthContext';
import { LiaisonEndorsementTable } from '@/components/dashboard/liaison-endorsement-table';

function EndorsedContent({ searchQuery }: { searchQuery: string }) {
    const [motorcycles, setMotorcycles] = React.useState<Motorcycle[] | null>(null);
    const [endorsements, setEndorsements] = React.useState<Endorsement[] | null>(null);
    
    const { user } = useAuth();

    React.useEffect(() => {
        if (user) {
            Promise.all([
                getMotorcycles(),
                getEndorsements()
            ]).then(([motorcycleData, endorsementData]) => {
                setEndorsements(endorsementData.filter(e => e.liaisonName === user.name));
                setMotorcycles(motorcycleData);
            });
        }
    }, [user]);

    if (!user || !motorcycles || !endorsements) {
        return <AppLoader />;
    }

    const handleStateUpdate = async (updatedOrNewMotorcycles: Motorcycle | Motorcycle[]) => {
        await updateMotorcycles(updatedOrNewMotorcycles);
        const [updatedMotorcycleData, updatedEndorsementData] = await Promise.all([
            getMotorcycles(),
            getEndorsements()
        ]);
        if (user) {
            setEndorsements(updatedEndorsementData.filter(e => e.liaisonName === user.name));
        }
        setMotorcycles(updatedMotorcycleData);
    };

    return (
        <LiaisonEndorsementTable 
            endorsements={endorsements}
            motorcycles={motorcycles}
            onStateChange={handleStateUpdate}
            searchQuery={searchQuery}
        />
    );
}

export default function EndorsedToLiaisonPage() {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <ProtectedPage allowedRoles={['Liaison']}>
            <div className='w-full'>
                <Header title="My Endorsements" onSearch={setSearchQuery}/>
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                    <EndorsedContent searchQuery={searchQuery} />
                </main>
            </div>
        </ProtectedPage>
    );
}
