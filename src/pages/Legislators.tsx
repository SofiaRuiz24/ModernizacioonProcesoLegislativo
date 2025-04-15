import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Plus, UserPlus, Mail, Phone, Building2 } from 'lucide-react';

const legislators = [
  {
    id: 1,
    name: 'Ana Silva',
    email: 'ana.silva@legislatura.gov.ar',
    phone: '+54 261 555-0101',
    party: 'Partido Progresista',
    status: 'Activo',
    projects: 12
  },
  {
    id: 2,
    name: 'Roberto Torres',
    email: 'roberto.torres@legislatura.gov.ar',
    phone: '+54 261 555-0102',
    party: 'Partido Conservador',
    status: 'Activo',
    projects: 8
  },
  {
    id: 3,
    name: 'Laura Martínez',
    email: 'laura.martinez@legislatura.gov.ar',
    phone: '+54 261 555-0103',
    party: 'Partido Liberal',
    status: 'Activo',
    projects: 15
  }
];

export function Legislators() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLegislator, setNewLegislator] = useState({
    name: '',
    email: '',
    phone: '',
    party: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nuevo legislador:', newLegislator);
    setIsDialogOpen(false);
    setNewLegislator({ name: '', email: '', phone: '', party: '' });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Legisladores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1D2B3E] hover:bg-[#557B97]">
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Legislador
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                  <Input
                    id="party"
                    value={newLegislator.party}
                    onChange={(e) =>
                      setNewLegislator({ ...newLegislator, party: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#1D2B3E] hover:bg-[#557B97]">
                  Agregar Legislador
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {legislators.map((legislator) => (
          <Card key={legislator.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium">{legislator.name[0]}</span>
                </div>
                <div>
                  <p>{legislator.name}</p>
                  <p className="text-sm text-gray-500">{legislator.party}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  {legislator.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  {legislator.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4" />
                  {legislator.projects} proyectos presentados
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Legislators;
