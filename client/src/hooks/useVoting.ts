import { useState, useEffect, useCallback } from 'react';
import { web3Service, VOTE_STATES } from '../services/web3Service';

export const useVoting = () => {
  // Estados principales
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLegislator, setIsLegislator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados adicionales
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [balance, setBalance] = useState('0');
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Verificar MetaMask al montar el componente
  useEffect(() => {
    const checkMetaMask = () => {
      const available = web3Service.isMetaMaskAvailable();
      setIsMetaMaskAvailable(available);
      
      if (!available) {
        setError('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
      }
    };

    checkMetaMask();
    
    // Verificar si ya hay una conexión existente
    checkExistingConnection();
  }, []);

  // Verificar conexión existente
  const checkExistingConnection = useCallback(async () => {
    if (!web3Service.isMetaMaskAvailable()) return;

    try {
      // Verificar si MetaMask ya está conectado
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        // Hay una cuenta conectada, intentar reconectar
        await connectWallet();
      }
    } catch (error) {
      console.log('No hay conexión existente:', (error as Error).message);
    }
  }, []);

  // Función para conectar wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskAvailable) {
      throw new Error('MetaMask no está disponible');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando conexión a wallet...');
      
      // Conectar wallet
      const address = await web3Service.connectWallet();
      setUserAddress(address);
      setIsConnected(true);

      console.log('✅ Wallet conectado:', address);

      // Verificar si es legislador
      const legislatorStatus = await web3Service.isLegislator();
      setIsLegislator(legislatorStatus);

      // Obtener información adicional
      await updateAccountInfo();

      console.log('👨‍⚖️ Estado legislador:', legislatorStatus);
      
      return address;
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      setError((error as Error).message);
      setIsConnected(false);
      setUserAddress(null);
      setIsLegislator(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isMetaMaskAvailable]);

  // Función para desconectar wallet
  const disconnectWallet = useCallback(() => {
    web3Service.disconnect();
    setIsConnected(false);
    setUserAddress(null);
    setIsLegislator(false);
    setNetworkInfo(null);
    setBalance('0');
    setError(null);
    console.log('👋 Wallet desconectado');
  }, []);

  // Actualizar información de la cuenta
  const updateAccountInfo = useCallback(async () => {
    try {
      // Obtener información de red
      const netInfo = await web3Service.getNetworkInfo();
      setNetworkInfo(netInfo);

      // Obtener balance
      const userBalance = await web3Service.getBalance();
      setBalance(userBalance);

    } catch (error) {
      console.error('Error actualizando info de cuenta:', error);
    }
  }, []);

  // Función para votar
  const vote = useCallback(async (sessionId: number, lawId: number, voteType: string) => {
    if (!isConnected) {
      throw new Error('Wallet no conectado');
    }

    if (!isLegislator) {
      throw new Error('Solo los legisladores pueden votar');
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🗳️ Iniciando votación: Sesión ${sessionId}, Ley ${lawId}, Voto: ${voteType}`);

      // Validar tipo de voto
      if (!Object.keys(VOTE_STATES).includes(voteType)) {
        throw new Error(`Tipo de voto inválido: ${voteType}`);
      }

      // Registrar voto en blockchain
      const receipt = await web3Service.vote(sessionId, lawId, voteType);

      console.log('✅ Voto registrado exitosamente:', receipt);

      // Opcional: Sincronizar con backend
      try {
        await syncVoteWithBackend({
          sessionId,
          lawId,
          voteType,
          txHash: receipt.txHash,
          legislatorAddress: userAddress!,
          blockNumber: receipt.blockNumber
        });
      } catch (syncError) {
        console.warn('⚠️ Error sincronizando con backend:', (syncError as Error).message);
        // No fallar la votación si la sincronización falla
      }

      // Actualizar balance después de la transacción
      await updateAccountInfo();

      return receipt;
    } catch (error) {
      console.error('❌ Error en votación:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isConnected, isLegislator, userAddress]);

  // Sincronizar voto con backend (opcional)
  const syncVoteWithBackend = async (voteData: any) => {
    try {
      const response = await fetch('/api/voting/sync-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('📝 Voto sincronizado con backend:', result);
    } catch (error) {
      throw new Error(`Error sincronizando con backend: ${(error as Error).message}`);
    }
  };

  // Obtener resultados de una ley
  const getLawResults = useCallback(async (sessionId: number, lawId: number) => {
    try {
      if (isConnected) {
        // Si está conectado, usar Web3 directamente
        return await web3Service.getLawResults(sessionId, lawId);
      } else {
        // Si no está conectado, usar API del backend
        const response = await fetch(`/api/voting/law-results/${sessionId}/${lawId}`);
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }
        const data = await response.json();
        return data.results;
      }
    } catch (error) {
      console.error('Error obteniendo resultados:', error);
      throw error;
    }
  }, [isConnected]);

  // Verificar estado de legislador
  const checkLegislatorStatus = useCallback(async (address = userAddress) => {
    if (!address) return false;

    try {
      if (isConnected) {
        return await web3Service.isLegislator();
      } else {
        // Verificar via API
        const response = await fetch(`/api/voting/is-legislator/${address}`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.isLegislator;
      }
    } catch (error) {
      console.error('Error verificando legislador:', error);
      return false;
    }
  }, [isConnected, userAddress]);

  // Firmar mensaje de autenticación
  const signAuthMessage = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet no conectado');
    }

    try {
      setLoading(true);
      return await web3Service.signAuthMessage();
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Funciones de utilidad
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  // Estado derivado
  const canVote = isConnected && isLegislator;
  const needsConnection = !isConnected && isMetaMaskAvailable;

  return {
    // Estados principales
    isConnected,
    userAddress,
    isLegislator,
    loading,
    error,
    
    // Estados adicionales
    networkInfo,
    balance,
    isMetaMaskAvailable,
    
    // Estados derivados
    canVote,
    needsConnection,
    
    // Funciones principales
    connectWallet,
    disconnectWallet,
    vote,
    getLawResults,
    checkLegislatorStatus,
    signAuthMessage,
    
    // Funciones de utilidad
    clearError,
    updateAccountInfo,
    formatAddress,
    formatBalance,
    
    // Constantes
    VOTE_STATES
  };
}; 