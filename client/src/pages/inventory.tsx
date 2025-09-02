import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Edit, Trash2, Package, DollarSign, AlertTriangle, Drill, Bolt } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithCategory } from "@shared/schema";

export default function Inventory() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    status: "all",
  });

  const { data: products, isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  const { data: lowStockProducts } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products/low-stock"],
  });

  const filteredProducts = products?.filter((product) => {
    if (filters.category && filters.category !== "all" && product.categoryId !== filters.category) return false;
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !product.code.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && filters.status !== "all") {
      if (filters.status === "low-stock" && product.quantity > product.minStock) return false;
      if (filters.status === "in-stock" && product.quantity <= product.minStock) return false;
      if (filters.status === "out-of-stock" && product.quantity > 0) return false;
    }
    return true;
  });

  const getStockStatus = (product: ProductWithCategory) => {
    if (product.quantity === 0) return "out-of-stock";
    if (product.quantity <= product.minStock) return "low";
    return "high";
  };

  const getStockStatusText = (product: ProductWithCategory) => {
    if (product.quantity === 0) return "Sem Estoque";
    if (product.quantity <= product.minStock) return "Estoque Baixo";
    return "Em Estoque";
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  // Calculate inventory stats
  const totalProducts = products?.reduce((sum, product) => sum + product.quantity, 0) || 0;
  const totalValue = products?.reduce((sum, product) => sum + (product.quantity * parseFloat(product.unitPrice)), 0) || 0;
  const outOfStockItems = products?.filter(product => product.quantity === 0).length || 0;

  return (
    <MainLayout
      title="Controle de Estoque"
      subtitle="Gerencie todo o inventário do almoxarifado"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Controle de Estoque</h3>
          <p className="text-muted-foreground">Gerencie todo o inventário do almoxarifado</p>
        </div>
        <Link href="/inventory/add">
          <Button data-testid="button-new-product">
            <Plus className="mr-2" size={16} />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Total de Produtos"
          value={totalProducts}
          icon={Package}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatsCard
          title="Valor Total"
          value={formatCurrency(totalValue.toString())}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatsCard
          title="Itens em Falta"
          value={outOfStockItems}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category-filter">Categoria</Label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="cat-tools">Ferramentas</SelectItem>
                  <SelectItem value="cat-fixing">Fixação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search-filter">Buscar</Label>
              <Input
                id="search-filter"
                placeholder="Nome ou código..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                data-testid="input-search-filter"
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in-stock">Em Estoque</SelectItem>
                  <SelectItem value="low-stock">Estoque Baixo</SelectItem>
                  <SelectItem value="out-of-stock">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full" 
                data-testid="button-apply-filters"
                onClick={() => {
                  // Filtros já são aplicados automaticamente através do estado
                  toast({
                    title: "Filtros aplicados",
                    description: "A lista foi atualizada com os filtros selecionados.",
                  });
                }}
              >
                <Search className="mr-2" size={16} />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts?.length ? (
                filteredProducts.map((product) => {
                  const Icon = product.name.toLowerCase().includes("furadeira") ? Drill : Bolt;
                  const iconColor = product.name.toLowerCase().includes("furadeira") ? "text-blue-600" : "text-red-600";
                  const iconBgColor = product.name.toLowerCase().includes("furadeira") ? "bg-blue-100" : "bg-red-100";

                  return (
                    <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
                            <Icon className={iconColor} size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{product.code}</TableCell>
                      <TableCell className="text-foreground">{product.category?.name || "-"}</TableCell>
                      <TableCell className="text-foreground">{product.quantity}</TableCell>
                      <TableCell className="text-foreground">{formatCurrency(product.unitPrice)}</TableCell>
                      <TableCell>
                        <StatusBadge status={getStockStatusText(product)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-view-product-${product.id}`}
                            onClick={() => {
                              toast({
                                title: "Visualizar Produto",
                                description: `Visualizando: ${product.name}`,
                              });
                            }}
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-edit-product-${product.id}`}
                            onClick={() => {
                              toast({
                                title: "Editar Produto",
                                description: `Editando: ${product.name}`,
                              });
                            }}
                          >
                            <Edit size={16} className="text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-product-${product.id}`}
                            onClick={() => {
                              toast({
                                title: "Excluir Produto",
                                description: `Produto ${product.name} será excluído.`,
                                variant: "destructive",
                              });
                            }}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </MainLayout>
  );
}
