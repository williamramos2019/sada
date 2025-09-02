
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Edit, X, Package, FileText, Clock, DollarSign, AlertTriangle, Calendar, MessageSquare, Download, Filter, Repeat, Star } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RentalWithDetails, Supplier } from "@shared/schema";

export default function Rentals() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: "all",
    supplier: "",
    startDate: "",
    endDate: "",
    equipmentType: "",
    priceRange: "all",
    overdue: false,
  });

  const [returnDialog, setReturnDialog] = useState({
    open: false,
    selectedSupplier: "",
    selectedItems: [] as string[],
  });

  const [renewDialog, setRenewDialog] = useState({
    open: false,
    rental: null as RentalWithDetails | null,
    newEndDate: "",
    additionalDays: 0,
  });

  const [contractDialog, setContractDialog] = useState({
    open: false,
    rental: null as RentalWithDetails | null,
  });

  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    rental: null as RentalWithDetails | null,
    rating: 5,
    comment: "",
  });

  const [notesDialog, setNotesDialog] = useState({
    open: false,
    rental: null as RentalWithDetails | null,
    notes: "",
  });

  const [bulkActions, setBulkActions] = useState({
    selectedRentals: [] as string[],
    showBulkActions: false,
  });

  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: "desc" as "asc" | "desc",
  });

  const [favorites, setFavorites] = useState<string[]>([]);

  const { data: rentals, isLoading } = useQuery<RentalWithDetails[]>({
    queryKey: ["/api/rentals"],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  // 1. Renovação Automática de Locações
  const renewRentalMutation = useMutation({
    mutationFn: async (data: { rentalId: string; newEndDate: string; additionalDays: number }) => {
      const response = await apiRequest("PUT", `/api/rentals/${data.rentalId}/renew`, {
        newEndDate: data.newEndDate,
        additionalDays: data.additionalDays,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Locação renovada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      setRenewDialog({ open: false, rental: null, newEndDate: "", additionalDays: 0 });
    },
  });

  // 2. Sistema de Avaliação de Fornecedores
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rentalId: string; supplierId: string; rating: number; comment: string }) => {
      const response = await apiRequest("POST", "/api/supplier-reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Avaliação enviada com sucesso!",
      });
      setReviewDialog({ open: false, rental: null, rating: 5, comment: "" });
    },
  });

  // 3. Geração de Contratos em PDF
  const generateContractMutation = useMutation({
    mutationFn: async (rentalId: string) => {
      const response = await apiRequest("GET", `/api/rentals/${rentalId}/contract`);
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contrato-locacao.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Sucesso",
        description: "Contrato gerado e baixado!",
      });
    },
  });

  // 4. Histórico de Anotações
  const updateNotesMutation = useMutation({
    mutationFn: async (data: { rentalId: string; notes: string }) => {
      const response = await apiRequest("PUT", `/api/rentals/${data.rentalId}/notes`, {
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Anotações atualizadas!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      setNotesDialog({ open: false, rental: null, notes: "" });
    },
  });

  // 5. Ações em Lote
  const bulkCancelMutation = useMutation({
    mutationFn: async (rentalIds: string[]) => {
      const response = await apiRequest("POST", "/api/rentals/bulk-cancel", { rentalIds });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Locações canceladas em lote!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      setBulkActions({ selectedRentals: [], showBulkActions: false });
    },
  });

  const returnEquipmentMutation = useMutation({
    mutationFn: async (data: { supplierName: string; items: string[] }) => {
      const response = await apiRequest("POST", "/api/rentals/return", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Equipamentos devolvidos com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      setReturnDialog({ open: false, selectedSupplier: "", selectedItems: [] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao devolver equipamentos",
        variant: "destructive",
      });
    },
  });

  // 6. Filtros Avançados com Múltiplos Critérios
  const filteredRentals = rentals?.filter((rental) => {
    if (filters.status && filters.status !== "all" && rental.status !== filters.status) return false;
    if (filters.supplier && !rental.supplier?.name?.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
    if (filters.startDate && !rental.startDate.toString().includes(filters.startDate)) return false;
    if (filters.endDate && !rental.endDate.toString().includes(filters.endDate)) return false;
    if (filters.equipmentType && !rental.equipmentType?.toLowerCase().includes(filters.equipmentType.toLowerCase())) return false;
    if (filters.overdue && rental.status !== "overdue") return false;
    
    // Price range filter
    if (filters.priceRange !== "all") {
      const amount = parseFloat(rental.totalAmount);
      switch (filters.priceRange) {
        case "0-100": if (amount > 100) return false; break;
        case "100-500": if (amount < 100 || amount > 500) return false; break;
        case "500-1000": if (amount < 500 || amount > 1000) return false; break;
        case "1000+": if (amount < 1000) return false; break;
      }
    }
    
    return true;
  });

  // 7. Ordenação Personalizável
  const sortedRentals = filteredRentals?.sort((a, b) => {
    const aValue = a[sortConfig.field as keyof RentalWithDetails];
    const bValue = b[sortConfig.field as keyof RentalWithDetails];
    
    if (sortConfig.direction === "asc") {
      return aValue < bValue ? -1 : 1;
    }
    return aValue > bValue ? -1 : 1;
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const getActiveRentalsBySupplier = (supplierName: string) => {
    return filteredRentals?.filter(
      rental => rental.supplier.name === supplierName && rental.status === "active"
    ) || [];
  };

  const handleReturnEquipment = () => {
    if (returnDialog.selectedSupplier && returnDialog.selectedItems.length > 0) {
      returnEquipmentMutation.mutate({
        supplierName: returnDialog.selectedSupplier,
        items: returnDialog.selectedItems,
      });
    }
  };

  const handleRenewRental = () => {
    if (renewDialog.rental && renewDialog.newEndDate) {
      renewRentalMutation.mutate({
        rentalId: renewDialog.rental.id,
        newEndDate: renewDialog.newEndDate,
        additionalDays: renewDialog.additionalDays,
      });
    }
  };

  const handleSubmitReview = () => {
    if (reviewDialog.rental) {
      submitReviewMutation.mutate({
        rentalId: reviewDialog.rental.id,
        supplierId: reviewDialog.rental.supplierId,
        rating: reviewDialog.rating,
        comment: reviewDialog.comment,
      });
    }
  };

  const handleUpdateNotes = () => {
    if (notesDialog.rental) {
      updateNotesMutation.mutate({
        rentalId: notesDialog.rental.id,
        notes: notesDialog.notes,
      });
    }
  };

  const handleBulkSelect = (rentalId: string, checked: boolean) => {
    if (checked) {
      setBulkActions({
        ...bulkActions,
        selectedRentals: [...bulkActions.selectedRentals, rentalId],
      });
    } else {
      setBulkActions({
        ...bulkActions,
        selectedRentals: bulkActions.selectedRentals.filter(id => id !== rentalId),
      });
    }
  };

  const toggleFavorite = (rentalId: string) => {
    if (favorites.includes(rentalId)) {
      setFavorites(favorites.filter(id => id !== rentalId));
    } else {
      setFavorites([...favorites, rentalId]);
    }
  };

  // 8. Alertas de Vencimento
  const getOverdueRentals = () => {
    const today = new Date();
    return filteredRentals?.filter(rental => {
      const endDate = new Date(rental.endDate);
      return endDate < today && rental.status === "active";
    }) || [];
  };

  const getExpiringRentals = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return filteredRentals?.filter(rental => {
      const endDate = new Date(rental.endDate);
      return endDate <= threeDaysFromNow && endDate >= today && rental.status === "active";
    }) || [];
  };

  // 9. Estatísticas de Gastos
  const getTotalExpenses = () => {
    return filteredRentals?.reduce((sum, rental) => sum + parseFloat(rental.totalAmount), 0) || 0;
  };

  const getAverageRentalValue = () => {
    if (!filteredRentals || filteredRentals.length === 0) return 0;
    return getTotalExpenses() / filteredRentals.length;
  };

  const getMostUsedSupplier = () => {
    if (!filteredRentals) return null;
    const supplierCounts = filteredRentals.reduce((acc, rental) => {
      acc[rental.supplier.name] = (acc[rental.supplier.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSupplier = Object.entries(supplierCounts).sort(([,a], [,b]) => b - a)[0];
    return topSupplier ? { name: topSupplier[0], count: topSupplier[1] } : null;
  };

  // 10. Exportação de Relatórios
  const exportToCSV = () => {
    if (!sortedRentals) return;
    
    const csvContent = [
      ["Fornecedor", "Equipamento", "Tipo", "Data Início", "Data Fim", "Valor", "Status", "Período"],
      ...sortedRentals.map(rental => [
        rental.supplier.name,
        rental.equipmentName,
        rental.equipmentType || "",
        formatDate(rental.startDate),
        formatDate(rental.endDate),
        rental.totalAmount,
        rental.status,
        rental.rentalPeriod,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minhas-locacoes.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Sucesso",
      description: "Relatório exportado em CSV!",
    });
  };

  const overdueRentals = getOverdueRentals();
  const expiringRentals = getExpiringRentals();

  return (
    <MainLayout
      title="Minhas Locações"
      subtitle="Equipamentos que você alugou de fornecedores"
    >
      {/* 8. Alertas de Vencimento */}
      {(overdueRentals.length > 0 || expiringRentals.length > 0) && (
        <div className="mb-6 space-y-3">
          {overdueRentals.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle size={20} />
                  <span className="font-medium">
                    {overdueRentals.length} locação(ões) em atraso!
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {expiringRentals.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-yellow-700">
                  <Clock size={20} />
                  <span className="font-medium">
                    {expiringRentals.length} locação(ões) vencem nos próximos 3 dias
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 9. Estatísticas de Gastos */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-lg font-semibold">{formatCurrency(getTotalExpenses().toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Total Locações</p>
                <p className="text-lg font-semibold">{filteredRentals?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="text-purple-600" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Média por Locação</p>
                <p className="text-lg font-semibold">{formatCurrency(getAverageRentalValue().toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Fornecedor Favorito</p>
                <p className="text-lg font-semibold">
                  {getMostUsedSupplier()?.name.substring(0, 12) || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Minhas Locações</h3>
          <p className="text-muted-foreground">Equipamentos que você alugou</p>
        </div>
        <div className="flex space-x-3">
          {/* 5. Ações em Lote */}
          {bulkActions.selectedRentals.length > 0 && (
            <div className="flex space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Cancelar Selecionados ({bulkActions.selectedRentals.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Locações</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar {bulkActions.selectedRentals.length} locação(ões) selecionada(s)?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => bulkCancelMutation.mutate(bulkActions.selectedRentals)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* 10. Exportação de Relatórios */}
          <Button variant="outline" onClick={exportToCSV} data-testid="button-export-csv">
            <Download className="mr-2" size={16} />
            Exportar CSV
          </Button>

          <Dialog open={returnDialog.open} onOpenChange={(open) => setReturnDialog({ ...returnDialog, open })}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-return-equipment">
                <Package className="mr-2" size={16} />
                Devolver Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Devolver Equipamentos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Empresa</Label>
                  <Select 
                    value={returnDialog.selectedSupplier} 
                    onValueChange={(value) => setReturnDialog({ 
                      ...returnDialog, 
                      selectedSupplier: value,
                      selectedItems: []
                    })}
                  >
                    <SelectTrigger data-testid="select-return-supplier">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {returnDialog.selectedSupplier && (
                  <div>
                    <Label>Equipamentos Ativos</Label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-3">
                      {getActiveRentalsBySupplier(returnDialog.selectedSupplier).map((rental) => (
                        <div key={rental.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={rental.id}
                            checked={returnDialog.selectedItems.includes(rental.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setReturnDialog({
                                  ...returnDialog,
                                  selectedItems: [...returnDialog.selectedItems, rental.id]
                                });
                              } else {
                                setReturnDialog({
                                  ...returnDialog,
                                  selectedItems: returnDialog.selectedItems.filter(id => id !== rental.id)
                                });
                              }
                            }}
                            data-testid={`checkbox-return-${rental.id}`}
                          />
                          <Label htmlFor={rental.id} className="text-sm">
                            {rental.equipmentName} - {formatCurrency(rental.totalAmount)}
                          </Label>
                        </div>
                      ))}
                      {getActiveRentalsBySupplier(returnDialog.selectedSupplier).length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Nenhum equipamento ativo desta empresa
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setReturnDialog({ open: false, selectedSupplier: "", selectedItems: [] })}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleReturnEquipment}
                    disabled={returnDialog.selectedItems.length === 0 || returnEquipmentMutation.isPending}
                    data-testid="button-confirm-return"
                  >
                    {returnEquipmentMutation.isPending ? "Devolvendo..." : "Devolver"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/rentals/new">
            <Button data-testid="button-new-rental">
              <Plus className="mr-2" size={16} />
              Nova Locação
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 6. Filtros Avançados */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasadas</SelectItem>
                  <SelectItem value="completed">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="supplier-filter">Fornecedor</Label>
              <Input
                id="supplier-filter"
                placeholder="Buscar fornecedor..."
                value={filters.supplier}
                onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                data-testid="input-supplier-filter"
              />
            </div>
            
            <div>
              <Label htmlFor="equipment-type-filter">Tipo Equipamento</Label>
              <Input
                id="equipment-type-filter"
                placeholder="Buscar tipo..."
                value={filters.equipmentType}
                onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
                data-testid="input-equipment-type-filter"
              />
            </div>
            
            <div>
              <Label htmlFor="price-range-filter">Faixa de Preço</Label>
              <Select 
                value={filters.priceRange} 
                onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
              >
                <SelectTrigger data-testid="select-price-range-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0-100">R$ 0 - R$ 100</SelectItem>
                  <SelectItem value="100-500">R$ 100 - R$ 500</SelectItem>
                  <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                  <SelectItem value="1000+">R$ 1.000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start-date-filter">Data Início</Label>
              <Input
                id="start-date-filter"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                data-testid="input-start-date-filter"
              />
            </div>
            
            <div>
              <Label htmlFor="end-date-filter">Data Fim</Label>
              <Input
                id="end-date-filter"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                data-testid="input-end-date-filter"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdue-filter"
                checked={filters.overdue}
                onCheckedChange={(checked) => setFilters({ ...filters, overdue: !!checked })}
              />
              <Label htmlFor="overdue-filter">Apenas atrasadas</Label>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => setFilters({
                status: "all",
                supplier: "",
                startDate: "",
                endDate: "",
                equipmentType: "",
                priceRange: "all",
                overdue: false,
              })}
              data-testid="button-clear-filters"
            >
              <Filter className="mr-2" size={16} />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 7. Ordenação Personalizável */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label>Ordenar por:</Label>
              <Select 
                value={sortConfig.field} 
                onValueChange={(value) => setSortConfig({ ...sortConfig, field: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Data de Criação</SelectItem>
                  <SelectItem value="startDate">Data de Início</SelectItem>
                  <SelectItem value="endDate">Data de Fim</SelectItem>
                  <SelectItem value="totalAmount">Valor</SelectItem>
                  <SelectItem value="equipmentName">Nome do Equipamento</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortConfig({ 
                  ...sortConfig, 
                  direction: sortConfig.direction === "asc" ? "desc" : "asc" 
                })}
              >
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredRentals?.length || 0} locação(ões) encontrada(s)
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rentals Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={bulkActions.selectedRentals.length === sortedRentals?.length && sortedRentals.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setBulkActions({
                          ...bulkActions,
                          selectedRentals: sortedRentals?.map(r => r.id) || [],
                        });
                      } else {
                        setBulkActions({ ...bulkActions, selectedRentals: [] });
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Favorito</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sortedRentals?.length ? (
                sortedRentals.map((rental) => (
                  <TableRow key={rental.id} data-testid={`rental-row-${rental.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={bulkActions.selectedRentals.includes(rental.id)}
                        onCheckedChange={(checked) => handleBulkSelect(rental.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(rental.id)}
                      >
                        <Star 
                          size={16} 
                          className={favorites.includes(rental.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{rental.supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{rental.supplier.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{rental.equipmentName}</p>
                        <p className="text-sm text-muted-foreground">Tipo: {rental.equipmentType}</p>
                        <p className="text-sm text-muted-foreground">
                          Período: {rental.rentalPeriod === "daily" ? "Diário" : 
                                   rental.rentalPeriod === "weekly" ? "Semanal" :
                                   rental.rentalPeriod === "biweekly" ? "Quinzenal" : 
                                   rental.rentalPeriod === "monthly" ? "Mensal" : rental.rentalPeriod}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{formatDate(rental.startDate)}</TableCell>
                    <TableCell className="text-foreground">
                      {formatDate(rental.endDate)}
                      {new Date(rental.endDate) < new Date() && rental.status === "active" && (
                        <Badge variant="destructive" className="ml-2">Vencido</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(rental.totalAmount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={rental.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-rental-${rental.id}`}
                        >
                          <Eye size={14} className="text-blue-600" />
                        </Button>
                        
                        {/* 1. Renovação de Locações */}
                        {rental.status === "active" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRenewDialog({ 
                                  open: true, 
                                  rental, 
                                  newEndDate: "", 
                                  additionalDays: 0 
                                })}
                              >
                                <Repeat size={14} className="text-green-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Renovar Locação</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Nova Data de Fim</Label>
                                  <Input
                                    type="date"
                                    value={renewDialog.newEndDate}
                                    onChange={(e) => setRenewDialog({ 
                                      ...renewDialog, 
                                      newEndDate: e.target.value 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Dias Adicionais</Label>
                                  <Input
                                    type="number"
                                    value={renewDialog.additionalDays}
                                    onChange={(e) => setRenewDialog({ 
                                      ...renewDialog, 
                                      additionalDays: parseInt(e.target.value) || 0 
                                    })}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setRenewDialog({ open: false, rental: null, newEndDate: "", additionalDays: 0 })}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleRenewRental}>
                                    Renovar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* 3. Geração de Contratos */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateContractMutation.mutate(rental.id)}
                        >
                          <FileText size={14} className="text-purple-600" />
                        </Button>

                        {/* 4. Histórico de Anotações */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setNotesDialog({ 
                                open: true, 
                                rental, 
                                notes: rental.notes || "" 
                              })}
                            >
                              <MessageSquare size={14} className="text-indigo-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Anotações da Locação</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Adicione suas anotações..."
                                value={notesDialog.notes}
                                onChange={(e) => setNotesDialog({ 
                                  ...notesDialog, 
                                  notes: e.target.value 
                                })}
                                rows={4}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setNotesDialog({ open: false, rental: null, notes: "" })}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleUpdateNotes}>
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* 2. Sistema de Avaliação */}
                        {rental.status === "completed" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReviewDialog({ 
                                  open: true, 
                                  rental, 
                                  rating: 5, 
                                  comment: "" 
                                })}
                              >
                                <Star size={14} className="text-yellow-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Avaliar Fornecedor</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Avaliação</Label>
                                  <div className="flex space-x-1 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Button
                                        key={star}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setReviewDialog({ 
                                          ...reviewDialog, 
                                          rating: star 
                                        })}
                                      >
                                        <Star 
                                          size={20} 
                                          className={star <= reviewDialog.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                                        />
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Comentário</Label>
                                  <Textarea
                                    placeholder="Conte como foi sua experiência..."
                                    value={reviewDialog.comment}
                                    onChange={(e) => setReviewDialog({ 
                                      ...reviewDialog, 
                                      comment: e.target.value 
                                    })}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setReviewDialog({ open: false, rental: null, rating: 5, comment: "" })}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleSubmitReview}>
                                    Enviar Avaliação
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {rental.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReturnDialog({
                              open: true,
                              selectedSupplier: rental.supplier.name,
                              selectedItems: [rental.id]
                            })}
                            data-testid={`button-return-rental-${rental.id}`}
                          >
                            <Package size={14} className="text-orange-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-cancel-rental-${rental.id}`}
                          >
                            <X size={14} className="text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhuma locação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {sortedRentals && sortedRentals.length > 10 && (
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando 1-10 de {sortedRentals.length} resultados
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

      {/* 1. Renovação Automática Dialog */}
      <Dialog open={renewDialog.open} onOpenChange={(open) => setRenewDialog({ ...renewDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar Locação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {renewDialog.rental && (
              <div className="p-4 bg-muted rounded">
                <p><strong>Equipamento:</strong> {renewDialog.rental.equipmentName}</p>
                <p><strong>Fornecedor:</strong> {renewDialog.rental.supplier.name}</p>
                <p><strong>Data Atual de Fim:</strong> {formatDate(renewDialog.rental.endDate)}</p>
              </div>
            )}
            <div>
              <Label>Nova Data de Fim</Label>
              <Input
                type="date"
                value={renewDialog.newEndDate}
                onChange={(e) => setRenewDialog({ 
                  ...renewDialog, 
                  newEndDate: e.target.value 
                })}
              />
            </div>
            <div>
              <Label>Dias Adicionais</Label>
              <Input
                type="number"
                placeholder="Quantos dias a mais?"
                value={renewDialog.additionalDays}
                onChange={(e) => setRenewDialog({ 
                  ...renewDialog, 
                  additionalDays: parseInt(e.target.value) || 0 
                })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRenewDialog({ open: false, rental: null, newEndDate: "", additionalDays: 0 })}>
                Cancelar
              </Button>
              <Button onClick={handleRenewRental} disabled={renewRentalMutation.isPending}>
                {renewRentalMutation.isPending ? "Renovando..." : "Renovar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
