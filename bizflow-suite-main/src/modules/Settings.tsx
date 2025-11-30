import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Download,
  Upload,
  Database,
  Users,
  Printer,
  Info,
  Shield,
} from 'lucide-react';
import { exportDatabase, importDatabase } from '@/lib/db';
import { toast } from 'sonner';

interface SettingsModuleProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function SettingsModule({ isDarkMode, onToggleTheme }: SettingsModuleProps) {
  const [businessInfo, setBusinessInfo] = useState({
    nombre: 'STAR Business Center',
    rnc: '000-00000-0',
    direccion: 'Av. Principal #123, Santo Domingo',
    telefono: '809-000-0000',
  });

  const handleExport = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `star_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Respaldo exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar respaldo');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importDatabase(text);
      toast.success('Respaldo importado exitosamente');
      window.location.reload();
    } catch (error) {
      toast.error('Error al importar respaldo');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-warning/20">
          <SettingsIcon className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Ajustes del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="general" className="gap-2">
            <Info className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Sun className="w-4 h-4" /> Apariencia
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Database className="w-4 h-4" /> Respaldos
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" /> Usuarios
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Información del Negocio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nombre del Negocio</Label>
                <Input
                  value={businessInfo.nombre}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>RNC</Label>
                <Input
                  value={businessInfo.rnc}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, rnc: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={businessInfo.direccion}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={businessInfo.telefono}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, telefono: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={() => toast.success('Configuración guardada')}>
              Guardar Cambios
            </Button>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-lg">Tema de la Aplicación</h3>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-4">
                {isDarkMode ? (
                  <Moon className="w-6 h-6 text-accent" />
                ) : (
                  <Sun className="w-6 h-6 text-warning" />
                )}
                <div>
                  <p className="font-medium">Modo {isDarkMode ? 'Oscuro' : 'Claro'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isDarkMode ? 'Tema oscuro activado' : 'Tema claro activado'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleTheme}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => !isDarkMode && onToggleTheme()}
                className={`p-6 rounded-xl border-2 transition-all ${
                  isDarkMode
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="w-full h-24 rounded-lg bg-[#1a1f2e] mb-3 flex items-center justify-center">
                  <Moon className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="font-medium">Modo Oscuro</p>
              </button>
              <button
                onClick={() => isDarkMode && onToggleTheme()}
                className={`p-6 rounded-xl border-2 transition-all ${
                  !isDarkMode
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="w-full h-24 rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-amber-500" />
                </div>
                <p className="font-medium">Modo Claro</p>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> Gestión de Respaldos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-success/20">
                    <Download className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Exportar Respaldo</h4>
                    <p className="text-sm text-muted-foreground">
                      Descarga todos los datos en formato JSON
                    </p>
                  </div>
                </div>
                <Button
                  variant="success"
                  className="w-full gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" /> Exportar Datos
                </Button>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Importar Respaldo</h4>
                    <p className="text-sm text-muted-foreground">
                      Restaura datos desde un archivo JSON
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" /> Seleccionar Archivo
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning flex items-center gap-2">
                <Info className="w-4 h-4" />
                Recuerda exportar respaldos regularmente para evitar pérdida de datos.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Gestión de Usuarios
              </h3>
              <Button className="gap-2" disabled>
                <Users className="w-4 h-4" /> Agregar Usuario
              </Button>
            </div>

            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h4 className="font-semibold mb-2">Sistema de Usuarios</h4>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                El sistema de autenticación y roles estará disponible próximamente.
                Incluirá login seguro, control de acceso por módulos y auditoría de acciones.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
