import { ethers } from 'ethers';

// ABI del contrato (importado directamente)
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "legislador",
        "type": "address"
      }
    ],
    "name": "LegisladorEliminado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "legislador",
        "type": "address"
      }
    ],
    "name": "LegisladorRegistrado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "idSesion",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "idLey",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "titulo",
        "type": "string"
      }
    ],
    "name": "LeyAgregada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "idSesion",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fecha",
        "type": "string"
      }
    ],
    "name": "SesionCreada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "idSesion",
        "type": "uint256"
      }
    ],
    "name": "SesionFinalizada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "idSesion",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "idLey",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "legislador",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum VotacionLegislatura.EstadoVoto",
        "name": "voto",
        "type": "uint8"
      }
    ],
    "name": "VotoRegistrado",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_idSesion",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_idLey",
        "type": "uint256"
      },
      {
        "internalType": "enum VotacionLegislatura.EstadoVoto",
        "name": "_estadoVoto",
        "type": "uint8"
      }
    ],
    "name": "registrarVoto",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "legisladores",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_idSesion",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_idLey",
        "type": "uint256"
      }
    ],
    "name": "obtenerResultadosLey",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "votosAFavor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votosEnContra",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "abstenciones",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ausentes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Estados de voto del contrato
const VOTE_STATES = {
  AUSENTE: 0,
  PRESENTE: 1,
  A_FAVOR: 2,
  EN_CONTRA: 3,
  ABSTENCION: 4
};

