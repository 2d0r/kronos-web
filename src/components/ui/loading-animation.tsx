import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion'
import KronosSVG from '../svg/kronos-svg';

export default function LoadingAnimation({mindsetColour} : {mindsetColour?: string}) {
    return (
        <motion.div initial={{ rotate: '0' }} animate={{rotate: '180deg'}} transition={{ repeat: Infinity, duration: 1 }} className='opacity-50'>
            {/* <Image src='/icons/kronos-logo.svg' alt='kronos-logo' width={120} height={120} color={mindsetColour || 'white'} /> */}
            <KronosSVG fill={mindsetColour || 'white'} width='120' height='120'/>
        </motion.div>
    )
}
