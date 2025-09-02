import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Handshake,
  DollarSign,
  Package,
  AlertTriangle,
  Drill,
  Car,
  Hammer,
  Bolt,
  Droplets,
  Settings,
} from "lucide-react";
import type { RentalWithDetails, ProductWithCategory } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentRentals, isLoading: rentalsLoading } = useQuery<RentalWithDetails[]>({
    queryKey: ["/api/rentals/active"],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products/low-stock"],
  });

  if (statsLoading || rentalsLoading || lowStockLoading) {
    return (
      <MainLayout
        title="Painel de Controle"
        subtitle="Suas locações e controle de almoxarifado"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-lg border border-border animate-pulse" />
          ))}
        </div>
      </MainLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <MainLayout
      title="Painel de Controle"
      subtitle="Suas locações e controle de almoxarifado"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Equipamentos Alugados"
          value={(stats as any)?.activeRentals || 0}
          icon={Handshake}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: "+12%", isPositive: true }}
        />
        
        <StatsCard
          title="Gasto Mensal"
          value={formatCurrency((stats as any)?.monthlyRevenue || 0)}
          icon={DollarSign}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          trend={{ value: "+8%", isPositive: false }}
        />
        
        <StatsCard
          title="Produtos em Estoque"
          value={(stats as any)?.productsInStock || 0}
          icon={Package}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={{ value: "-3%", isPositive: false }}
        />
        
        <StatsCard
          title="Itens com Estoque Baixo"
          value={(stats as any)?.lowStockItems || 0}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          subtitle="Requer atenção"
        />
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <Card data-testid="recent-rentals-card">
          <CardHeader>
            <CardTitle>Minhas Locações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRentals?.slice(0, 3).map((rental) => {
                const getProductIcon = (productName: string) => {
                  if (productName.toLowerCase().includes("furadeira")) return Drill;
                  if (productName.toLowerCase().includes("empilhadeira")) return Car;
                  return Hammer;
                };

                const Icon = getProductIcon(rental.equipmentName || "");

                return (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    data-testid={`rental-item-${rental.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{rental.equipmentName}</p>
                        <p className="text-sm text-muted-foreground">Fornecedor: {rental.supplier.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={rental.status} />
                      <p className="text-sm text-muted-foreground mt-1">
                        Até {new Date(rental.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {(!recentRentals || recentRentals.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma locação encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Inventory Alerts */}
        <Card data-testid="inventory-alerts-card">
          <CardHeader>
            <CardTitle>Alertas de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts?.slice(0, 3).map((product) => {
                const getProductIcon = (productName: string) => {
                  if (productName.toLowerCase().includes("parafuso")) return Bolt;
                  if (productName.toLowerCase().includes("óleo")) return Droplets;
                  return Settings;
                };

                const Icon = getProductIcon(product.name);
                const stockStatus = product.quantity <= product.minStock / 2 ? "low" : "medium";

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    data-testid={`alert-item-${product.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        stockStatus === "low" ? "bg-red-100" : "bg-yellow-100"
                      }`}>
                        <Icon className={`${stockStatus === "low" ? "text-red-600" : "text-yellow-600"}`} size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Código: {product.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={stockStatus} />
                      <p className="text-sm text-muted-foreground mt-1">{product.quantity} unidades</p>
                    </div>
                  </div>
                );
              })}
              
              {(!lowStockProducts || lowStockProducts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum alerta de estoque
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
