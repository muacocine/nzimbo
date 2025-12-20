import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === currentStep
              ? 'w-8 bg-primary'
              : i < currentStep
              ? 'w-2 bg-primary/60'
              : 'w-2 bg-muted'
          )}
        />
      ))}
    </div>
  );
}
