import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Wallet,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useVoting } from '../hooks/useVoting';

interface VotingPanelProps {
  law: {
    id: number;
    title: string;
    description: string;
    sessionId?: number;
    lawId?: number;
  };
  onVoteSuccess?: (voteData: any) => void;
}

export function VotingPanel({ law, onVoteSuccess }: VotingPanelProps) {
  const {
    isConnected,
    userAddress,
    isLegislator,
    loading,
    error,
    canVote,
    needsConnection,
    connectWallet,
    vote,
    getLawResults,
    clearError,
    formatAddress,
    formatBalance,
    balance,
    networkInfo,
    VOTE_STATES
  } = useVoting();

  // Estados locales
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    id: number;
    action: 'approve' | 'reject' | 'abstain';
  } | null>(null);
  const [voteResults, setVoteResults] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Obtener resultados al montar el componente
  useEffect(() => {
    if (law.sessionId !== undefined && law.lawId !== undefined) {
      loadVoteResults();
    }
  }, [law.sessionId, law.lawId, isConnected]);

  // Cargar resultados de votación
  const loadVoteResults = async () => {
    try {
      const results = await getLawResults(law.sessionId || 0, law.lawId || law.id);
      setVoteResults(results);
    } catch (error) {
      console.error('Error cargando resultados:', error);
    }
  };

  // Manejar click de voto
  const handleVoteClick = async (action: 'approve' | 'reject' | 'abstain') => {
    // Limpiar errores previos
    clearError();

    // Si no está conectado, intentar conectar
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Error conectando wallet:', error);
        return;
      }
    }

    // Verificar si puede votar
    if (!canVote) {
      alert('Tu dirección no está registrada como legislador o el wallet no está conectado');
      return;
    }

    setCurrentAction({ id: law.id, action });
    setDialogOpen(true);
  };

  // Confirmar voto
  const handleConfirmVote = async () => {
    if (!currentAction) return;

    try {
      // Mapear acciones a tipos de voto del contrato
      const voteMapping = {
        'approve': 'A_FAVOR',
        'reject': 'EN_CONTRA',
        'abstain': 'ABSTENCION'
      };

      const voteType = voteMapping[currentAction.action];
      const sessionId = law.sessionId || 0;
      const lawId = law.lawId || law.id;

      console.log(`🗳️ Votando: ${voteType} en sesión ${sessionId}, ley ${lawId}`);

      // Registrar voto en blockchain
      const receipt = await vote(sessionId, lawId, voteType);
      
      setTxHash(receipt.txHash);
      
      // Actualizar resultados
      await loadVoteResults();

      // Callback opcional
      if (onVoteSuccess) {
        onVoteSuccess({
          lawId: law.id,
          voteType,
          receipt
        });
      }

      alert(`¡Voto registrado exitosamente! TX: ${receipt.txHash.slice(0, 10)}...`);
      setDialogOpen(false);

    } catch (error) {
      console.error('Error registrando voto:', error);
      alert(`Error registrando voto: ${error.message}`);
    }
  };

  // Obtener información de la acción
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
    <Card className="mt-4">
      {/* Header con información de conexión */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-blue-600" />
            <div>
              {isConnected ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Conectado: {formatAddress(userAddress)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isLegislator ? '👨‍⚖️ Legislador autorizado' : '❌ No es legislador'}
                    {networkInfo && ` • ${networkInfo.name} • ${formatBalance(balance)} ETH`}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Wallet no conectado
                  </p>
                  <p className="text-xs text-gray-500">
                    Conecta tu wallet para votar
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {needsConnection && (
            <Button
              onClick={connectWallet}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Conectar Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-auto text-red-600"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Resultados de votación */}
      {voteResults && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Resultados actuales
          </h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{voteResults.favor}</p>
              <p className="text-xs text-gray-500">A favor</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{voteResults.contra}</p>
              <p className="text-xs text-gray-500">En contra</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{voteResults.abstenciones}</p>
              <p className="text-xs text-gray-500">Abstenciones</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{voteResults.ausentes}</p>
              <p className="text-xs text-gray-500">Ausentes</p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de votación */}
      <div className="p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => handleVoteClick('approve')}
            disabled={!canVote || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all py-5"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <ThumbsUp className="h-5 w-5 mr-2" />
            )}
            Aprobar
          </Button>
          
          <Button
            onClick={() => handleVoteClick('reject')}
            disabled={!canVote || loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all py-5"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <ThumbsDown className="h-5 w-5 mr-2" />
            )}
            Rechazar
          </Button>
          
          <Button
            onClick={() => handleVoteClick('abstain')}
            disabled={!canVote || loading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white shadow-sm hover:shadow-md transition-all py-5"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Minus className="h-5 w-5 mr-2" />
            )}
            Abstención
          </Button>
        </div>

        {/* Mostrar último hash de transacción */}
        {txHash && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ Voto registrado en blockchain
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                Ver TX
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        )}
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
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <p className="text-sm text-center text-yellow-700 dark:text-yellow-400">
                ⚠️ Esta acción quedará registrada permanentemente en blockchain y no se puede deshacer.
              </p>
            </div>
            
            {/* Información de gas */}
            <div className="mt-3 text-xs text-center text-gray-500">
              <p>Red: Sepolia Testnet</p>
              <p>Costo estimado: ~0.001 ETH</p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmVote}
              disabled={loading}
              className={`flex-1 ${currentAction ? getActionInfo(currentAction.action).color : ''}`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {currentAction && getActionInfo(currentAction.action).confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 