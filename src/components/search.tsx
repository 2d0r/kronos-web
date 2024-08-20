'use client';

import { useMindsetColour } from '@/store/store';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

export default function SearchBar({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const mindsetColour = useMindsetColour();

    return (
        <div className="relative flex">
        <label htmlFor="search" className="sr-only peer-focus:outline-none">
            Search
        </label>
        <input
            className="peer block bg-transparent border-0 py-[9px] pl-10 
                text-lg placeholder:text-white placeholder:text-opacity-50 text-white
                focus-peer:border-none focus:!outline-none focus:!border-b focus:!ring-transparent focus:!border-white
                hover:border-x-0 hover:border-t-0 hover:border-b-white
                active:!ring-transparent active:!outline-none"
            placeholder={placeholder}
            // onChange={(e) => {
            //     handleSearch(e.target.value)
            // }}
            defaultValue={searchParams.get('query')?.toString()}
        />
        <MagnifyingGlassIcon color={mindsetColour || 'white'} className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 peer-focus:font-bold" />
        </div>
    );
}