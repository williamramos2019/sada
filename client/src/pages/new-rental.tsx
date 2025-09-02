import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertRentalSchema } from "@shared/schema";
import { useLocation } from "wouter";
import type { Supplier, ProductWithCategory } from "@shared/schema";
import { z } from "zod";

const newRentalSchema = insertRentalSchema.extend({
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
  rentalPeriod: z.string().default("daily"),
});

type NewRentalFormData = z.infer<typeof newRentalSchema>;

export default function NewRental() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: products } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<NewRentalFormData>({
    resolver: zodResolver(newRentalSchema),
    defaultValues: {
      supplierId: "",
      equipmentName: "",
      equipmentType: "",
      quantity: 1,
      startDate: "",
      endDate: "",
      rentalPeriod: "daily",
      dailyRate: "0",
      totalAmount: "0",
      status: "pending",
      notes: "",
    },
  });

  const createRentalMutation = useMutation({
    mutationFn: async (data: NewRentalFormData) => {
      const rentalData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      const response = await apiRequest("POST", "/api/rentals", rentalData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Locação criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      setLocation("/rentals");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar locação",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const dailyRate = parseFloat(form.watch("dailyRate") || "0");
    const quantity = form.watch("quantity") || 1;
    const rentalPeriod = form.watch("rentalPeriod") || "daily";

    if (startDate && endDate && dailyRate > 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      
      let periodMultiplier = 1;
      switch (rentalPeriod) {
        case "weekly":
          periodMultiplier = Math.ceil(days / 7);
          break;
        case "biweekly":
          periodMultiplier = Math.ceil(days / 14);
          break;
        case "monthly":
          periodMultiplier = Math.ceil(days / 30);
          break;
        default: // daily
          periodMultiplier = days;
      }
      
      const total = periodMultiplier * dailyRate * quantity;
      form.setValue("totalAmount", total.toString());
      return total;
    }
    return 0;
  };

  const onSubmit = (data: NewRentalFormData) => {
    createRentalMutation.mutate(data);
  };

  // Remove dependency on internal products since we're renting from external suppliers

  return (
    <MainLayout
      title="Nova Locação"
      subtitle="Registre o aluguel de um equipamento"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Aluguel</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-supplier">
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipmentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Equipamento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Escavadeira Hidráulica"
                          {...field}
                          data-testid="input-equipment-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="equipmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Equipamento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Máquina Pesada"
                        {...field}
                        data-testid="input-equipment-type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value) || 1);
                            calculateTotal();
                          }}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentalPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Locação</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        calculateTotal();
                      }} value={field.value || "daily"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rental-period">
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quinzenal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            calculateTotal();
                          }}
                          data-testid="input-start-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fim</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            calculateTotal();
                          }}
                          data-testid="input-end-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor por Período (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            calculateTotal();
                          }}
                          data-testid="input-daily-rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          readOnly
                          data-testid="input-total-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais sobre a locação..."
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/rentals")}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createRentalMutation.isPending}
                  data-testid="button-create-rental"
                >
                  {createRentalMutation.isPending ? "Criando..." : "Criar Locação"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
