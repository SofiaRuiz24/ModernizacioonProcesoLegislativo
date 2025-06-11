import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, ThumbsUp, ThumbsDown, Clock, CalendarDays, User, Tag, BarChart, ExternalLink, Minus, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import contractJson from "../../../server/src/VotacionLegislatura.json";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { SessionTimer } from '@/components/SessionTimer';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// Definimos un tipo para los estados posibles
type LawStatus = 'En revisión' | 'Pendiente' | 'En debate' | 'Finalizada' | 'Aprobada' | 'Rechazada';

// Definición de estados con sus estilos
const STATUS_STYLES: Record<LawStatus, { class: string; icon: JSX.Element }> = {
  'En revisión': { class: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> },
  'Pendiente': { class: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
  'En debate': { class: 'bg-green-100 text-green-800', icon: <BarChart className="h-4 w-4 mr-1" /> },
  'Finalizada': { class: 'bg-gray-100 text-gray-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
  'Aprobada': { class: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
  'Rechazada': { class: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> }
};

// Definimos un tipo para el proveedor de MetaMask
type MetaMaskProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
};

// Definimos el tipo para los votos
interface Votes {
  favor: number;
  contra: number;
  abstenciones: number;
  ausentes: number;
}

// Definimos el tipo para las leyes
interface PendingLaw {
  id: number;
  blockchainId: number;
  blockchainSessionId: number;
  title: string;
  author: string;
  party: string;
  category: string;
  status: LawStatus;
  finalStatus: LawStatus;
  datePresented: string;
  dateExpiry: string;
  description: string;
  documentLink: string;
  votes: Votes;
  blockchainStatus: boolean;
}

// Enum para los estados de voto del contrato
enum EstadoVoto {
  AUSENTE = 0,
  PRESENTE = 1,
  A_FAVOR = 2,
  EN_CONTRA = 3,
  ABSTENCION = 4
}

export function PendingLaws() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{ id: number; action: 'approve' | 'reject' | 'abstain' } | null>(null);
  const [pendingLaws, setPendingLaws] = useState<PendingLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [finalizingSession, setFinalizingSession] = useState(false);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

  // Función para verificar si MetaMask está disponible
  const isMetaMaskAvailable = () => {
    const ethereum = window.ethereum as MetaMaskProvider | undefined;
    return typeof window !== 'undefined' && 
           ethereum !== undefined && 
           ethereum.isMetaMask === true;
  };

  // Función para obtener la sesión activa
  const getActiveSession = async () => {
    if (!isMetaMaskAvailable()) {
      console.error('MetaMask no está disponible');
      setError('Por favor, instala MetaMask para continuar');
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const contract = new ethers.Contract(contractAddress, contractJson.abi, provider);
      const cantidadSesiones = await contract.obtenerCantidadSesiones();
      console.log('Cantidad de sesiones:', cantidadSesiones.toString());
      
      if (cantidadSesiones === 0n) {
        console.log('No hay sesiones creadas');
        setActiveSessionId(null);
        return null;
      }
      
      // Buscar la última sesión activa
      for (let i = Number(cantidadSesiones) - 1; i >= 0; i--) {
        const sesion = await contract.sesiones(BigInt(i));
        console.log(`Sesión ${i}:`, {
          id: sesion.id.toString(),
          fecha: sesion.fecha,
          descripcion: sesion.descripcion,
          activa: sesion.activa
        });
        
        if (sesion.activa) {
          console.log(`Sesión activa encontrada: ${i}`);
          console.log('Estado antes de setActiveSessionId:', {
            activeSessionId,
            activeSessionIdType: typeof activeSessionId
          });
          setActiveSessionId(i);
          console.log('Estado después de setActiveSessionId:', {
            activeSessionId: i,
            activeSessionIdType: typeof i
          });
          return i;
        }
      }
      console.log('No se encontró ninguna sesión activa');
      setActiveSessionId(null);
      return null;
    } catch (error) {
      console.error('Error obteniendo sesión activa:', error);
      setError('Error al obtener la sesión activa');
      return null;
    }
  };

  // Función para obtener las leyes de la sesión actual
  const fetchLaws = async (sessionId: number) => {
    if (!isMetaMaskAvailable()) {
      setError('Por favor, instala MetaMask para continuar');
      return;
    }

    try {
      setLoading(true);
      // Primero obtener datos del backend
      const backendResponse = await fetch(`http://localhost:5001/api/laws?sessionId=${sessionId}`);
      if (!backendResponse.ok) {
        throw new Error('Error al obtener las leyes del backend');
      }
      const mongoLaws = await backendResponse.json();
      console.log('Leyes obtenidas del backend:', mongoLaws);

      // Luego obtener datos de la blockchain
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const contract = new ethers.Contract(contractAddress, contractJson.abi, provider);
      const cantidadLeyes = await contract.obtenerCantidadLeyes(sessionId);
      console.log('Cantidad de leyes en blockchain:', cantidadLeyes.toString());
      
      const laws: PendingLaw[] = [];
      for (let i = 0; i < cantidadLeyes; i++) {
        const ley = await contract.obtenerLey(sessionId, i);
        const resultados = await contract.obtenerResultadosLey(sessionId, i);
        
        // Obtener el voto del usuario actual si está conectado
        let userVote = null;
        if (userAddress) {
          const voto = await contract.obtenerVotoLegislador(sessionId, i, userAddress);
          userVote = Number(voto);
        }

        // Buscar la ley correspondiente en los datos de MongoDB
        const mongoLaw = mongoLaws.laws.find((l: any) => 
          l.blockchainId === Number(ley.id) && 
          l.blockchainSessionId === sessionId
        );

        console.log(`Ley ${i} en blockchain:`, {
          id: ley.id.toString(),
          titulo: ley.titulo,
          activa: ley.activa,
          votos: {
            favor: resultados.votosAFavor.toString(),
            contra: resultados.votosEnContra.toString(),
            abstenciones: resultados.abstenciones.toString(),
            ausentes: resultados.ausentes.toString()
          },
          mongoData: mongoLaw || 'No encontrada en MongoDB'
        });

        laws.push({
          id: i,
          blockchainId: Number(ley.id),
          blockchainSessionId: sessionId,
          title: ley.titulo,
          description: ley.descripcion,
          author: mongoLaw?.author || 'Legislador',
          party: mongoLaw?.party || 'Partido',
          category: mongoLaw?.category || 'Social',
          status: mongoLaw?.status || (ley.activa ? 'En debate' : 'Finalizada'),
          finalStatus: mongoLaw?.finalStatus || 'Pendiente',
          datePresented: mongoLaw?.datePresented || new Date().toISOString(),
          dateExpiry: mongoLaw?.dateExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          documentLink: mongoLaw?.projectDocument ? 
            `http://localhost:5001/api/laws/documents/${mongoLaw.projectDocument.filename}` : 
            '#',
          blockchainStatus: ley.activa,
          votes: {
            favor: Number(resultados.votosAFavor),
            contra: Number(resultados.votosEnContra),
            abstenciones: Number(resultados.abstenciones),
            ausentes: Number(resultados.ausentes)
          }
        });
      }

      console.log('Leyes procesadas:', laws);
      setPendingLaws(laws);
    } catch (error) {
      console.error('Error obteniendo leyes:', error);
      setError('Error al obtener las leyes');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para conectar wallet y obtener sesión activa
  useEffect(() => {
    if (!isMetaMaskAvailable()) {
      setError('Por favor, instala MetaMask para continuar');
      return;
    }

    const connectWallet = async () => {
      try {
        const ethereum = window.ethereum as MetaMaskProvider;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        
        // Obtener sesión activa después de conectar la wallet
        const sessionId = await getActiveSession();
        if (sessionId !== null) {
          await fetchLaws(sessionId);
        }
      } catch (error) {
        console.error('Error conectando wallet:', error);
        setError('Error al conectar la wallet');
      }
    };

    connectWallet();

    // Escuchar cambios de cuenta
    const handleAccountsChanged = async (accounts: string[]) => {
      setUserAddress(accounts[0] || null);
      // Actualizar sesión activa cuando cambie la cuenta
      if (accounts[0]) {
        const sessionId = await getActiveSession();
        if (sessionId !== null) {
          await fetchLaws(sessionId);
        }
      }
    };

    const ethereum = window.ethereum as MetaMaskProvider;
    ethereum.on('accountsChanged', handleAccountsChanged);

    // Escuchar cambios en la red
    const handleChainChanged = async () => {
      // Recargar la página cuando cambie la red
      window.location.reload();
    };
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const handleVoteClick = (id: number, action: 'approve' | 'reject' | 'abstain') => {
    console.log('handleVoteClick - Valores iniciales:', {
      id,
      action,
      userAddress,
      activeSessionId,
      currentAction: currentAction
    });

    if (!userAddress) {
      setError('Por favor, conecta tu wallet para votar');
      return;
    }
    setCurrentAction({ id, action });
    setDialogOpen(true);
  };

  const handleConfirmVote = async () => {
    console.log('handleConfirmVote - Valores al iniciar:', {
      currentAction,
      userAddress,
      activeSessionId,
      activeSessionIdType: typeof activeSessionId,
      activeSessionIdValue: activeSessionId,
      isMetaMaskAvailable: isMetaMaskAvailable()
    });

    // Verificar que activeSessionId sea un número válido
    if (typeof activeSessionId !== 'number' || isNaN(activeSessionId)) {
      console.error('activeSessionId inválido:', {
        value: activeSessionId,
        type: typeof activeSessionId
      });
      setError('ID de sesión inválido');
      setDialogOpen(false);
      return;
    }

    if (!currentAction || !userAddress) {
      console.error('Datos faltantes:', {
        currentAction: currentAction ? 'presente' : 'faltante',
        userAddress: userAddress ? 'presente' : 'faltante'
      });
      setError('Faltan datos necesarios para votar');
      setDialogOpen(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Obtener provider y signer
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

      // 2. Verificar si la cuenta actual es legislador
      const esLegislador = await contract.legisladores(userAddress);
      console.log('Estado de legislador:', {
        cuenta: userAddress,
        esLegislador,
        cuentaActual: await signer.getAddress()
      });

      if (!esLegislador) {
        throw new Error('Tu cuenta no está registrada como legislador');
      }

      // 3. Verificar que la sesión está activa
      const sesion = await contract.sesiones(BigInt(activeSessionId));
      console.log('Estado de la sesión:', {
        id: sesion.id.toString(),
        activa: sesion.activa,
        sesionId: activeSessionId,
        sesionIdType: typeof activeSessionId
      });

      if (!sesion.activa) {
        throw new Error('La sesión ya no está activa');
      }

      // 4. Verificar que la ley existe y está activa
      const ley = await contract.obtenerLey(activeSessionId, currentAction.id);
      console.log('Estado de la ley:', {
        id: ley.id.toString(),
        activa: ley.activa,
        leyId: currentAction.id,
        sessionId: activeSessionId
      });

      if (!ley.activa) {
        throw new Error('La ley ya no está activa');
      }

      // 5. Convertir acción a EstadoVoto
      let estadoVoto: EstadoVoto;
      switch (currentAction.action) {
        case 'approve':
          estadoVoto = EstadoVoto.A_FAVOR;
          break;
        case 'reject':
          estadoVoto = EstadoVoto.EN_CONTRA;
          break;
        case 'abstain':
          estadoVoto = EstadoVoto.ABSTENCION;
          break;
        default:
          throw new Error('Acción de voto inválida');
      }

      // 6. Enviar la transacción
      console.log('Enviando voto:', {
        sessionId: activeSessionId,
        sessionIdType: typeof activeSessionId,
        lawId: currentAction.id,
        action: currentAction.action,
        estadoVoto: estadoVoto,
        cuenta: await signer.getAddress()
      });

      const tx = await contract.registrarVoto(
        activeSessionId,
        currentAction.id,
        estadoVoto
      );

      console.log('Transacción enviada:', tx.hash);
      setSuccess('Transacción enviada. Esperando confirmación...');
      setDialogOpen(false);

      // 7. Esperar confirmación
      const receipt = await tx.wait();
      console.log('Transacción confirmada:', receipt);

      // 8. Sincronizar con MongoDB
      try {
        console.log('Sincronizando votos con MongoDB...');
        const syncResponse = await fetch(`http://localhost:5001/api/laws/sync/${activeSessionId}/${currentAction.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: currentAction.action // 'approve', 'reject', o 'abstain'
          })
        });

        if (!syncResponse.ok) {
          throw new Error('Error al sincronizar con MongoDB');
        }

        const syncedLaw = await syncResponse.json();
        console.log('Ley sincronizada en MongoDB:', syncedLaw);
      } catch (syncError) {
        console.error('Error sincronizando con MongoDB:', syncError);
        // No lanzamos el error para no interrumpir el flujo, pero lo registramos
      }

      // 9. Actualizar la lista de leyes
      await fetchLaws(activeSessionId);
      setSuccess('Voto registrado exitosamente');

    } catch (error) {
      console.error('Error al votar:', error);
      let errorMessage = 'Error al registrar el voto';
      
      if (error instanceof Error) {
        if (error.message.includes('Solo los legisladores pueden realizar esta accion')) {
          errorMessage = 'Tu cuenta no está registrada como legislador';
        } else if (error.message.includes('Sesion no esta activa')) {
          errorMessage = 'La sesión ya no está activa';
        } else if (error.message.includes('La ley no esta activa')) {
          errorMessage = 'La ley ya no está activa';
        } else if (error.message.includes('Estado de voto invalido')) {
          errorMessage = 'Estado de voto inválido';
        } else if (error.message.includes('user rejected transaction')) {
          errorMessage = 'Transacción rechazada por el usuario';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeSession = async () => {
    if (!activeSessionId) {
      setError('No hay una sesión activa para finalizar');
      return;
    }

    try {
      setFinalizingSession(true);
      setError(null);

      // Obtener provider y signer
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractJson.abi, signer);

      // Finalizar sesión en blockchain
      console.log('Finalizando sesión:', activeSessionId);
      const tx = await contractInstance.finalizarSesion(BigInt(activeSessionId));
      await tx.wait();
      
      // Actualizar estados en MongoDB
      console.log('Actualizando estados en MongoDB...');
      const response = await fetch(`http://localhost:5001/api/laws/finalize-session/${activeSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar estados en MongoDB');
      }

      const result = await response.json();
      console.log('Resultado de finalización:', result);
      
      setSuccess('Sesión finalizada correctamente');
      
      // Actualizar la lista de leyes con los nuevos estados
      await fetchLaws(activeSessionId);
      
      // Limpiar sesión activa
      setActiveSessionId(null);
      
      // Mostrar resumen de resultados
      const resumen = result.detalles.map((ley: any) => 
        `${ley.titulo}: ${ley.estadoFinal} (${ley.votos.favor} a favor, ${ley.votos.contra} en contra)`
      ).join('\n');
      
      console.log('Resumen de resultados:', resumen);
      
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      setError(error instanceof Error ? error.message : 'Error al finalizar la sesión');
    } finally {
      setFinalizingSession(false);
    }
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

  // Efecto para logging del estado
  useEffect(() => {
    if (pendingLaws.length > 0) {
      console.log('Renderizando PendingLaws con:', {
        activeSessionId,
        activeSessionIdType: typeof activeSessionId,
        pendingLawsLength: pendingLaws.length,
        firstLaw: pendingLaws[0]
      });
      console.log('Evaluando renderizado del botón:', {
        activeSessionId,
        condition: activeSessionId !== null
      });
    }
  }, [pendingLaws, activeSessionId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando leyes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeSessionId && pendingLaws.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-600">No hay una sesión activa en este momento.</p>
          </div>
        </div>
      </div>
    );
  }

  if (pendingLaws.length > 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Orden del Día</h1>
            <div className="flex items-center gap-4">
              {activeSessionId !== null && (
                <>
                  <SessionTimer />
                  <Dialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        disabled={finalizingSession}
                        className="flex items-center gap-2"
                      >
                        {finalizingSession ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Finalizando...
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4" />
                            Finalizar Sesión
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>¿Finalizar la sesión actual?</DialogTitle>
                        <DialogDescription>
                          Esta acción:
                          <ul className="list-disc list-inside mt-2">
                            <li>Finalizará la sesión en blockchain</li>
                            <li>Actualizará el estado de todas las leyes según sus votos</li>
                            <li>No se podrán registrar más votos en esta sesión</li>
                          </ul>
                          ¿Está seguro que desea continuar?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex justify-between sm:justify-between gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setFinalizeDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => {
                            handleFinalizeSession();
                            setFinalizeDialogOpen(false);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          Finalizar Sesión
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
          
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
                      {law.status === 'Finalizada' ? law.finalStatus : law.status}
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
                  {law.status !== 'Finalizada' && law.blockchainStatus ? (
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
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        {law.status === 'Finalizada' 
                          ? `Esta ley ha sido ${law.finalStatus.toLowerCase()}`
                          : 'Esta ley ya no está activa para votación'}
                      </p>
                    </div>
                  )}
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Orden del Día</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-gray-600">No hay leyes pendientes en la sesión actual.</p>
        </div>
      </div>
    </div>
  );
}

export default PendingLaws;
