import badgeBlue from '@/assets/badge-blue.png';
import badgeBlack from '@/assets/badge-black.png';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  type: 'blue' | 'black';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export function VerifiedBadge({ type, size = 'md', className }: VerifiedBadgeProps) {
  const badge = type === 'blue' ? badgeBlue : badgeBlack;
  
  return (
    <img 
      src={badge} 
      alt="Verificado" 
      className={cn(sizes[size], 'inline-block', className)}
      draggable={false}
    />
  );
}
