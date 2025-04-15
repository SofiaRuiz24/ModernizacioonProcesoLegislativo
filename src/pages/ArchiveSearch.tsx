import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
const mockData = [{
  id: 1,
  name: 'Ley de Protección Ambiental',
  year: 2023,
  author: 'Juan Pérez',
  party: 'Partido Verde',
  status: 'en_curso'
}, {
  id: 2,
  name: 'Reforma Educativa',
  year: 2023,
  author: 'María González',
  party: 'Partido Progresista',
  status: 'aprobado'
}, {
  id: 3,
  name: 'Ley de Transparencia',
  year: 2023,
  author: 'Carlos Rodríguez',
  party: 'Partido Democrático',
  status: 'rechazado'
}, {
  id: 4,
  name: 'Reforma Fiscal',
  year: 2023,
  author: 'Ana Martínez',
  party: 'Partido Económico',
  status: 'en_curso'
}, {
  id: 5,
  name: 'Ley de Seguridad Ciudadana',
  year: 2023,
  author: 'Roberto Sánchez',
  party: 'Partido Justicia',
  status: 'aprobado'
}];
const ITEMS_PER_PAGE = 5;
export function ArchiveSearch() {
  const [status, setStatus] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchAuthorParty, setSearchAuthorParty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar los datos según los criterios de búsqueda
  const filteredData = mockData.filter(project => {
    const matchesName = project.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesYear = !searchYear || project.year.toString() === searchYear;
    const matchesAuthorParty = 
      project.author.toLowerCase().includes(searchAuthorParty.toLowerCase()) ||
      project.party.toLowerCase().includes(searchAuthorParty.toLowerCase());
    const matchesStatus = status === 'all' || project.status === status;

    return matchesName && matchesYear && matchesAuthorParty && matchesStatus;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Reset pagination when filters change
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const previousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return <div className="py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h2 className="text-2xl font-semibold text-[#1D2B3E]">
            Búsqueda de Proyectos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#557B97]">
                Nombre del Proyecto
              </label>
              <Input 
                placeholder="Buscar por nombre..." 
                className="border-[#A7D3D4] focus:border-[#557B97]"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#557B97]">Año</label>
              <Input 
                type="number" 
                placeholder="Año..." 
                className="border-[#A7D3D4] focus:border-[#557B97]"
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#557B97]">Autor/Partido</label>
              <Input 
                placeholder="Buscar por autor o partido..." 
                className="border-[#A7D3D4] focus:border-[#557B97]"
                value={searchAuthorParty}
                onChange={(e) => setSearchAuthorParty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#557B97]">Estado</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border-[#A7D3D4] focus:border-[#557B97]"
                options={[
                  { value: "all", label: "Todos" },
                  { value: "en_curso", label: "En Curso" },
                  { value: "aprobado", label: "Aprobado" },
                  { value: "rechazado", label: "Rechazado" }
                ]}
              />
            </div>
          </div>
          <Button 
            className="bg-[#1D2B3E] hover:bg-[#557B97] text-white"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Proyecto</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map(project => <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.year}</TableCell>
                  <TableCell>{project.author}</TableCell>
                  <TableCell>{project.party}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Ver proyecto</span>
                    </Button>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
          <div className="py-4 px-6 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#557B97]">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de{' '}
                {totalItems}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage === 1} className="border-[#A7D3D4] text-[#557B97] hover:bg-[#EDF2EF]">
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => goToPage(i + 1)} className={currentPage === i + 1 ? 'bg-[#1D2B3E] text-white hover:bg-[#557B97]' : 'border-[#A7D3D4] text-[#557B97] hover:bg-[#EDF2EF]'}>
                    {i + 1}
                  </Button>)}
              </div>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages} className="border-[#A7D3D4] text-[#557B97] hover:bg-[#EDF2EF]">
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
function StatusBadge({
  status
}: {
  status: string;
}) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'en_curso':
        return {
          label: 'En Curso',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'aprobado':
        return {
          label: 'Aprobado',
          className: 'bg-green-100 text-green-800'
        };
      case 'rechazado':
        return {
          label: 'Rechazado',
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          label: 'Desconocido',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };
  const config = getStatusConfig(status);
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>;
}