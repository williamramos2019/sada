import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dayOfWeek = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
  });

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            {title}
          </h2>
          <p className="text-muted-foreground" data-testid="page-subtitle">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="relative p-2 text-muted-foreground hover:text-foreground"
            data-testid="notifications-button"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground capitalize" data-testid="current-date">
              {currentDate}
            </p>
            <p className="text-xs text-muted-foreground capitalize" data-testid="day-of-week">
              {dayOfWeek}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
