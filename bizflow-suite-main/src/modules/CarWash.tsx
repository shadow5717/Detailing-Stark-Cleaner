import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Car,
  Plus,
  Clock,
  CheckCircle2,
  History,
  Search,
  Trash2,
  CarFront,
  Truck,
  Bike,
} from 'lucide-react';
import {
  addData,
  getAllData,
  deleteData,
  updateData,
  STORES,
  type Vehicle,
  type CompletedVehicle,
} from '@/lib/db';
import { toast } from 'sonner';

const TIPOS_VEHICULO = ['Carro', 'Jeepeta', 'Motor', 'Camión'] as const;
const SERVICIOS = [
  { nombre: 'Lavado Simple', precio: 300 },
  { nombre: 'Lavado Completo', precio: 500 },
  { nombre: 'Lavado Premium', precio: 800 },
  { nombre: 'Lavado Motor', precio: 150 },
  { nombre: 'Encerado', precio: 400 },
  { nombre: 'Interior', precio: 350 },
];
const EMPLEADOS = ['Juan', 'Pedro', 'María', 'Luis'];

const vehicleIcons = {
  Carro: CarFront,
  Jeepeta: Car,
  Motor: Bike,
  Camión: Truck,
};

export function CarWashModule() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [completedVehicles, setCompletedVehicles] = useState<CompletedVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    placa: '',
    tipo: '' as Vehicle['tipo'] | '',
    servicio: '',
    precio: 0,
    empleado: '',
    notas: '',
  });

  const loadData = async () => {
    const vehiclesData = await getAllData<Vehicle>(STORES.VEHICLES);
    const completedData = await getAllData<CompletedVehicle>(STORES.COMPLETED_VEHICLES);
    setVehicles(vehiclesData.filter(v => v.estado === 'en_proceso'));
    setCompletedVehicles(completedData.sort((a, b) => b.id - a.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleServiceChange = (serviceName: string) => {
    const service = SERVICIOS.find(s => s.nombre === serviceName);
    setFormData({
      ...formData,
      servicio: serviceName,
      precio: service?.precio || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placa || !formData.tipo || !formData.servicio || !formData.empleado) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newVehicle: Omit<Vehicle, 'id'> = {
      placa: formData.placa.toUpperCase(),
      tipo: formData.tipo as Vehicle['tipo'],
      servicio: formData.servicio,
      precio: formData.precio,
      empleado: formData.empleado,
      estado: 'en_proceso',
      hora_entrada: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      fecha: new Date().toISOString().split('T')[0],
      notas: formData.notas,
    };

    await addData(STORES.VEHICLES, newVehicle);
    toast.success('Vehículo registrado');
    
    setFormData({
      placa: '',
      tipo: '',
      servicio: '',
      precio: 0,
      empleado: '',
      notas: '',
    });
    
    loadData();
  };

  const markAsCompleted = async (vehicle: Vehicle) => {
    const completedVehicle: Omit<CompletedVehicle, 'id'> = {
      ...vehicle,
      estado: 'completado',
      hora_salida: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
    };

    await addData(STORES.COMPLETED_VEHICLES, completedVehicle);
    await deleteData(STORES.VEHICLES, vehicle.id);
    toast.success(`Vehículo ${vehicle.placa} marcado como entregado`);
    loadData();
  };

  const handleDeleteVehicle = async (id: number) => {
    await deleteData(STORES.VEHICLES, id);
    toast.success('Vehículo eliminado');
    loadData();
  };

  const inProcessVehicles = vehicles.filter(v => v.estado === 'en_proceso');
  const todayCompleted = completedVehicles.filter(
    v => v.fecha === new Date().toISOString().split('T')[0]
  );

  const filteredHistory = completedVehicles.filter(
    v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
         v.empleado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-accent/20">
          <Car className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Car Wash</h1>
          <p className="text-muted-foreground">Control de vehículos</p>
        </div>
      </div>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="register" className="gap-2">
            <Plus className="w-4 h-4" /> Registrar
          </TabsTrigger>
          <TabsTrigger value="process" className="gap-2">
            <Clock className="w-4 h-4" /> En Proceso
            {inProcessVehicles.length > 0 && (
              <Badge className="ml-1 bg-warning text-warning-foreground">
                {inProcessVehicles.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" /> Entregados Hoy
            <Badge className="ml-1 bg-success">{todayCompleted.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Historial
          </TabsTrigger>
        </TabsList>

        {/* Register Tab */}
        <TabsContent value="register" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa del Vehículo</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  placeholder="A123456"
                  className="uppercase"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Vehículo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as Vehicle['tipo'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VEHICULO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Servicio</Label>
                <Select
                  value={formData.servicio}
                  onValueChange={handleServiceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICIOS.map((servicio) => (
                      <SelectItem key={servicio.nombre} value={servicio.nombre}>
                        {servicio.nombre} - RD${servicio.precio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select
                  value={formData.empleado}
                  onValueChange={(value) => setFormData({ ...formData, empleado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLEADOS.map((empleado) => (
                      <SelectItem key={empleado} value={empleado}>
                        {empleado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Observaciones sobre el vehículo..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-border">
                <div className="text-lg font-semibold">
                  Total: <span className="text-accent">RD${formData.precio}</span>
                </div>
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Registrar Vehículo
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* In Process Tab */}
        <TabsContent value="process" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6">
            {inProcessVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProcessVehicles.map((vehicle) => {
                  const Icon = vehicleIcons[vehicle.tipo] || Car;
                  return (
                    <div
                      key={vehicle.id}
                      className="p-5 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/30 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-warning/20">
                            <Icon className="w-5 h-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{vehicle.placa}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.tipo}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-warning text-warning">
                          En Proceso
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Servicio:</span>
                          <span className="font-medium">{vehicle.servicio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Empleado:</span>
                          <span className="font-medium">{vehicle.empleado}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entrada:</span>
                          <span className="font-medium">{vehicle.hora_entrada}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Precio:</span>
                          <span className="font-bold text-accent">RD${vehicle.precio}</span>
                        </div>
                      </div>

                      {vehicle.notas && (
                        <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                          {vehicle.notas}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 gap-2"
                          variant="success"
                          onClick={() => markAsCompleted(vehicle)}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Entregar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay vehículos en proceso</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Completed Today Tab */}
        <TabsContent value="completed" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Vehículos Entregados Hoy</h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total del día</p>
                <p className="text-2xl font-bold text-success">
                  RD${todayCompleted.reduce((sum, v) => sum + v.precio, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayCompleted.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-mono font-bold">{vehicle.placa}</TableCell>
                      <TableCell>{vehicle.tipo}</TableCell>
                      <TableCell>{vehicle.servicio}</TableCell>
                      <TableCell>{vehicle.empleado}</TableCell>
                      <TableCell>{vehicle.hora_entrada}</TableCell>
                      <TableCell>{vehicle.hora_salida}</TableCell>
                      <TableCell className="text-right font-semibold text-success">
                        RD${vehicle.precio}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa o empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>{vehicle.fecha}</TableCell>
                      <TableCell className="font-mono font-bold">{vehicle.placa}</TableCell>
                      <TableCell>{vehicle.tipo}</TableCell>
                      <TableCell>{vehicle.servicio}</TableCell>
                      <TableCell>{vehicle.empleado}</TableCell>
                      <TableCell className="text-right font-semibold">
                        RD${vehicle.precio}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
