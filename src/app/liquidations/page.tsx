
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LiquidationsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/completed');
    }, [router]);
    return null;
}
