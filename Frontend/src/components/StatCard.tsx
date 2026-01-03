import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'success';
}

const StatCard = ({ title, value, description, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    accent: 'bg-accent/5 border-accent/20',
    warning: 'bg-status-pending/5 border-status-pending/20',
    success: 'bg-status-resolved/5 border-status-resolved/20',
  };

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-status-pending/10 text-status-pending',
    success: 'bg-status-resolved/10 text-status-resolved',
  };

  return (
    <div className={cn(
      "relative rounded-xl border p-6 transition-all duration-200 hover:shadow-card",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-status-resolved" : "text-destructive"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
