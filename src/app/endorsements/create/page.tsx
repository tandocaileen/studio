
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateEndorsementRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/home');
    }, [router]);
    return null;
}