export class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    this.userAddress = null;
    this.isConnected = false;
  }

  // Verificar si MetaMask está disponible
  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Conectar wallet MetaMask
  async connectWallet() {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
    }

    try {
      console.log('🔗 Conectando a MetaMask...');
      
      // Solicitar acceso a cuentas
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No se encontraron cuentas en MetaMask');
      }
      
      // Configurar provider y signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.userAddress = await this.signer.getAddress();
      
      console.log('👤 Cuenta conectada:', this.userAddress);
      
      // Verificar red Sepolia
      await this.checkAndSwitchNetwork();
      
      // Configurar contrato
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.signer
      );
      
      this.isConnected = true;
      
      // Configurar listeners de eventos
      this.setupEventListeners();
      
      console.log('✅ Wallet conectado exitosamente');
      return this.userAddress;
      
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      throw new Error(`Error conectando wallet: ${error.message}`);
    }
  }

  // Verificar y cambiar a la red Sepolia
  async checkAndSwitchNetwork() {
    try {
      const network = await this.provider.getNetwork();
      console.log('🌐 Red actual:', network.name, 'Chain ID:', network.chainId.toString());
      
      // Sepolia Chain ID es 11155111
      if (network.chainId !== 11155111n) {
        console.log('🔄 Cambiando a red Sepolia...');
        await this.switchToSepolia();
      } else {
        console.log('✅ Ya conectado a Sepolia');
      }
    } catch (error) {
      throw new Error(`Error verificando red: ${error.message}`);
    }
  }

  // Cambiar a red Sepolia
  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId en hex
      });
      console.log('✅ Cambiado a red Sepolia');
    } catch (error) {
      // Si la red no existe, agregarla
      if (error.code === 4902) {
        console.log('➕ Agregando red Sepolia...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }]
        });
        console.log('✅ Red Sepolia agregada y seleccionada');
      } else {
        throw error;
      }
    }
  }

  // Configurar listeners de eventos
  setupEventListeners() {
    if (!window.ethereum) return;

    // Listener para cambio de cuenta
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
        console.log('👋 Wallet desconectado');
      } else {
        this.userAddress = accounts[0];
        console.log('🔄 Cuenta cambiada a:', this.userAddress);
      }
    });

    // Listener para cambio de red
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('🔄 Red cambiada a:', chainId);
      // Recargar la página para evitar inconsistencias
      window.location.reload();
    });
  }

  // Desconectar wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.userAddress = null;
    this.isConnected = false;
  }

  // Verificar si el usuario es legislador
  async isLegislator() {
    if (!this.contract || !this.userAddress) {
      throw new Error('Wallet no conectado');
    }
    
    try {
      const isLegislator = await this.contract.legisladores(this.userAddress);
      console.log('👨‍⚖️ Es legislador:', isLegislator);
      return isLegislator;
    } catch (error) {
      console.error('❌ Error verificando legislador:', error);
      throw new Error(`Error verificando legislador: ${error.message}`);
    }
  }

  // Registrar voto
  async vote(sessionId, lawId, voteType) {
    if (!this.contract) {
      throw new Error('Wallet no conectado');
    }

    try {
      console.log(`🗳️ Registrando voto: Sesión ${sessionId}, Ley ${lawId}, Tipo: ${voteType}`);
      
      // Mapear string a número del enum
      const voteValue = VOTE_STATES[voteType];
      if (voteValue === undefined) {
        throw new Error(`Tipo de voto inválido: ${voteType}`);
      }

      // Estimar gas antes de enviar
      const gasEstimate = await this.contract.registrarVoto.estimateGas(
        sessionId, 
        lawId, 
        voteValue
      );
      
      console.log('⛽ Gas estimado:', gasEstimate.toString());

      // Enviar transacción
      const tx = await this.contract.registrarVoto(sessionId, lawId, voteValue, {
        gasLimit: gasEstimate + gasEstimate / 10n // Agregar 10% de margen
      });
      
      console.log('⏳ Transacción enviada:', tx.hash);
      console.log('🔗 Ver en Etherscan:', `https://sepolia.etherscan.io/tx/${tx.hash}`);
      
      // Esperar confirmación
      const receipt = await tx.wait();
      console.log('✅ Voto confirmado en bloque:', receipt.blockNumber);
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`
      };
      
    } catch (error) {
      console.error('❌ Error registrando voto:', error);
      
      // Manejo de errores específicos
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transacción rechazada por el usuario');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Fondos insuficientes para pagar la transacción');
      } else if (error.message.includes('execution reverted')) {
        throw new Error('Transacción revertida: ' + error.reason || 'Error del contrato');
      } else {
        throw new Error(`Error registrando voto: ${error.message}`);
      }
    }
  }

  // Obtener resultados de una ley
  async getLawResults(sessionId, lawId) {
    if (!this.contract) {
      throw new Error('Wallet no conectado');
    }

    try {
      const results = await this.contract.obtenerResultadosLey(sessionId, lawId);
      
      return {
        favor: results[0].toString(),
        contra: results[1].toString(),
        abstenciones: results[2].toString(),
        ausentes: results[3].toString()
      };
    } catch (error) {
      throw new Error(`Error obteniendo resultados: ${error.message}`);
    }
  }

  // Obtener balance de ETH del usuario
  async getBalance() {
    if (!this.provider || !this.userAddress) {
      throw new Error('Wallet no conectado');
    }

    try {
      const balance = await this.provider.getBalance(this.userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Error obteniendo balance: ${error.message}`);
    }
  }

  // Obtener información de la red
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Wallet no conectado');
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        name: network.name,
        chainId: network.chainId.toString(),
        blockNumber: blockNumber,
        isTestnet: network.chainId === 11155111n
      };
    } catch (error) {
      throw new Error(`Error obteniendo info de red: ${error.message}`);
    }
  }

  // Generar mensaje para firmar (autenticación)
  generateAuthMessage() {
    const timestamp = Date.now();
    return `Autenticación en Sistema Legislativo\nDirección: ${this.userAddress}\nTimestamp: ${timestamp}`;
  }

  // Firmar mensaje de autenticación
  async signAuthMessage() {
    if (!this.signer) {
      throw new Error('Wallet no conectado');
    }

    try {
      const message = this.generateAuthMessage();
      const signature = await this.signer.signMessage(message);
      
      return {
        message,
        signature,
        address: this.userAddress
      };
    } catch (error) {
      throw new Error(`Error firmando mensaje: ${error.message}`);
    }
  }

  // Getters para información del estado
  getAddress() {
    return this.userAddress;
  }

  getIsConnected() {
    return this.isConnected;
  }

  getContractAddress() {
    return this.contractAddress;
  }
}

// Instancia singleton del servicio
export const web3Service = new Web3Service();

// Constantes exportadas
export { VOTE_STATES }; 