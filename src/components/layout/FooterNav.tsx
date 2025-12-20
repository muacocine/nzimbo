import { motion } from 'framer-motion';
import { Home, Search, User, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Início', path: '/home' },
  { icon: Search, label: 'Explorar', path: '/explore' },
  { icon: User, label: 'Perfil', path: '/profile' },
  { icon: Settings, label: 'Definições', path: '/settings' },
];

export function FooterNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50"
    >
      <div className="flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-col items-center justify-center p-3 min-w-[64px] transition-all duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-12 h-1 rounded-full nzimbo-gradient"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <item.icon className={cn(
                  'w-6 h-6 transition-all duration-300',
                  isActive && 'scale-110'
                )} />
                
                {/* Glow effect when active */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 blur-lg nzimbo-gradient opacity-40"
                  />
                )}
              </motion.div>
              
              <span className={cn(
                'text-xs mt-1 font-medium transition-all duration-300',
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
