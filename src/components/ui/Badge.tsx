import { clsx } from 'clsx';

type Variant = 'gold' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'gray';

const variants: Record<Variant, string> = {
  gold: 'bg-ra-gold/15 text-ra-gold border-ra-gold/30',
  blue: 'bg-ra-accent/15 text-ra-accent border-ra-accent/30',
  green: 'bg-ra-green/15 text-ra-green border-ra-green/30',
  purple: 'bg-ra-purple/15 text-ra-purple border-ra-purple/30',
  red: 'bg-ra-red/15 text-ra-red border-ra-red/30',
  orange: 'bg-ra-orange/15 text-ra-orange border-ra-orange/30',
  gray: 'bg-ra-border/50 text-ra-text border-ra-border',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'blue', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
