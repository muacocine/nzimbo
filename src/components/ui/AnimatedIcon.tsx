import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Import video icons
import iconConecte from '@/assets/icons/conecte-se.mp4';
import iconConta from '@/assets/icons/conta.mp4';
import iconUtilizador from '@/assets/icons/do-utilizador.mp4';
import iconIdeia from '@/assets/icons/ideia.mp4';
import iconCracha from '@/assets/icons/cracha.mp4';
import iconQueda from '@/assets/icons/queda-de-braco.mp4';

export type IconType = 'conecte' | 'conta' | 'utilizador' | 'ideia' | 'cracha' | 'queda';

const iconMap: Record<IconType, string> = {
  conecte: iconConecte,
  conta: iconConta,
  utilizador: iconUtilizador,
  ideia: iconIdeia,
  cracha: iconCracha,
  queda: iconQueda,
};

interface AnimatedIconProps {
  icon: IconType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  loop?: boolean;
  autoPlay?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function AnimatedIcon({ 
  icon, 
  size = 'md', 
  className,
  loop = true,
  autoPlay = true 
}: AnimatedIconProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    }
  }, [autoPlay]);

  return (
    <video
      ref={videoRef}
      src={iconMap[icon]}
      className={cn(sizeClasses[size], 'object-contain', className)}
      loop={loop}
      muted
      playsInline
      autoPlay={autoPlay}
    />
  );
}
