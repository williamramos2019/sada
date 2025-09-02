import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background" data-testid="main-layout">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
