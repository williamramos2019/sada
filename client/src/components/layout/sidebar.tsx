import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Handshake,
  Plus,
  ChartLine,
  Package,
  ArrowLeftRight,
  PlusCircle,
  Warehouse,
  Settings,
  User
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    section: "main"
  },
  {
    name: "Minhas Locações",
    section: "rentals",
    items: [
      {
        name: "Equipamentos Alugados",
        href: "/rentals",
        icon: Handshake
      },
      {
        name: "Novo Aluguel",
        href: "/rentals/new",
        icon: Plus
      },
      {
        name: "Relatórios",
        href: "/rentals/reports",
        icon: ChartLine
      }
    ]
  },
  {
    name: "Almoxarifado",
    section: "inventory",
    items: [
      {
        name: "Estoque",
        href: "/inventory",
        icon: Package
      },
      {
        name: "Movimentações",
        href: "/inventory/movements",
        icon: ArrowLeftRight
      },
      {
        name: "Cadastrar Produto",
        href: "/inventory/add",
        icon: PlusCircle
      }
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Warehouse className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Controle Pessoal</h1>
            <p className="text-sm text-muted-foreground">Locações & Almoxarifado</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          if (item.section === "main") {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href!}>
                <div
                  className={`group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "nav-item-active"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                >
                  {item.icon && <item.icon className="mr-3" size={18} />}
                  {item.name}
                </div>
              </Link>
            );
          }

          return (
            <div key={item.name} className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.name}
              </h3>
              <div className="mt-2 space-y-1">
                {item.items?.map((subItem) => {
                  const isActive = location === subItem.href;
                  return (
                    <Link key={subItem.name} href={subItem.href}>
                      <div
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          isActive
                            ? "nav-item-active"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                        data-testid={`nav-link-${subItem.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <subItem.icon className="mr-3" size={18} />
                        {subItem.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground" size={14} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">William Ramos</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground"
            data-testid="user-settings-button"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}