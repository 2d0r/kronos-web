'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // const handleSearch = useDebouncedCallback((term) => {
    //     const params = new URLSearchParams(searchParams);
    //     params.set('page', '1');
    //     if (term) {
    //         params.set('query', term);
    //     } else {
    //         params.delete('query');
    //     }
    //     replace(`${pathname}?${params.toString()}`);
    // }, 300);

    return (
        <div className="relative w-1/3 max-w-[400px] flex ">
        <label htmlFor="search" className="sr-only peer-focus:outline-none">
            Search
        </label>
        <input
            className="peer block w-full bg-transparent border-x-0 border-t-0 border-b-white py-[9px] pl-10 
                text-lg placeholder:text-slate-100 text-white
                focus-peer:border-none focus:!outline-none focus:!ring-transparent focus:!border-white
                hover:border-x-0 hover:border-t-0 hover:border-b-white
                active:!ring-transparent active:!outline-none"
            placeholder={placeholder}
            // onChange={(e) => {
            //     handleSearch(e.target.value)
            // }}
            defaultValue={searchParams.get('query')?.toString()}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white peer-focus:font-bold" />
        </div>
    );
}