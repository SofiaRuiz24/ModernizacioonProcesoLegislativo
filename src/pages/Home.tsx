import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, BookOpen, Users, FileText, Calendar, Download } from 'lucide-react';

export function Home() {
  const approvedLaws = [
    {
      id: 1,
      title: 'Ley de Protección del Agua',
      number: '27.123',
      date: '2025-03-15',
      description: 'Establece el marco regulatorio para la gestión sustentable y la protección de los recursos hídricos.',
      pdfUrl: '#'
    },
    {
      id: 2,
      title: 'Ley de Energías Renovables',
      number: '27.124',
      date: '2025-03-20',
      description: 'Promueve el desarrollo y la utilización de fuentes de energía renovables.',
      pdfUrl: '#'
    },
    {
      id: 3,
      title: 'Ley de Educación Digital',
      number: '27.125',
      date: '2025-03-25',
      description: 'Establece el marco para la implementación de tecnologías digitales en el sistema educativo.',
      pdfUrl: '#'
    }
  ];
  
  const latestNews = [
    {
      id: 1,
      title: 'Proyecto de Ley de Energías Renovables',
      date: '2025-04-08',
      author: 'Diputada María González',
      description: 'Nueva propuesta para impulsar el uso de energías limpias y establecer metas de reducción de emisiones para 2030.',
      status: 'En debate'
    },
    {
      id: 2,
      title: 'Reforma del Sistema Educativo Digital',
      date: '2025-04-05',
      author: 'Senador Juan Pérez',
      description: 'Iniciativa para modernizar la educación mediante la incorporación de tecnologías digitales y capacitación docente.',
      status: 'Comisión'
    },
    {
      id: 3,
      title: 'Ley de Protección del Agua',
      date: '2025-04-01',
      author: 'Diputado Carlos Rodríguez',
      description: 'Proyecto para garantizar la gestión sustentable de recursos hídricos y el acceso universal al agua potable.',
      status: 'Aprobado'
    }
  ];

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
                <Link
                  to="/learn-more"
                  className="inline-flex items-center text-[#1D2B3E] dark:text-blue-400 hover:text-[#557B97] dark:hover:text-blue-300"
                >
                  Saber más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
            {approvedLaws.map((law) => (
              <div key={law.id} className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-[#A7D3D4] dark:border-gray-800 hover:shadow-xl transition-shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[#1D2B3E] dark:text-white">{law.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Ley N° {law.number}
                      </span>
                    </div>
                    <p className="text-[#557B97] dark:text-gray-300 mb-4">{law.description}</p>
                    <div className="flex items-center text-sm text-[#557B97] dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      Sancionada el {law.date}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-[#1D2B3E] dark:text-white dark:border-gray-700 hover:bg-[#EDF2EF] dark:hover:bg-[#2a2a2a]"
                    onClick={() => window.open(law.pdfUrl, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                </div>
              </div>
            ))}
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
            {latestNews.map((news) => (
              <div key={news.id} className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-[#A7D3D4] dark:border-gray-800 hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#557B97] dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {news.date}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      news.status === 'Aprobado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                      news.status === 'En debate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}>
                      {news.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#1D2B3E] dark:text-white mb-2">
                    {news.title}
                  </h3>
                  <p className="text-[#557B97] dark:text-gray-300 text-sm mb-4">
                    {news.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#557B97] dark:text-gray-400">{news.author}</span>
                    <Link to={`/projects/${news.id}`}>
                      <Button variant="ghost" className="text-[#1D2B3E] dark:text-white hover:text-[#557B97] dark:hover:text-blue-300">
                        Ver más
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}