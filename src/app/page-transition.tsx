'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useContext, useRef } from 'react';

function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  if (!frozen) {
    return <>{props.children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

// const variants = {
//   hidden: { opacity: 1, y: 0 },
//   enter: { opacity: 1, y: 0 },
//   exit: { opacity: 1, y: 0 },
// };

const PageTransitionEffect = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        // initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: -200 }}
        // initial="hidden"
        // animate="enter"
        // exit="exit"
        // variants={variants}
        transition={{ ease: 'easeInOut', duration: 0.2 }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransitionEffect;