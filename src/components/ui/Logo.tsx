import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/logo-nzimbo.jpg"
        alt="Nzimbo"
        className={cn(sizes[size], 'rounded-2xl object-cover shadow-nzimbo-sm')}
      />
      {showText && (
        <span className={cn(
          'font-display font-bold nzimbo-gradient-text',
          textSizes[size]
        )}>
          Nzimbo
        </span>
      )}
    </div>
  );
}
