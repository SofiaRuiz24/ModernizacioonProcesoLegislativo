import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, ThumbsUp, ThumbsDown, Clock, CalendarDays, User, Tag, BarChart, ExternalLink, Minus, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

// Definimos un tipo para los estados posibles
type LawStatus = 'En revisión' | 'Pendiente' | 'En debate';

// Definición de estados con sus estilos
const STATUS_STYLES: Record<LawStatus, { class: string; icon: JSX.Element }> = {
  'En revisión': { class: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> },
  'Pendiente': { class: 'bg-blue-100 text-blue-800', icon: <Clock className="h-4 w-4 mr-1" /> },
  'En debate': { class: 'bg-orange-100 text-orange-800', icon: <Clock className="h-4 w-4 mr-1" /> },
};

// Definimos el tipo para los votos
interface Votes {
  favor: number;
  contra: number;
  abstenciones: number;
}

// Definimos el tipo para las leyes
interface PendingLaw {
  id: number;
  title: string;
  author: string;
  party: string;
  category: string;
  status: LawStatus;
  datePresented: string;
  dateExpiry: string;
  description: string;
  documentLink: string;
  votes: Votes;
}

// Datos ampliados de leyes pendientes
const pendingLaws: PendingLaw[] = [
  {
    id: 1,
    title: 'Ley de Protección Ambiental',
    author: 'Juan Pérez',
    party: 'Partido Verde',
    category: 'Medio Ambiente',
    status: 'En revisión',
    datePresented: '2025-04-08',
    dateExpiry: '2025-05-08',
    description: 'Esta ley propone medidas para proteger el medio ambiente y promover prácticas sostenibles para la conservación de recursos naturales y la reducción de la contaminación.',
    documentLink: '#',
    votes: { favor: 12, contra: 8, abstenciones: 5 }
  },
  {
    id: 2,
    title: 'Reforma Educativa 2025',
    author: 'María González',
    party: 'Partido Progresista',
    category: 'Educación',
    status: 'Pendiente',
    datePresented: '2025-04-07',
    dateExpiry: '2025-05-07',
    description: 'Propuesta de reforma integral del sistema educativo para mejorar la calidad de la enseñanza, actualizar los planes de estudio y garantizar el acceso equitativo a la educación.',
    documentLink: '#',
    votes: { favor: 10, contra: 10, abstenciones: 2 }
  },
  {
    id: 3,
    title: 'Ley de Transporte Público',
    author: 'Carlos Rodríguez',
    party: 'Partido Ciudadano',
    category: 'Infraestructura',
    status: 'En debate',
    datePresented: '2025-04-06',
    dateExpiry: '2025-05-06',
    description: 'Proyecto para modernizar y mejorar el sistema de transporte público en la ciudad, incluyendo la renovación de la flota de vehículos y la implementación de tecnologías más eficientes.',
    documentLink: '#',
    votes: { favor: 15, contra: 7, abstenciones: 3 }
  },
];

