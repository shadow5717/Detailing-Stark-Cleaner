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
import {
  Scissors,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { addData, getAllData, deleteData, updateData, STORES, type Appointment } from '@/lib/db';
import { toast } from 'sonner';

const BARBEROS = ['Carlos', 'Miguel', 'José', 'Pedro'];
const SERVICIOS = [
  { nombre: 'Corte Regular', precio: 200 },
  { nombre: 'Corte + Barba', precio: 350 },
  { nombre: 'Barba', precio: 150 },
  { nombre: 'Corte Niño', precio: 150 },
  { nombre: 'Cejas', precio: 50 },
  { nombre: 'Diseño', precio: 250 },
];

export function BarberiaModule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    barbero: '',
    servicio: '',
    precio: 0,
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
  });

  const loadAppointments = async () => {
    const data = await getAllData<Appointment>(STORES.APPOINTMENTS);
    setAppointments(data.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return a.hora.localeCompare(b.hora);
      }
      return b.fecha.localeCompare(a.fecha);
    }));
  };

  useEffect(() => {
    loadAppointments();
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
    
    if (!formData.cliente || !formData.barbero || !formData.servicio || !formData.hora) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newAppointment: Omit<Appointment, 'id'> = {
      ...formData,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    await addData(STORES.APPOINTMENTS, newAppointment);
    toast.success('Cita registrada exitosamente');
    
    setFormData({
      cliente: '',
      telefono: '',
      barbero: '',
      servicio: '',
      precio: 0,
      fecha: new Date().toISOString().split('T')[0],
      hora: '',
    });
    
    loadAppointments();
  };

  const handleDelete = async (id: number) => {
    await deleteData(STORES.APPOINTMENTS, id);
    toast.success('Cita eliminada');
    loadAppointments();
  };

  const handleStatusChange = async (appointment: Appointment, status: 'completada' | 'cancelada') => {
    await updateData(STORES.APPOINTMENTS, { ...appointment, estado: status });
    toast.success(`Cita marcada como ${status}`);
    loadAppointments();
  };

  const todayAppointments = appointments.filter(
    a => a.fecha === new Date().toISOString().split('T')[0] && a.estado === 'pendiente'
  );

  const filteredAppointments = appointments.filter(
    a => a.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
         a.barbero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="border-warning text-warning">Pendiente</Badge>;
      case 'completada':
        return <Badge className="bg-success/20 text-success border-0">Completada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/20">
          <Scissors className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Barbería</h1>
          <p className="text-muted-foreground">Gestión de citas y servicios</p>
        </div>
      </div>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="register" className="gap-2">
            <Plus className="w-4 h-4" /> Registrar Cita
          </TabsTrigger>
          <TabsTrigger value="today" className="gap-2">
            <Calendar className="w-4 h-4" /> Citas de Hoy
            {todayAppointments.length > 0 && (
              <Badge className="ml-1 bg-primary">{todayAppointments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="w-4 h-4" /> Historial
          </TabsTrigger>
        </TabsList>

        {/* Register Tab */}
        <TabsContent value="register" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cliente" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Nombre del Cliente
                </Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="809-000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label>Barbero</Label>
                <Select
                  value={formData.barbero}
                  onValueChange={(value) => setFormData({ ...formData, barbero: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar barbero" />
                  </SelectTrigger>
                  <SelectContent>
                    {BARBEROS.map((barbero) => (
                      <SelectItem key={barbero} value={barbero}>
                        {barbero}
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
                <Label htmlFor="fecha" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Fecha
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Hora
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-border">
                <div className="text-lg font-semibold">
                  Total: <span className="text-primary">RD${formData.precio}</span>
                </div>
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Registrar Cita
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Today's Appointments Tab */}
        <TabsContent value="today" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6">
            {todayAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{appointment.cliente}</h3>
                      {statusBadge(appointment.estado)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" /> {appointment.barbero}
                      </p>
                      <p className="flex items-center gap-2">
                        <Scissors className="w-4 h-4" /> {appointment.servicio}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {appointment.hora}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-primary">
                        RD${appointment.precio}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-success hover:text-success"
                          onClick={() => handleStatusChange(appointment, 'completada')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleStatusChange(appointment, 'cancelada')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay citas pendientes para hoy</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o barbero..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Barbero</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.cliente}</TableCell>
                      <TableCell>{appointment.barbero}</TableCell>
                      <TableCell>{appointment.servicio}</TableCell>
                      <TableCell>
                        {appointment.fecha} - {appointment.hora}
                      </TableCell>
                      <TableCell>RD${appointment.precio}</TableCell>
                      <TableCell>{statusBadge(appointment.estado)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
