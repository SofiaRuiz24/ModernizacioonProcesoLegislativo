import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, BookOpen, Users, FileText, Calendar, Download, Loader2 } from 'lucide-react';

interface Law {
  _id: string;
  blockchainId: number;
  blockchainSessionId: number;
  title: string;
  description: string;
  author: string;
  party: string;
  category: string;
  status: string;
  finalStatus: string;
  datePresented: string;
  blockchainVotes: {
    favor: number;
    contra: number;
    abstenciones: number;
    ausentes: number;
  };
  projectDocument?: {
    filename: string;
    originalName: string;
  };
}

interface Legislador {
  _id: string;
  name: string;
  party: string;
}

export function Home() {
  const [approvedLaws, setApprovedLaws] = useState<Law[]>([]);
  const [latestNews, setLatestNews] = useState<Law[]>([]);
  const [legisladores, setLegisladores] = useState<Legislador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLegisladores = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/legislators');
      if (response.ok) {
        const data = await response.json();
        setLegisladores(data);
      }
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
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Obtener leyes aprobadas
      const approvedResponse = await fetch('http://localhost:5001/api/laws?finalStatus=Aprobada');
      if (!approvedResponse.ok) throw new Error('Error al obtener leyes aprobadas');
      const approvedData = await approvedResponse.json();
      setApprovedLaws(approvedData.laws.slice(0, 3)); // Mostrar solo las 3 más recientes

      // Obtener últimas leyes presentadas (todas las leyes ordenadas por fecha)
      const latestResponse = await fetch('http://localhost:5001/api/laws');
      if (!latestResponse.ok) throw new Error('Error al obtener últimas leyes');
      const latestData = await latestResponse.json();
      // Ordenar por fecha de presentación (más recientes primero)
      const sortedLaws = latestData.laws.sort((a: Law, b: Law) => 
        new Date(b.datePresented).getTime() - new Date(a.datePresented).getTime()
      );
      setLatestNews(sortedLaws.slice(0, 3)); // Mostrar solo las 3 más recientes

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Rechazada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'En debate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const statistics = [
    { number: '1,200+', label: 'Proyectos Presentados' },
    { number: '500+', label: 'Leyes Aprobadas' },
    { number: '300+', label: 'Legisladores Activos' },
    { number: '50K+', label: 'Ciudadanos Participantes' },
  ];

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Acceso a la Información',
      description: 'Consulta todos los proyectos de ley, debates y votaciones en un solo lugar.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Participación Ciudadana',
      description: 'Participa en debates, comenta proyectos y sigue el trabajo de tus representantes.'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Presentación de Proyectos',
      description: 'Presenta tus propios proyectos de ley y sigue su proceso legislativo.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDF2EF] dark:bg-[#121212] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EDF2EF] dark:bg-[#121212] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF2EF] dark:bg-[#121212]">
      
      {/* Hero Section */}
      <section className="relative dark:bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-[#1D2B3E] dark:text-white mb-6">
                Portal Legislativo Digital
              </h1>
              <p className="text-xl text-[#557B97] dark:text-gray-300 mb-8">
                Participa en el proceso legislativo, accede a información actualizada
                y contribuye al desarrollo de nuestra democracia.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-[#1D2B3E] hover:bg-[#557B97] dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                  onClick={() => {
                    document.getElementById('approved-laws')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Explorar Proyectos
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://www.senadomendoza.gob.ar/wp-content/uploads/2020/05/legis-hoy-1024x682.jpg"
                alt="Congreso"
                className="rounded-lg shadow-xl w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1D2B3E]/20 dark:from-black/60 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-[#EDF2EF] dark:bg-[#121212] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#1D2B3E] dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-[#557B97] dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 dark:bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D2B3E] dark:text-white text-center mb-16">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-white dark:bg-[#1a1a1a] shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-[#EDF2EF] dark:bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4 text-[#1D2B3E] dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1D2B3E] dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#557B97] dark:text-gray-300 mb-4">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approved Laws Section */}
      <section id="approved-laws" className="py-16 bg-white dark:bg-[#0c0c0c] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D2B3E] dark:text-white mb-12 text-center">
            Leyes Sancionadas
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {approvedLaws.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No hay leyes aprobadas para mostrar
              </div>
            ) : (
              approvedLaws.map((law) => (
                <div key={law._id} className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-[#A7D3D4] dark:border-gray-800 hover:shadow-xl transition-shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#1D2B3E] dark:text-white">
                          {law.title}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Ley N° {law.blockchainId}
                        </span>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-[#557B97] dark:text-gray-300 mb-4"
                        dangerouslySetInnerHTML={{ __html: law.description }}
                      />
                      <div className="flex items-center text-sm text-[#557B97] dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Sancionada el {formatDate(law.datePresented)}
                      </div>
                    </div>
                    {law.projectDocument && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 text-[#1D2B3E] dark:text-white dark:border-gray-700 hover:bg-[#EDF2EF] dark:hover:bg-[#2a2a2a] ml-4"
                        onClick={() => window.open(`http://localhost:5001/api/laws/documents/${law.projectDocument?.filename}`, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                        Descargar PDF
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-white dark:bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D2B3E] dark:text-white mb-12 text-center">
            Últimos Proyectos Presentados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
                No hay proyectos recientes para mostrar
              </div>
            ) : (
              latestNews.map((law) => (
                <div key={law._id} className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-[#A7D3D4] dark:border-gray-800 hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-[#557B97] dark:text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(law.datePresented)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(law.status)}`}>
                        {law.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#1D2B3E] dark:text-white mb-2">
                      {law.title}
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none text-[#557B97] dark:text-gray-300 text-sm mb-4"
                      dangerouslySetInnerHTML={{ __html: law.description }}
                    />
                    <div className="text-sm text-[#557B97] dark:text-gray-400">
                      {getLegisladorName(law.author)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}