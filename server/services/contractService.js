const { ethers } = require('ethers');
const contractABI = require('../contracts/VotacionLegislatura.json').abi;

// Estados de voto del enum del contrato
const VOTE_STATES = {
  AUSENTE: 0,
  PRESENTE: 1,
  A_FAVOR: 2,
  EN_CONTRA: 3,
  ABSTENCION: 4
};

class ContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.adminSigner = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    
    // Contrato con permisos de administrador
    this.adminContract = new ethers.Contract(
      this.contractAddress,
      contractABI,
      this.adminSigner
    );
    
    // Contrato solo lectura
    this.readOnlyContract = new ethers.Contract(
      this.contractAddress,
      contractABI,
      this.provider
    );

    // Inicializar listeners de eventos
    this.initializeEventListeners();
  }

  // Inicializar listeners de eventos del contrato
  initializeEventListeners() {
    console.log('🔊 Iniciando listeners de eventos...');
    
    // Escuchar evento VotoRegistrado
    this.readOnlyContract.on("VotoRegistrado", (idSesion, idLey, legislador, voto, event) => {
      console.log(`📊 Voto registrado: ${legislador} votó ${voto} en ley ${idLey} de sesión ${idSesion}`);
      console.log(`   TX Hash: ${event.log.transactionHash}`);
      
      // Aquí podrías actualizar tu base de datos MongoDB
      this.updateVoteInDatabase({
        sessionId: idSesion.toString(),
        lawId: idLey.toString(),
        legislatorAddress: legislador,
        vote: voto,
        txHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber
      });
    });

    // Escuchar evento LegisladorRegistrado
    this.readOnlyContract.on("LegisladorRegistrado", (legislador, event) => {
      console.log(`👤 Legislador registrado: ${legislador}`);
    });

    // Escuchar evento SesionCreada
    this.readOnlyContract.on("SesionCreada", (idSesion, fecha, event) => {
      console.log(`📅 Sesión creada: ID ${idSesion}, Fecha: ${fecha}`);
    });
  }

  // Actualizar voto en base de datos (placeholder)
  async updateVoteInDatabase(voteData) {
    try {
      // Aquí implementarías la lógica para actualizar MongoDB
      console.log('📝 Actualizando base de datos:', voteData);
    } catch (error) {
      console.error('❌ Error actualizando base de datos:', error);
    }
  }

  // Registrar legislador (solo admin)
  async registerLegislator(legislatorAddress) {
    try {
      console.log(`📝 Registrando legislador: ${legislatorAddress}`);
      
      const tx = await this.adminContract.registrarLegislador(legislatorAddress);
      console.log(`⏳ TX enviada: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Legislador registrado en bloque: ${receipt.blockNumber}`);
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Error registrando legislador:', error);
      throw new Error(`Error registrando legislador: ${error.message}`);
    }
  }

  // Eliminar legislador (solo admin)
  async removeLegislator(legislatorAddress) {
    try {
      const tx = await this.adminContract.eliminarLegislador(legislatorAddress);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new Error(`Error eliminando legislador: ${error.message}`);
    }
  }

  // Crear sesión (solo admin)
  async createSession(date, description) {
    try {
      console.log(`📅 Creando sesión: ${date} - ${description}`);
      
      const tx = await this.adminContract.crearSesion(date, description);
      console.log(`⏳ TX enviada: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Sesión creada en bloque: ${receipt.blockNumber}`);
      
      // Obtener el ID de la sesión del evento
      const sessionCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.readOnlyContract.interface.parseLog(log);
          return parsed.name === 'SesionCreada';
        } catch (e) {
          return false;
        }
      });
      
      let sessionId = null;
      if (sessionCreatedEvent) {
        const parsed = this.readOnlyContract.interface.parseLog(sessionCreatedEvent);
        sessionId = parsed.args.idSesion.toString();
      }
      
      return {
        success: true,
        txHash: receipt.hash,
        sessionId: sessionId,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Error creando sesión:', error);
      throw new Error(`Error creando sesión: ${error.message}`);
    }
  }

  // Agregar ley (solo admin)
  async addLaw(sessionId, title, description) {
    try {
      console.log(`📜 Agregando ley "${title}" a sesión ${sessionId}`);
      
      const tx = await this.adminContract.agregarLey(sessionId, title, description);
      console.log(`⏳ TX enviada: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Ley agregada en bloque: ${receipt.blockNumber}`);
      
      // Obtener el ID de la ley del evento
      const lawAddedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.readOnlyContract.interface.parseLog(log);
          return parsed.name === 'LeyAgregada';
        } catch (e) {
          return false;
        }
      });
      
      let lawId = null;
      if (lawAddedEvent) {
        const parsed = this.readOnlyContract.interface.parseLog(lawAddedEvent);
        lawId = parsed.args.idLey.toString();
      }
      
      return {
        success: true,
        txHash: receipt.hash,
        lawId: lawId,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Error agregando ley:', error);
      throw new Error(`Error agregando ley: ${error.message}`);
    }
  }

  // Finalizar sesión (solo admin)
  async finalizeSession(sessionId) {
    try {
      const tx = await this.adminContract.finalizarSesion(sessionId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new Error(`Error finalizando sesión: ${error.message}`);
    }
  }

  // Obtener resultados de una ley
  async getLawResults(sessionId, lawId) {
    try {
      const results = await this.readOnlyContract.obtenerResultadosLey(sessionId, lawId);
      
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

  // Verificar si una dirección es legislador
  async isLegislator(address) {
    try {
      return await this.readOnlyContract.legisladores(address);
    } catch (error) {
      throw new Error(`Error verificando legislador: ${error.message}`);
    }
  }

  // Obtener información de una ley
  async getLawInfo(sessionId, lawId) {
    try {
      const lawData = await this.readOnlyContract.obtenerLey(sessionId, lawId);
      
      return {
        id: lawData[0].toString(),
        titulo: lawData[1],
        descripcion: lawData[2],
        activa: lawData[3]
      };
    } catch (error) {
      throw new Error(`Error obteniendo ley: ${error.message}`);
    }
  }

  // Obtener información completa de una ley (con votos)
  async getCompleteLawInfo(sessionId, lawId) {
    try {
      const lawData = await this.readOnlyContract.leyes(sessionId, lawId);
      
      return {
        id: lawData[0].toString(),
        titulo: lawData[1],
        descripcion: lawData[2],
        votosAFavor: lawData[3].toString(),
        votosEnContra: lawData[4].toString(),
        abstenciones: lawData[5].toString(),
        ausentes: lawData[6].toString(),
        activa: lawData[7]
      };
    } catch (error) {
      throw new Error(`Error obteniendo ley completa: ${error.message}`);
    }
  }

  // Obtener cantidad de sesiones
  async getSessionCount() {
    try {
      const count = await this.readOnlyContract.obtenerCantidadSesiones();
      return count.toString();
    } catch (error) {
      throw new Error(`Error obteniendo cantidad de sesiones: ${error.message}`);
    }
  }

  // Obtener cantidad de leyes en una sesión
  async getLawCount(sessionId) {
    try {
      const count = await this.readOnlyContract.obtenerCantidadLeyes(sessionId);
      return count.toString();
    } catch (error) {
      throw new Error(`Error obteniendo cantidad de leyes: ${error.message}`);
    }
  }

  // Obtener información de una sesión
  async getSessionInfo(sessionId) {
    try {
      const sessionData = await this.readOnlyContract.sesiones(sessionId);
      
      return {
        id: sessionData[0].toString(),
        fecha: sessionData[1],
        descripcion: sessionData[2],
        activa: sessionData[3]
      };
    } catch (error) {
      throw new Error(`Error obteniendo sesión: ${error.message}`);
    }
  }

  // Obtener voto de un legislador
  async getLegislatorVote(sessionId, lawId, legislatorAddress) {
    try {
      const vote = await this.readOnlyContract.obtenerVotoLegislador(sessionId, lawId, legislatorAddress);
      
      // Convertir número a string del estado
      const voteStates = ['AUSENTE', 'PRESENTE', 'A_FAVOR', 'EN_CONTRA', 'ABSTENCION'];
      return voteStates[vote] || 'DESCONOCIDO';
    } catch (error) {
      throw new Error(`Error obteniendo voto: ${error.message}`);
    }
  }

  // Obtener dirección del administrador
  async getAdminAddress() {
    try {
      return await this.readOnlyContract.administrador();
    } catch (error) {
      throw new Error(`Error obteniendo administrador: ${error.message}`);
    }
  }

  // Verificar estado de la red
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const adminBalance = await this.provider.getBalance(this.adminSigner.address);
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber: blockNumber,
        adminAddress: this.adminSigner.address,
        adminBalance: ethers.formatEther(adminBalance),
        contractAddress: this.contractAddress
      };
    } catch (error) {
      throw new Error(`Error obteniendo info de red: ${error.message}`);
    }
  }
}

module.exports = { ContractService, VOTE_STATES }; 