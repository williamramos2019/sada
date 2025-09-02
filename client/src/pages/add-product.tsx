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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";
import { z } from "zod";

const addProductSchema = insertProductSchema.extend({
  unitPrice: z.string().min(1, "Preço unitário é obrigatório"),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      categoryId: "",
      unitPrice: "0",
      quantity: 0,
      minStock: 0,
      isRentable: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: AddProductFormData) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Produto cadastrado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/inventory");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar produto",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <MainLayout
      title="Cadastrar Produto"
      subtitle="Adicione novos produtos ao almoxarifado"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Produto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: FI-001"
                          {...field}
                          data-testid="input-product-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Furadeira Industrial"
                        {...field}
                        data-testid="input-product-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o produto..."
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-product-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          data-testid="input-unit-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Inicial</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-min-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isRentable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Disponível para Locação
                      </FormLabel>
                      <div className="text-[0.8rem] text-muted-foreground">
                        Este produto pode ser alugado para clientes
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-rentable"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/inventory")}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  data-testid="button-create-product"
                >
                  {createProductMutation.isPending ? "Cadastrando..." : "Cadastrar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
