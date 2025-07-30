
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EndorsedRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/endorsed-to-liaison');
    }, [router]);
    return null;
}