export function PendingLaws() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{ id: number; action: 'approve' | 'reject' | 'abstain' } | null>(null);

  const handleVoteClick = (id: number, action: 'approve' | 'reject' | 'abstain') => {
    setCurrentAction({ id, action });
    setDialogOpen(true);
  };

  const handleConfirmVote = () => {
    if (currentAction) {
      console.log(`Confirmed ${currentAction.action} on law ${currentAction.id}`);
      // Aquí iría la lógica para procesar el voto confirmado
    }
    setDialogOpen(false);
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Calcular días restantes
  const getDaysRemaining = (dateExpiry: string) => {
    const today = new Date();
    const expiryDate = new Date(dateExpiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Obtener información y estilos según la acción
  const getActionInfo = (action: 'approve' | 'reject' | 'abstain') => {
    switch (action) {
      case 'approve':
        return {
          title: 'Confirmar Aprobación',
          description: '¿Está seguro que desea aprobar esta ley?',
          icon: <CheckCircle className="h-6 w-6 text-green-600 mb-2" />,
          color: 'bg-green-600 hover:bg-green-700 text-white',
          confirmText: 'Aprobar'
        };
      case 'reject':
        return {
          title: 'Confirmar Rechazo',
          description: '¿Está seguro que desea rechazar esta ley?',
          icon: <XCircle className="h-6 w-6 text-red-600 mb-2" />,
          color: 'bg-red-600 hover:bg-red-700 text-white',
          confirmText: 'Rechazar'
        };
      case 'abstain':
        return {
          title: 'Confirmar Abstención',
          description: '¿Está seguro que desea abstenerse de votar en esta ley?',
          icon: <Minus className="h-6 w-6 text-gray-600 mb-2" />,
          color: 'bg-gray-600 hover:bg-gray-700 text-white',
          confirmText: 'Abstenerme'
        };
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Orden del Día</h1>
        
        <div className="space-y-8">
          {pendingLaws.map((law) => (
            <Card key={law.id} className="overflow-hidden border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Encabezado: Título y estado */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {law.title}
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[law.status]?.class}`}>
                    {STATUS_STYLES[law.status]?.icon}
                    {law.status}
                  </span>
                </div>
                
                {/* Información principal */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Columna izquierda - Info básica */}
                    <div className="space-y-2">
                      <p className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Autor:</span>
                        <span className="ml-2 text-blue-600 dark:text-blue-400">{law.author}</span>
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {law.party}
                        </span>
                      </p>
                      
                      <p className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Categoría:</span>
                        <span className="ml-2">{law.category}</span>
                      </p>
                      
                      <p className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                        <BarChart className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Votos actuales:</span>
                        <span className="ml-2 text-green-600">{law.votes.favor} a favor</span>
                        <span className="mx-1">•</span>
                        <span className="text-red-600">{law.votes.contra} en contra</span>
                        <span className="mx-1">•</span>
                        <span className="text-gray-500">{law.votes.abstenciones} abstenciones</span>
                      </p>
                    </div>
                    
                    {/* Columna derecha - Fechas */}
                    <div className="space-y-2">
                      <p className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Presentado:</span>
                        <span className="ml-2">{formatDate(law.datePresented)}</span>
                      </p>
                      
                      <p className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Vence:</span>
                        <span className="ml-2">{formatDate(law.dateExpiry)}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          getDaysRemaining(law.dateExpiry) <= 5 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getDaysRemaining(law.dateExpiry)} días restantes
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Descripción */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <p className="text-gray-700 dark:text-gray-300">{law.description}</p>
                  </div>
                </div>
                
                {/* Barra de documento - Mejorada */}
                <div className="flex items-center justify-end mb-6">
                  <a 
                    href={law.documentLink} 
                    className="group flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                    Ver documento completo
                    <ExternalLink className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
              
              {/* Sección de botones - Separada con línea */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => handleVoteClick(law.id, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all py-5"
                  >
                    <ThumbsUp className="h-5 w-5 mr-2" />
                    Aprobar
                  </Button>
                  
                  <Button
                    onClick={() => handleVoteClick(law.id, 'reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all py-5"
                  >
                    <ThumbsDown className="h-5 w-5 mr-2" />
                    Rechazar
                  </Button>
                  
                  <Button
                    onClick={() => handleVoteClick(law.id, 'abstain')}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white shadow-sm hover:shadow-md transition-all py-5"
                  >
                    <Minus className="h-5 w-5 mr-2" />
                    Abstención
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center pt-4">
              {currentAction && getActionInfo(currentAction.action).icon}
              <DialogTitle className="text-xl">
                {currentAction && getActionInfo(currentAction.action).title}
              </DialogTitle>
              <DialogDescription className="pt-2">
                {currentAction && getActionInfo(currentAction.action).description}
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="pt-4 pb-2">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Esta acción quedará registrada y no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmVote}
              className={`flex-1 ${currentAction ? getActionInfo(currentAction.action).color : ''}`}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {currentAction && getActionInfo(currentAction.action).confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PendingLaws;
