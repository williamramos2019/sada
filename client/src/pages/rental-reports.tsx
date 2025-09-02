import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

export default function RentalReports() {
  return (
    <MainLayout
      title="Relatórios de Locação"
      subtitle="Visualize relatórios e análises das locações"
    >
      <div className="space-y-6">
        {/* Report Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtros de Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="customer">Clientes</SelectItem>
                    <SelectItem value="product">Produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  data-testid="input-start-date"
                />
              </div>
              
              <div>
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  data-testid="input-end-date"
                />
              </div>
              
              <div className="flex items-end">
                <Button className="w-full" data-testid="button-generate-report">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">R$ 45.280</p>
                  <p className="text-sm text-muted-foreground">Janeiro 2024</p>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-monthly-revenue">
                  <FileText className="mr-2 w-4 h-4" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Furadeira Industrial</span>
                    <span className="text-sm font-medium">24 locações</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Empilhadeira</span>
                    <span className="text-sm font-medium">18 locações</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Kit Ferramentas</span>
                    <span className="text-sm font-medium">12 locações</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-top-products">
                  <FileText className="mr-2 w-4 h-4" />
                  Ver Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Empresa ABC</span>
                    <span className="text-sm font-medium">R$ 12.500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">João Silva</span>
                    <span className="text-sm font-medium">R$ 8.750</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maria Santos</span>
                    <span className="text-sm font-medium">R$ 6.200</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-top-customers">
                  <FileText className="mr-2 w-4 h-4" />
                  Ver Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                data-testid="button-financial-report"
              >
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span>Relatório Financeiro</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                data-testid="button-performance-report"
              >
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Performance de Produtos</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                data-testid="button-customer-report"
              >
                <FileText className="w-6 h-6 text-purple-600" />
                <span>Análise de Clientes</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                data-testid="button-overdue-report"
              >
                <FileText className="w-6 h-6 text-red-600" />
                <span>Locações Atrasadas</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" data-testid="button-export-pdf">
                <Download className="mr-2 w-4 h-4" />
                Exportar PDF
              </Button>
              
              <Button variant="outline" data-testid="button-export-excel">
                <Download className="mr-2 w-4 h-4" />
                Exportar Excel
              </Button>
              
              <Button variant="outline" data-testid="button-export-csv">
                <Download className="mr-2 w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
