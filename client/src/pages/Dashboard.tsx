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
  'Pendiente': 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800',
  'Aprobada': 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-800',
  'Rechazada': 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-800',
  'En debate': 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800'
} as const;

const PARTY_STYLES = {
  'Partido A': 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800',
  'Partido B': 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-800',
  'Partido C': 'bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900 dark:text-cyan-100 dark:border-cyan-800',
  'default': 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
} as const;

const CATEGORY_STYLES = {
  'Educación': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  'Salud': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  'Economía': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  'Seguridad': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  'Ambiente': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
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
      <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-950 dark:border-red-900">
        <p className="text-red-600 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow bg-card border border-border text-foreground">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Leyes Pendientes</span>
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-blue-700 dark:text-blue-200">{stats.pendingLaws}</span>
                <span className="text-sm text-muted-foreground ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-card border border-border text-foreground">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Leyes Aprobadas</span>
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-200">{stats.approvedLaws}</span>
                <span className="text-sm text-muted-foreground ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-card border border-border text-foreground">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Leyes Rechazadas</span>
              <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-300" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-rose-700 dark:text-rose-200">{stats.rejectedLaws}</span>
                <span className="text-sm text-muted-foreground ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-card border border-border text-foreground">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total de Leyes</span>
              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 flex items-end">
              <div>
                <span className="text-3xl font-bold text-gray-700 dark:text-gray-100">{stats.totalLaws}</span>
                <span className="text-sm text-muted-foreground ml-2">leyes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orden del Día */}
      <Card className="hover:shadow-md transition-shadow bg-card border border-border text-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Orden del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingLaws.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay leyes en el orden del día</p>
            ) : (
              pendingLaws.map((law) => (
                <div key={law._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors dark:border-zinc-700">
                  <div>
                    <h3 className="font-medium text-foreground">{law.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Presentado por: <span className="font-medium text-foreground">{getLegisladorName(law.author)}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getPartyStyle(law.party)}`}>
                        {law.party}
                      </span>
                    </p>
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">Categoría: </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getCategoryStyle(law.category)}`}>
                        {law.category}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{formatDate(law.datePresented)}</p>
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
      <Card className="hover:shadow-md transition-shadow bg-card border border-border text-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay actividad reciente</p>
            ) : (
              recentActivity.map((law) => (
                <div key={law._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Ley </span>
                      <span className={`font-medium ${law.finalStatus === 'Aprobada' ? 'text-emerald-700 dark:text-emerald-200' : 'text-rose-700 dark:text-rose-200'}`}>
                        {law.finalStatus.toLowerCase()}
                      </span>
                      <span className="text-foreground">: {law.title}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Votos: </span>
                      <span className="text-emerald-600 dark:text-emerald-300">{law.blockchainVotes.favor} a favor</span>
                      <span className="mx-1">•</span>
                      <span className="text-rose-600 dark:text-rose-300">{law.blockchainVotes.contra} en contra</span>
                      {law.blockchainVotes.abstenciones > 0 && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-amber-600 dark:text-amber-300">{law.blockchainVotes.abstenciones} abstenciones</span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(law.datePresented)}</span>
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