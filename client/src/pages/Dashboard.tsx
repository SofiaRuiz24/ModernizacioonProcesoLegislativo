import { useState, useEffect } from "react";
import { FileText, Star, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  };
}

interface DashboardStats {
  pendingLaws: number;
  approvedLaws: number;
  rejectedLaws: number;
  totalLaws: number;
}

interface Legislador {
  _id: string;
  name: string;
  party: string;
}

// Agregar constantes de estilos
const STATUS_STYLES = {
  'Pendiente': 'bg-blue-100 text-blue-800 border border-blue-200',
  'Aprobada': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'Rechazada': 'bg-rose-100 text-rose-800 border border-rose-200',
  'En debate': 'bg-amber-100 text-amber-800 border border-amber-200'
} as const;

const PARTY_STYLES = {
  'Partido A': 'bg-purple-100 text-purple-800 border border-purple-200',
  'Partido B': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  'Partido C': 'bg-cyan-100 text-cyan-800 border border-cyan-200',
  'default': 'bg-gray-100 text-gray-800 border border-gray-200'
} as const;

const CATEGORY_STYLES = {
  'Educación': 'bg-sky-100 text-sky-800',
  'Salud': 'bg-pink-100 text-pink-800',
  'Economía': 'bg-orange-100 text-orange-800',
  'Seguridad': 'bg-red-100 text-red-800',
  'Ambiente': 'bg-green-100 text-green-800',
  'default': 'bg-gray-100 text-gray-800'
} as const;

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingLaws: 0,
    approvedLaws: 0,
    rejectedLaws: 0,
    totalLaws: 0
  });
  const [pendingLaws, setPendingLaws] = useState<Law[]>([]);
  const [recentActivity, setRecentActivity] = useState<Law[]>([]);
  const [legisladores, setLegisladores] = useState<Legislador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Agregar función para obtener legisladores
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

  useEffect(() => {
    fetchLegisladores();
    fetchDashboardData();
  }, []);

  // Función para obtener el nombre del legislador
  const getLegisladorName = (authorId: string) => {
    const legislador = legisladores.find(l => l._id === authorId);
    return legislador ? legislador.name : 'Legislador';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Obtener todas las leyes para calcular estadísticas
      const response = await fetch('http://localhost:5001/api/laws');
      if (!response.ok) throw new Error('Error al obtener datos del dashboard');
      const data = await response.json();
      
      const laws = data.laws;
      
      // Calcular estadísticas
      const stats = {
        pendingLaws: laws.filter((law: Law) => law.status === 'Pendiente').length,
        approvedLaws: laws.filter((law: Law) => law.finalStatus === 'Aprobada').length,
        rejectedLaws: laws.filter((law: Law) => law.finalStatus === 'Rechazada').length,
        totalLaws: laws.length
      };
      setStats(stats);

      // Obtener leyes pendientes para el orden del día (estado Pendiente)
      const pendingResponse = await fetch('http://localhost:5001/api/laws?status=Pendiente');
      if (!pendingResponse.ok) throw new Error('Error al obtener leyes pendientes');
      const pendingData = await pendingResponse.json();
      console.log('Leyes pendientes obtenidas:', pendingData);
      // Ordenar por fecha de presentación (más recientes primero)
      const sortedPendingLaws = pendingData.laws.sort((a: Law, b: Law) => 
        new Date(b.datePresented).getTime() - new Date(a.datePresented).getTime()
      );
      setPendingLaws(sortedPendingLaws.slice(0, 3)); // Mostrar solo las 3 más recientes

      // Obtener actividad reciente (leyes finalizadas)
      const recentResponse = await fetch('http://localhost:5001/api/laws?status=Finalizada');
      if (!recentResponse.ok) throw new Error('Error al obtener actividad reciente');
      const recentData = await recentResponse.json();
      setRecentActivity(recentData.laws.slice(0, 3)); // Mostrar solo las 3 más recientes

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el dashboard');
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  const getPartyStyle = (party: string) => {
    return PARTY_STYLES[party as keyof typeof PARTY_STYLES] || PARTY_STYLES.default;
  };

  const getCategoryStyle = (category: string) => {
    return CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Leyes Pendientes</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-blue-700">{stats.pendingLaws}</span>
                <span className="text-sm text-gray-500 ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Leyes Aprobadas</span>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-emerald-700">{stats.approvedLaws}</span>
                <span className="text-sm text-gray-500 ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Leyes Rechazadas</span>
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-rose-700">{stats.rejectedLaws}</span>
                <span className="text-sm text-gray-500 ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Total de Leyes</span>
              <FileText className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-gray-700">{stats.totalLaws}</span>
                <span className="text-sm text-gray-500 ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orden del Día */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Orden del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingLaws.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay leyes en el orden del día</p>
            ) : (
              pendingLaws.map((law) => (
                <div key={law._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{law.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Presentado por: <span className="font-medium">{getLegisladorName(law.author)}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getPartyStyle(law.party)}`}>
                        {law.party}
                      </span>
                    </p>
                    <p className="text-sm mt-1">
                      <span className="text-gray-600">Categoría: </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getCategoryStyle(law.category)}`}>
                        {law.category}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(law.datePresented)}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES['Pendiente']}`}>
                      Pendiente
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
            ) : (
              recentActivity.map((law) => (
                <div key={law._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">Ley </span>
                      <span className={`font-medium ${law.finalStatus === 'Aprobada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {law.finalStatus.toLowerCase()}
                      </span>
                      <span className="text-gray-900">: {law.title}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Votos: </span>
                      <span className="text-emerald-600">{law.blockchainVotes.favor} a favor</span>
                      <span className="mx-1">•</span>
                      <span className="text-rose-600">{law.blockchainVotes.contra} en contra</span>
                      {law.blockchainVotes.abstenciones > 0 && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-amber-600">{law.blockchainVotes.abstenciones} abstenciones</span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{getTimeAgo(law.datePresented)}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;