import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Rentals from "@/pages/rentals";
import NewRental from "@/pages/new-rental";
import RentalReports from "@/pages/rental-reports";
import Inventory from "@/pages/inventory";
import InventoryMovements from "@/pages/inventory-movements";
import AddProduct from "@/pages/add-product";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/rentals" component={Rentals} />
      <Route path="/rentals/new" component={NewRental} />
      <Route path="/rentals/reports" component={RentalReports} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/inventory/movements" component={InventoryMovements} />
      <Route path="/inventory/add" component={AddProduct} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
