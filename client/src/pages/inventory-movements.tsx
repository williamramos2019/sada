import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUp, ArrowDown, RotateCcw, Plus, Minus } from "lucide-react";
import type { InventoryMovementWithDetails } from "@shared/schema";

export default function InventoryMovements() {
  const { data: movements, isLoading } = useQuery<InventoryMovementWithDetails[]>({
    queryKey: ["/api/inventory-movements"],
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUp className="text-green-600" size={16} />;
      case "out":
        return <ArrowDown className="text-red-600" size={16} />;
      case "adjustment":
        return <RotateCcw className="text-blue-600" size={16} />;
      default:
        return <RotateCcw className="text-gray-600" size={16} />;
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case "in":
        return "Entrada";
      case "out":
        return "Saída";
      case "adjustment":
        return "Ajuste";
      default:
        return type;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in":
        return "text-green-600";
      case "out":
        return "text-red-600";
      case "adjustment":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MainLayout
      title="Movimentações"
      subtitle="Histórico de entradas e saídas do estoque"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Movimentações de Estoque</h3>
          <p className="text-muted-foreground">Acompanhe todas as movimentações do inventário</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-testid="button-new-entry">
            <Plus className="mr-2" size={16} />
            Nova Entrada
          </Button>
          <Button variant="outline" data-testid="button-new-exit">
            <Minus className="mr-2" size={16} />
            Nova Saída
          </Button>
        </div>
      </div>

      {/* Movement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUp className="text-green-600" size={20} />
              Entradas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-sm text-muted-foreground">movimentações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDown className="text-red-600" size={20} />
              Saídas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">8</p>
            <p className="text-sm text-muted-foreground">movimentações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <RotateCcw className="text-blue-600" size={20} />
              Ajustes Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-sm text-muted-foreground">movimentações</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type-filter">Tipo</Label>
              <Select>
                <SelectTrigger data-testid="select-type-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in">Entrada</SelectItem>
                  <SelectItem value="out">Saída</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-filter">Produto</Label>
              <Input
                id="product-filter"
                placeholder="Nome do produto..."
                data-testid="input-product-filter"
              />
            </div>
            <div>
              <Label htmlFor="date-filter">Data</Label>
              <Input
                id="date-filter"
                type="date"
                data-testid="input-date-filter"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" data-testid="button-apply-filters">
                <Search className="mr-2" size={16} />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Movements Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
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
              ) : movements?.length ? (
                movements.map((movement) => (
                  <TableRow key={movement.id} data-testid={`movement-row-${movement.id}`}>
                    <TableCell className="text-foreground">
                      {formatDate(movement.createdAt!)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{movement.product.name}</p>
                        <p className="text-sm text-muted-foreground">{movement.product.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.type)}
                        <span className={`font-medium ${getMovementColor(movement.type)}`}>
                          {getMovementTypeText(movement.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`font-medium ${getMovementColor(movement.type)}`}>
                      {movement.type === "in" ? "+" : movement.type === "out" ? "-" : "±"}{movement.quantity}
                    </TableCell>
                    <TableCell className="text-foreground">{movement.reason}</TableCell>
                    <TableCell className="text-foreground">{movement.user?.name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{movement.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {movements && movements.length > 10 && (
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando 1-10 de {movements.length} resultados
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" data-testid="button-prev-page">
                Anterior
              </Button>
              <Button variant="default" size="sm" data-testid="button-page-1">1</Button>
              <Button variant="outline" size="sm" data-testid="button-page-2">2</Button>
              <Button variant="outline" size="sm" data-testid="button-page-3">3</Button>
              <Button variant="outline" size="sm" data-testid="button-next-page">
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </MainLayout>
  );
}
