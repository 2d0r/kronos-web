'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useSetSearchParams = () => {

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const setSearchParams = (query: string, term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(query, term);
        replace(`${pathname}?${params.toString()}`);
    }

    return { setSearchParams };
}