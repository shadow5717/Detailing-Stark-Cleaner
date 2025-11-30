import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import {
  Scissors,
  CircleDot,
  Car,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { getAllData, STORES, type Appointment, type Sale, type Vehicle } from '@/lib/db';

interface DashboardProps {
  onNavigate: (module: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    appointments: 0,
    sales: 0,
    vehicles: 0,
    revenue: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const appointments = await getAllData<Appointment>(STORES.APPOINTMENTS);
      const sales = await getAllData<Sale>(STORES.SALES);
      const vehicles = await getAllData<Vehicle>(STORES.VEHICLES);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(a => a.fecha === today);
      const todaySales = sales.filter(s => s.fecha === today);
      const todayVehicles = vehicles.filter(v => v.fecha === today);

      const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

      setStats({
        appointments: todayAppointments.length,
        sales: todaySales.length,
        vehicles: todayVehicles.length,
        revenue: totalRevenue,
      });

      setRecentSales(sales.slice(-5).reverse());
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const quickActions = [
    { id: 'barberia', label: 'Nueva Cita', icon: Scissors, color: 'primary' as const },
    { id: 'billar', label: 'Nueva Venta', icon: ShoppingCart, color: 'success' as const },
    { id: 'carwash', label: 'Nuevo Vehículo', icon: Car, color: 'accent' as const },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de operaciones del día
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadStats}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Citas Hoy"
          value={stats.appointments}
          subtitle="Barbería"
          icon={Scissors}
          variant="primary"
          onClick={() => onNavigate('barberia')}
        />
        <StatCard
          title="Ventas Hoy"
          value={stats.sales}
          subtitle="Billar/POS"
          icon={ShoppingCart}
          variant="success"
          onClick={() => onNavigate('billar')}
        />
        <StatCard
          title="Vehículos Hoy"
          value={stats.vehicles}
          subtitle="Car Wash"
          icon={Car}
          variant="accent"
          onClick={() => onNavigate('carwash')}
        />
        <StatCard
          title="Ingresos Hoy"
          value={`RD$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          variant="warning"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="glass"
                  onClick={() => onNavigate(action.id)}
                  className="h-24 flex-col gap-3 hover:scale-[1.02] transition-transform"
                >
                  <div className={`p-3 rounded-xl bg-${action.color}/20`}>
                    <Icon className={`w-6 h-6 text-${action.color}`} />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Actividad Reciente
          </h2>
          <div className="glass rounded-xl p-4 space-y-3">
            {recentSales.length > 0 ? (
              recentSales.map((sale, index) => (
                <div
                  key={sale.id || index}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Venta #{sale.id}</p>
                      <p className="text-xs text-muted-foreground">{sale.hora}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-success">
                    RD${sale.total.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'barberia',
            title: 'Barbería',
            description: 'Gestión de citas y servicios',
            icon: Scissors,
            gradient: 'from-cyan-500/20 to-teal-500/20',
            iconBg: 'bg-cyan-500/20 text-cyan-400',
          },
          {
            id: 'billar',
            title: 'Billar',
            description: 'Punto de venta e inventario',
            icon: CircleDot,
            gradient: 'from-green-500/20 to-emerald-500/20',
            iconBg: 'bg-green-500/20 text-green-400',
          },
          {
            id: 'carwash',
            title: 'Car Wash',
            description: 'Control de vehículos',
            icon: Car,
            gradient: 'from-purple-500/20 to-violet-500/20',
            iconBg: 'bg-purple-500/20 text-purple-400',
          },
          {
            id: 'settings',
            title: 'Configuración',
            description: 'Ajustes del sistema',
            icon: Users,
            gradient: 'from-orange-500/20 to-amber-500/20',
            iconBg: 'bg-orange-500/20 text-orange-400',
          },
        ].map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              onClick={() => onNavigate(module.id)}
              className={`p-6 rounded-xl bg-gradient-to-br ${module.gradient} border border-border/50 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}
            >
              <div className={`w-12 h-12 rounded-xl ${module.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{module.title}</h3>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
