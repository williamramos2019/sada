import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "ativa":
        return "status-active";
      case "pending":
      case "pendente":
        return "status-pending";
      case "completed":
      case "finalizada":
        return "status-completed";
      case "overdue":
      case "atrasada":
        return "status-overdue";
      case "low":
      case "baixo":
      case "crítico":
        return "status-low";
      case "medium":
      case "médio":
        return "status-medium";
      case "high":
      case "alto":
      case "em estoque":
        return "status-high";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "Ativa";
      case "pending":
        return "Pendente";
      case "completed":
        return "Finalizada";
      case "overdue":
        return "Atrasada";
      case "low":
        return "Estoque Baixo";
      case "medium":
        return "Estoque Médio";
      case "high":
        return "Em Estoque";
      default:
        return status;
    }
  };

  return (
    <span
      className={cn("status-badge", getStatusClass(status), className)}
      data-testid={`status-badge-${status.toLowerCase()}`}
    >
      {getStatusText(status)}
    </span>
  );
}
