const express = require('express');
const router = express.Router();
const { ContractService, VOTE_STATES } = require('../services/contractService');

// Inicializar servicio del contrato
let contractService;
try {
  contractService = new ContractService();
  console.log('✅ ContractService inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando ContractService:', error.message);
}

// Middleware para verificar que el servicio esté disponible
const checkContractService = (req, res, next) => {
  if (!contractService) {
    return res.status(500).json({ 
      error: 'Servicio de contrato no disponible',
      details: 'Verificar configuración de blockchain'
    });
  }
  next();
};

// ==================== RUTAS ADMINISTRATIVAS ====================

// Registrar legislador (solo admin)
router.post('/register-legislator', checkContractService, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address del legislador es requerido' });
    }

    // Validar formato de dirección Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Formato de dirección inválido' });
    }
    
    const result = await contractService.registerLegislator(address);
    
    res.json({
      message: 'Legislador registrado exitosamente',
      ...result
    });
  } catch (error) {
    console.error('Error en /register-legislator:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'REGISTER_LEGISLATOR_ERROR'
    });
  }
});

// Eliminar legislador (solo admin)
router.delete('/remove-legislator/:address', checkContractService, async (req, res) => {
  try {
    const { address } = req.params;
    
    const result = await contractService.removeLegislator(address);
    
    res.json({
      message: 'Legislador eliminado exitosamente',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear sesión (solo admin)
router.post('/create-session', checkContractService, async (req, res) => {
  try {
    const { date, description } = req.body;
    
    if (!date || !description) {
      return res.status(400).json({ 
        error: 'Fecha y descripción son requeridos' 
      });
    }
    
    const result = await contractService.createSession(date, description);
    
    res.json({
      message: 'Sesión creada exitosamente',
      ...result
    });
  } catch (error) {
    console.error('Error en /create-session:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'CREATE_SESSION_ERROR'
    });
  }
});

// Agregar ley (solo admin)
router.post('/add-law', checkContractService, async (req, res) => {
  try {
    const { sessionId, title, description } = req.body;
    
    if (sessionId === undefined || !title || !description) {
      return res.status(400).json({ 
        error: 'sessionId, title y description son requeridos' 
      });
    }
    
    const result = await contractService.addLaw(sessionId, title, description);
    
    res.json({
      message: 'Ley agregada exitosamente',
      ...result
    });
  } catch (error) {
    console.error('Error en /add-law:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'ADD_LAW_ERROR'
    });
  }
});

// Finalizar sesión (solo admin)
router.patch('/finalize-session/:sessionId', checkContractService, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await contractService.finalizeSession(sessionId);
    
    res.json({
      message: 'Sesión finalizada exitosamente',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE CONSULTA ====================

// Obtener resultados de ley
router.get('/law-results/:sessionId/:lawId', checkContractService, async (req, res) => {
  try {
    const { sessionId, lawId } = req.params;
    
    const results = await contractService.getLawResults(sessionId, lawId);
    
    res.json({
      sessionId,
      lawId,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información de ley
router.get('/law-info/:sessionId/:lawId', checkContractService, async (req, res) => {
  try {
    const { sessionId, lawId } = req.params;
    
    const lawInfo = await contractService.getLawInfo(sessionId, lawId);
    
    res.json({
      sessionId,
      lawId,
      ...lawInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información completa de ley (con votos)
router.get('/law-complete/:sessionId/:lawId', checkContractService, async (req, res) => {
  try {
    const { sessionId, lawId } = req.params;
    
    const lawInfo = await contractService.getCompleteLawInfo(sessionId, lawId);
    
    res.json({
      sessionId,
      lawId,
      ...lawInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar si es legislador
router.get('/is-legislator/:address', checkContractService, async (req, res) => {
  try {
    const { address } = req.params;
    
    const isLegislator = await contractService.isLegislator(address);
    
    res.json({ 
      address,
      isLegislator 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener cantidad de sesiones
router.get('/session-count', checkContractService, async (req, res) => {
  try {
    const count = await contractService.getSessionCount();
    
    res.json({ 
      sessionCount: count 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información de sesión
router.get('/session-info/:sessionId', checkContractService, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionInfo = await contractService.getSessionInfo(sessionId);
    
    res.json({
      sessionId,
      ...sessionInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener cantidad de leyes en sesión
router.get('/law-count/:sessionId', checkContractService, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const count = await contractService.getLawCount(sessionId);
    
    res.json({ 
      sessionId,
      lawCount: count 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener voto de legislador
router.get('/legislator-vote/:sessionId/:lawId/:address', checkContractService, async (req, res) => {
  try {
    const { sessionId, lawId, address } = req.params;
    
    const vote = await contractService.getLegislatorVote(sessionId, lawId, address);
    
    res.json({
      sessionId,
      lawId,
      legislatorAddress: address,
      vote
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información de la red
router.get('/network-info', checkContractService, async (req, res) => {
  try {
    const networkInfo = await contractService.getNetworkInfo();
    
    res.json(networkInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener dirección del administrador
router.get('/admin-address', checkContractService, async (req, res) => {
  try {
    const adminAddress = await contractService.getAdminAddress();
    
    res.json({ 
      adminAddress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE SESIONES COMPLETAS ====================

// Obtener todas las leyes de una sesión
router.get('/session-laws/:sessionId', checkContractService, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Obtener cantidad de leyes
    const lawCount = await contractService.getLawCount(sessionId);
    
    // Obtener información de cada ley
    const laws = [];
    for (let i = 0; i < parseInt(lawCount); i++) {
      const lawInfo = await contractService.getCompleteLawInfo(sessionId, i);
      laws.push({
        ...lawInfo,
        lawId: i
      });
    }
    
    res.json({
      sessionId,
      lawCount,
      laws
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener resumen de todas las sesiones
router.get('/sessions-summary', checkContractService, async (req, res) => {
  try {
    const sessionCount = await contractService.getSessionCount();
    
    const sessions = [];
    for (let i = 0; i < parseInt(sessionCount); i++) {
      const sessionInfo = await contractService.getSessionInfo(i);
      const lawCount = await contractService.getLawCount(i);
      
      sessions.push({
        ...sessionInfo,
        sessionId: i,
        lawCount
      });
    }
    
    res.json({
      sessionCount,
      sessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS AUXILIARES ====================

// Obtener estados de voto disponibles
router.get('/vote-states', (req, res) => {
  res.json({
    voteStates: VOTE_STATES,
    descriptions: {
      AUSENTE: 'El legislador no participó en la votación',
      PRESENTE: 'El legislador estuvo presente pero no votó',
      A_FAVOR: 'Voto a favor de la ley',
      EN_CONTRA: 'Voto en contra de la ley',
      ABSTENCION: 'Abstención de voto'
    }
  });
});

// Health check del servicio
router.get('/health', (req, res) => {
  const isHealthy = !!contractService;
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'Voting API',
    contractService: isHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 