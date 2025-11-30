import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Scissors,
  CircleDot,
  Car,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'barberia', label: 'Barbería', icon: Scissors },
  { id: 'billar', label: 'Billar', icon: CircleDot },
  { id: 'carwash', label: 'Car Wash', icon: Car },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function Sidebar({ activeModule, onModuleChange, isDarkMode, onToggleTheme }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3 overflow-hidden transition-all duration-300', collapsed && 'justify-center')}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-sidebar-foreground">STAR</h1>
              <p className="text-xs text-muted-foreground">Business Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onModuleChange(item.id)}
              className={cn(
                'w-full justify-start gap-3 h-12 transition-all duration-200',
                collapsed && 'justify-center px-0',
                isActive && 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
              {!collapsed && (
                <span className={cn('animate-fade-in', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={onToggleTheme}
          className={cn('w-full justify-start gap-3 h-10', collapsed && 'justify-center px-0')}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-warning" />
          ) : (
            <Moon className="w-5 h-5 text-accent" />
          )}
          {!collapsed && <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
        </Button>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full justify-start gap-3 h-10', collapsed && 'justify-center px-0')}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
