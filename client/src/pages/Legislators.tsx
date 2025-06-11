import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { UserPlus, Mail, Phone, Building2, Search, Edit, Trash2, CheckCircle, XCircle, Filter, MoreHorizontal, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const partyColors: Record<string, string> = {
  'Partido Progresista': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Partido Conservador': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Partido Liberal': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Partido Verde': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

const statusColors: Record<string, string> = {
  'Activo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Licencia': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Suspendido': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export function Legislators() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParty, setFilterParty] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedLegislator, setSelectedLegislator] = useState<any>(null);
  const [newLegislator, setNewLegislator] = useState({
    name: '',
    email: '',
    phone: '',
    party: '',
    status: 'Activo',
    position: '',
    district: '',
    startDate: '',
    password: ''
  });
  const [legislators, setLegislators] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/legislators')
      .then(res => res.json())
      .then(data => setLegislators(data))
      .catch(() => setLegislators([]));
  }, []);

  const filteredLegislators = legislators.filter(legislator => {
    const matchesSearch = legislator.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         legislator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislator.party.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesParty = filterParty === 'Todos' || legislator.party === filterParty;
    const matchesStatus = filterStatus === 'Todos' || legislator.status === filterStatus;
    
    return matchesSearch && matchesParty && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/legislators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLegislator),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setNewLegislator({ name: '', email: '', phone: '', party: '', status: 'Activo', position: '', district: '', startDate: '', password: '' });
        fetch('http://localhost:5001/api/legislators')
          .then(res => res.json())
          .then(data => setLegislators(data));
      } else {
        const data = await res.json();
        if (data.errors) {
          alert(data.errors.map((err: any) => err.msg).join('\n'));
        } else {
          alert(data.message || 'Error al crear legislador');
        }
      }
    } catch (err) {
      alert('Error de red al crear legislador');
    }
  };

  const handleEdit = (legislator: any) => {
    setSelectedLegislator(legislator);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Editando legislador:', selectedLegislator);
    setIsEditDialogOpen(false);
  };

  const handleDelete = (legislator: any) => {
    setSelectedLegislator(legislator);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('Eliminando legislador:', selectedLegislator);
    setIsDeleteDialogOpen(false);
  };

  const handleStatusChange = (legislator: any, newStatus: string) => {
    console.log(`Cambiando estado de ${legislator.name} a ${newStatus}`);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-7xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Legisladores</h1>
        <div className="bg-card dark:bg-card border border-border dark:border-border rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6 w-full">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-0 flex-1">
              <div className="relative w-full sm:w-full lg:w-64 min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 w-full bg-background dark:bg-background border-border dark:border-border text-foreground dark:text-foreground min-w-0"
                  placeholder="Buscar legislador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Agregar Legislador
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Legislador</DialogTitle>
                    <DialogDescription>
                      Complete los datos del nuevo legislador
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                          id="name"
                          value={newLegislator.name}
                          onChange={(e) =>
                            setNewLegislator({ ...newLegislator, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newLegislator.email}
                          onChange={(e) =>
                            setNewLegislator({ ...newLegislator, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={newLegislator.phone}
                          onChange={(e) =>
                            setNewLegislator({ ...newLegislator, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="party">Partido Político</Label>
                        <Select
                          id="party"
                          value={newLegislator.party}
                          onChange={(e) =>
                            setNewLegislator({ ...newLegislator, party: e.target.value })
                          }
                          required
                          options={[
                            { value: "Partido Progresista", label: "Partido Progresista" },
                            { value: "Partido Conservador", label: "Partido Conservador" },
                            { value: "Partido Liberal", label: "Partido Liberal" },
                            { value: "Partido Verde", label: "Partido Verde" }
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select
                          id="status"
                          value={newLegislator.status}
                          onChange={(e) =>
                            setNewLegislator({ ...newLegislator, status: e.target.value })
                          }
                          required
                          options={[
                            { value: "Activo", label: "Activo" },
                            { value: "Licencia", label: "Licencia" },
                            { value: "Suspendido", label: "Suspendido" }
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          value={newLegislator.position}
                          onChange={(e) => setNewLegislator({ ...newLegislator, position: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">Distrito</Label>
                        <Input
                          id="district"
                          value={newLegislator.district}
                          onChange={(e) => setNewLegislator({ ...newLegislator, district: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha de Inicio</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newLegislator.startDate}
                          onChange={(e) => setNewLegislator({ ...newLegislator, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newLegislator.password}
                          onChange={(e) => setNewLegislator({ ...newLegislator, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        Agregar Legislador
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto min-w-0 items-start lg:items-center justify-end">
              <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0 lg:mb-0">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filtros:</span>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-full lg:w-auto min-w-0">
                <Select
                  className="h-9 w-full sm:w-auto min-w-[180px] text-sm"
                  value={filterParty}
                  onChange={(e) => setFilterParty(e.target.value)}
                  options={[
                    { value: "Todos", label: "Todos los partidos" },
                    { value: "Partido Progresista", label: "Partido Progresista" },
                    { value: "Partido Conservador", label: "Partido Conservador" },
                    { value: "Partido Liberal", label: "Partido Liberal" },
                    { value: "Partido Verde", label: "Partido Verde" }
                  ]}
                />
                <Select
                  className="h-9 w-full sm:w-auto min-w-[150px] text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { value: "Todos", label: "Todos los estados" },
                    { value: "Activo", label: "Activo" },
                    { value: "Licencia", label: "Licencia" },
                    { value: "Suspendido", label: "Suspendido" }
                  ]}
                />
              </div>
              {(searchTerm || filterParty !== 'Todos' || filterStatus !== 'Todos') && (
                <Button 
                  variant="outline" 
                  className="h-9 px-3 text-xs w-full sm:w-full lg:w-auto mt-2 sm:mt-0 border-border text-foreground"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterParty('Todos');
                    setFilterStatus('Todos');
                  }}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              )}
              <div className="ml-0 sm:ml-auto mt-2 sm:mt-0 text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                {filteredLegislators.length} legisladores encontrados
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredLegislators.map((legislator) => (
            <Card key={legislator._id || legislator.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow bg-card dark:bg-card border border-border dark:border-border">
              <CardHeader className="pb-2 relative">
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(legislator)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(legislator, 'Activo')}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Marcar como Activo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(legislator, 'Licencia')}>
                        <CheckCircle className="h-4 w-4 mr-2 text-yellow-600" />
                        Poner en Licencia
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(legislator, 'Suspendido')}>
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        Suspender
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(legislator)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-lg font-medium text-indigo-600 dark:text-indigo-200">{legislator.name ? legislator.name[0] : '?'}</span>
                  </div>
                  <div className="w-full sm:w-auto mt-2 sm:mt-0">
                    <p className="text-lg font-semibold text-foreground">{legislator.name}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <span className={`${statusColors[legislator.status]} px-2 py-1 rounded-full text-xs font-medium`}>
                        {legislator.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${partyColors[legislator.party] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                        {legislator.party}
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    <a href={`mailto:${legislator.email}`} className="text-foreground hover:text-indigo-600 dark:hover:text-indigo-300">
                      {legislator.email}
                    </a>
                  </div>
                  {legislator.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                      <a href={`tel:${legislator.phone}`} className="text-foreground hover:text-indigo-600 dark:hover:text-indigo-300">
                        {legislator.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    <span className="text-muted-foreground font-medium">Cargo:</span>
                    <span className="text-foreground">{legislator.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    <span className="text-muted-foreground font-medium">Distrito:</span>
                    <span className="text-foreground">{legislator.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Fecha de inicio:</span>
                    <span className="text-foreground">{legislator.startDate ? new Date(legislator.startDate).toLocaleDateString() : ''}</span>
                  </div>
                  {legislator.biography && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Bio:</span>
                      <span className="text-foreground">{legislator.biography}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 flex flex-col sm:flex-row gap-2">
                {/* Botones eliminados según solicitud */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
