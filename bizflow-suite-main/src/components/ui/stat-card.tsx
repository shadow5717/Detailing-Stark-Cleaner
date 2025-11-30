import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  onClick?: () => void;
}

const variantStyles = {
  default: 'from-secondary to-secondary/80',
  primary: 'from-primary/20 to-primary/10 border-primary/30',
  success: 'from-success/20 to-success/10 border-success/30',
  warning: 'from-warning/20 to-warning/10 border-warning/30',
  accent: 'from-accent/20 to-accent/10 border-accent/30',
};

const iconStyles = {
  default: 'bg-secondary text-muted-foreground',
  primary: 'bg-primary/20 text-primary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  accent: 'bg-accent/20 text-accent',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 card-shine',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  trend.isPositive
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
