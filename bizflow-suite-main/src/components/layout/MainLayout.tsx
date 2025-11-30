import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from '@/modules/Dashboard';
import { BarberiaModule } from '@/modules/Barberia';
import { BillarModule } from '@/modules/Billar';
import { CarWashModule } from '@/modules/CarWash';
import { SettingsModule } from '@/modules/Settings';
import { initDB, initializeSampleData } from '@/lib/db';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initDB();
      await initializeSampleData();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveModule} />;
      case 'barberia':
        return <BarberiaModule />;
      case 'billar':
        return <BillarModule />;
      case 'carwash':
        return <CarWashModule />;
      case 'settings':
        return <SettingsModule isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />;
      default:
        return <Dashboard onNavigate={setActiveModule} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
            <span className="text-2xl font-bold text-primary-foreground">S</span>
          </div>
          <p className="text-muted-foreground animate-pulse">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
      <main className={cn('ml-64 min-h-screen p-6 transition-all duration-300')}>
        {renderModule()}
      </main>
    </div>
  );
}
