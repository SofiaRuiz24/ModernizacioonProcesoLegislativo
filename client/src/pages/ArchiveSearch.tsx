import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/config';

interface Legislador {
  _id: string;
  name: string;
  party: string;
}

interface Law {
  _id: string;
  blockchainId: number;
  blockchainSessionId: number;
  title: string;
  description: string;
  author: string;
  party: string;
  category: string;
  status: 'Pendiente' | 'En debate' | 'Aprobada' | 'Rechazada' | 'Finalizada';
  finalStatus: 'Aprobada' | 'Rechazada' | 'Pendiente';
  blockchainStatus: boolean;
  blockchainVotes: {
    favor: number;
    contra: number;
    abstenciones: number;
    ausentes: number;
  };
  datePresented: string;
  dateExpiry: string;
  projectDocument: {
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  } | null;
  priority: string;
  tags: string[];
}

interface ApiResponse {
  laws: Law[];
  totalPages: number;
  currentPage: number;
  total: number;
  message?: string;
  error?: string;
}

const ITEMS_PER_PAGE = 10;

export function ArchiveSearch() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [legisladores, setLegisladores] = useState<Legislador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('all');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchAuthorParty, setSearchAuthorParty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLegisladores = async () => {
    try {
      const response = await axios.get<Legislador[]>(`${API_URL}/api/legislators`);
      setLegisladores(response.data);
    } catch (error) {
      console.error('Error fetching legisladores:', error);
    }
  };

  const getLegisladorName = (authorId: string) => {
    const legislador = legisladores.find(l => l._id === authorId);
    return legislador ? legislador.name : 'Legislador';
  };

  useEffect(() => {
    fetchLegisladores();
  }, []);

  // Fetch laws from API
  const fetchLaws = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(status !== 'all' && { status }),
        ...(searchTitle && { search: searchTitle }),
        ...(searchCategory && { category: searchCategory }),
        ...(searchAuthorParty && { author: searchAuthorParty })
      });

      console.log('🔍 Fetching laws with params:', params.toString());
      const apiUrl = `${API_URL}/api/laws?${params}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await axios.get<ApiResponse>(apiUrl);
      console.log('📦 API Response:', response.data);
      
      // Check if we have a valid response
      if (response.data && response.data.laws) {
        console.log('✅ Valid response received:', {
          lawsCount: response.data.laws.length,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
        setLaws(response.data.laws);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
      } else if (response.data.error) {
        console.error('❌ API returned error:', response.data.error);
        throw new Error(response.data.error);
      } else {
        console.error('❌ Invalid response format:', response.data);
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('❌ Error fetching laws:', err);
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        setError(err.response?.data?.message || err.message || 'Error al cargar las leyes');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar las leyes');
      }
      // Reset to empty state on error
      setLaws([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, [currentPage, status, searchTitle, searchCategory, searchAuthorParty]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLaws();
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

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h2 className="text-2xl font-semibold text-[#1D2B3E]">
            Búsqueda de Proyectos Legislativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#557B97]">
                Título del Proyecto
              </label>
              <Input 
                placeholder="Buscar por título..." 
                className="border-[#A7D3D4] focus:border-[#557B97]"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#557B97]">Categoría</label>
              <Input 
                placeholder="Buscar por categoría..." 
                className="border-[#A7D3D4] focus:border-[#557B97]"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
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
              <label className="text-sm text-[#557B97]">Estado Final</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border-[#A7D3D4] focus:border-[#557B97]"
                options={[
                  { value: "all", label: "Todos" },
                  { value: "Pendiente", label: "Pendiente" },
                  { value: "Aprobada", label: "Aprobada" },
                  { value: "Rechazada", label: "Rechazada" }
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

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Estado Final</TableHead>
                <TableHead>Fecha Presentación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1D2B3E]"></div>
                      <span className="ml-2">Cargando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !laws || laws.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    {error ? 'Error al cargar los datos' : 'No se encontraron proyectos'}
                  </TableCell>
                </TableRow>
              ) : (
                laws.map(law => (
                  <TableRow key={law._id}>
                    <TableCell className="font-medium">{law.title || 'Sin título'}</TableCell>
                    <TableCell>{law.category || 'Sin categoría'}</TableCell>
                    <TableCell>{getLegisladorName(law.author)}</TableCell>
                    <TableCell>{law.party || 'Sin partido'}</TableCell>
                    <TableCell>
                      <StatusBadge status={law.finalStatus} />
                    </TableCell>
                    <TableCell>
                      {law.datePresented ? new Date(law.datePresented).toLocaleDateString() : 'Sin fecha'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Ver proyecto</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="py-4 px-6 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#557B97]">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={previousPage} 
                disabled={currentPage === 1} 
                className="border-[#A7D3D4] text-[#557B97] hover:bg-[#EDF2EF]"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button 
                    key={i + 1} 
                    variant={currentPage === i + 1 ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => goToPage(i + 1)} 
                    className={
                      currentPage === i + 1 
                        ? 'bg-[#1D2B3E] text-white hover:bg-[#557B97]' 
                        : 'border-[#A7D3D4] text-[#557B97] hover:bg-[#EDF2EF]'
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextPage} 
                disabled={currentPage === totalPages} 
                className="border-[#A7D3D4] text-[#557B97] hover:bg-[#EDF2EF]"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return {
          label: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'Aprobada':
        return {
          label: 'Aprobada',
          className: 'bg-green-100 text-green-800'
        };
      case 'Rechazada':
        return {
          label: 'Rechazada',
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
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}