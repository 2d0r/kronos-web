"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className='w-screen h-screen'
    //   initial={{ y: '100vh', opacity: 0, }}
    //   animate={{ y: 0, opacity: 1, }}
    //   transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}