import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const setSearchParams = (query: string, term: string) => {
    'use client';

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const params = new URLSearchParams(searchParams);
    params.set(query, term);
    replace(`${pathname}?${params.toString()}`);
}