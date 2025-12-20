import { motion, AnimatePresence } from 'framer-motion';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = usePasswordStrength(password);

  const icons = [ShieldX, ShieldAlert, Shield, ShieldCheck, ShieldCheck];
  const Icon = icons[strength.score];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {/* Strength Bar */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(strength.score + 1) * 20}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('h-full rounded-full transition-colors', strength.color)}
        />
      </div>

      {/* Label and Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn(
            'w-4 h-4',
            strength.score <= 1 ? 'text-destructive' :
            strength.score === 2 ? 'text-yellow-500' :
            'text-green-500'
          )} />
          <span className={cn(
            'text-sm font-medium',
            strength.score <= 1 ? 'text-destructive' :
            strength.score === 2 ? 'text-yellow-500' :
            'text-green-500'
          )}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {strength.feedback.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {strength.feedback.map((tip, i) => (
              <motion.li
                key={tip}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                {tip}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
