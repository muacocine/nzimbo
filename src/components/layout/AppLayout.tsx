import { ReactNode } from 'react';
import { FooterNav } from './FooterNav';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function AppLayout({ children, showFooter = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={showFooter ? 'pb-24' : ''}
      >
        {children}
      </motion.main>
      {showFooter && <FooterNav />}
    </div>
  );
}
