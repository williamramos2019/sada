import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <Card data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor}`} size={24} />
          </div>
        </div>
        {(trend || subtitle) && (
          <div className="mt-4 flex items-center text-sm">
            {trend && (
              <>
                <span className={trend.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {trend.value}
                </span>
                <span className="text-muted-foreground ml-1">vs mês anterior</span>
              </>
            )}
            {subtitle && !trend && (
              <span className="text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
