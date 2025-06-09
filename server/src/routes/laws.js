import express from 'express';
import { body, validationResult } from 'express-validator';
import Law from '../models/Law.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const contractJson = require('../VotacionLegislatura.json');

const router = express.Router();

// Validación de variables de entorno
const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;

if (!contractAddress || !rpcUrl) {
  console.error('❌ Error: Variables de entorno requeridas no configuradas');
  console.error('   Por favor, configura las siguientes variables en tu archivo .env:');
  console.error('   - CONTRACT_ADDRESS: La dirección del contrato desplegado');
  console.error('   - BLOCKCHAIN_RPC_URL: La URL del nodo RPC de la red blockchain');
  process.exit(1);
}

// Crear provider y contrato
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(contractAddress, contractJson.abi, provider);

// Función auxiliar para sincronizar una ley del blockchain
async function syncLawFromBlockchain(sessionId, lawId) {
  try {
    const law = await contract.obtenerLey(sessionId, lawId);
    const resultados = await contract.obtenerResultadosLey(sessionId, lawId);
    
    // Buscar si la ley ya existe
    let existingLaw = await Law.findOne({ 
      blockchainId: Number(lawId),
      blockchainSessionId: Number(sessionId)
    });

    if (existingLaw) {
      // Actualizar ley existente
      existingLaw.title = law.titulo;
      existingLaw.description = law.descripcion;
      existingLaw.blockchainStatus = law.activa;
      existingLaw.blockchainVotes = {
        favor: Number(resultados.votosAFavor),
        contra: Number(resultados.votosEnContra),
        abstenciones: Number(resultados.abstenciones),
        ausentes: Number(resultados.ausentes)
      };
      await existingLaw.save();
      return existingLaw;
    } else {
      // Crear nueva ley
      const newLaw = new Law({
        blockchainId: Number(lawId),
        blockchainSessionId: Number(sessionId),
        title: law.titulo,
        description: law.descripcion,
        author: 'Legislador', // Esto debería venir del frontend
        party: 'Partido', // Esto debería venir del frontend
        category: 'Social', // Esto debería venir del frontend
        blockchainStatus: law.activa,
        blockchainVotes: {
          favor: Number(resultados.votosAFavor),
          contra: Number(resultados.votosEnContra),
          abstenciones: Number(resultados.abstenciones),
          ausentes: Number(resultados.ausentes)
        },
        dateExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días por defecto
      });
      await newLaw.save();
      return newLaw;
    }
  } catch (error) {
    console.error('Error syncing law from blockchain:', error);
    throw error;
  }
}

// Sincronizar todas las leyes de una sesión
router.post('/sync/session/:sessionId', async (req, res) => {
  try {
    const sessionId = BigInt(req.params.sessionId);
    const cantidadLeyes = await contract.obtenerCantidadLeyes(sessionId);
    const leyes = [];

    for (let i = 0; i < cantidadLeyes; i++) {
      const ley = await syncLawFromBlockchain(sessionId, i);
      leyes.push(ley);
    }

    res.json({ message: 'Leyes sincronizadas correctamente', leyes });
  } catch (error) {
    res.status(500).json({ message: 'Error sincronizando leyes', error: error.message });
  }
});

// Sincronizar una ley específica
router.post('/sync/:sessionId/:lawId', async (req, res) => {
  try {
    const sessionId = BigInt(req.params.sessionId);
    const lawId = BigInt(req.params.lawId);
    const ley = await syncLawFromBlockchain(sessionId, lawId);
    res.json(ley);
  } catch (error) {
    res.status(500).json({ message: 'Error sincronizando ley', error: error.message });
  }
});

// Obtener todas las leyes
router.get('/', async (req, res) => {
  try {
    const { status, category, author, search, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const laws = await Law.find(filter)
      .sort({ datePresented: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Law.countDocuments(filter);

    res.json({
      laws,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener una ley por ID
router.get('/:id', async (req, res) => {
  try {
    const law = await Law.findById(req.params.id);
    if (!law) {
      return res.status(404).json({ message: 'Ley no encontrada' });
    }
    res.json(law);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Crear nueva ley
router.post('/', async (req, res) => {
  try {
    const { 
      blockchainSessionId, 
      blockchainId, 
      title, 
      description, 
      author, 
      party, 
      category, 
      dateExpiry 
    } = req.body;

    // Crear la ley en MongoDB
    const law = new Law({
      blockchainSessionId: Number(blockchainSessionId),
      blockchainId: Number(blockchainId),
      title,
      description,
      author,
      party,
      category,
      dateExpiry: dateExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      blockchainStatus: true,
      blockchainVotes: {
        favor: 0,
        contra: 0,
        abstenciones: 0,
        ausentes: 0
      }
    });

    await law.save();
    console.log('✅ Ley creada en MongoDB:', {
      id: law._id,
      blockchainId: law.blockchainId,
      blockchainSessionId: law.blockchainSessionId,
      title: law.title,
      author: law.author
    });
    
    res.status(201).json(law);
  } catch (error) {
    console.error('❌ Error creando ley:', error);
    res.status(500).json({ 
      message: 'Error al crear la ley',
      error: error.message 
    });
  }
});

// Actualizar ley
router.put('/:id', [
  body('title').trim().notEmpty().withMessage('Título es requerido'),
  body('description').trim().notEmpty().withMessage('Descripción es requerida'),
  body('author').trim().notEmpty().withMessage('Autor es requerido'),
  body('party').trim().notEmpty().withMessage('Partido es requerido'),
  body('category').notEmpty().withMessage('Categoría es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const law = await Law.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!law) {
      return res.status(404).json({ message: 'Ley no encontrada' });
    }

    res.json(law);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar ley
router.delete('/:id', async (req, res) => {
  try {
    const law = await Law.findByIdAndDelete(req.params.id);
    if (!law) {
      return res.status(404).json({ message: 'Ley no encontrada' });
    }
    res.json({ message: 'Ley eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Votar por una ley
router.post('/:id/vote', [
  body('action').isIn(['approve', 'reject', 'abstain']).withMessage('Acción de voto inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action } = req.body;
    const law = await Law.findById(req.params.id);

    if (!law) {
      return res.status(404).json({ message: 'Ley no encontrada' });
    }

    // Incrementar el contador correspondiente
    switch (action) {
      case 'approve':
        law.votes.favor += 1;
        break;
      case 'reject':
        law.votes.contra += 1;
        break;
      case 'abstain':
        law.votes.abstenciones += 1;
        break;
    }

    await law.save();
    res.json(law);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Cambiar status de ley
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const law = await Law.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!law) {
      return res.status(404).json({ message: 'Ley no encontrada' });
    }

    res.json(law);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener estadísticas
router.get('/stats/dashboard', async (req, res) => {
  try {
    const total = await Law.countDocuments();
    const pending = await Law.countDocuments({ status: 'Pendiente' });
    const approved = await Law.countDocuments({ status: 'Aprobada' });
    const rejected = await Law.countDocuments({ status: 'Rechazada' });
    const inReview = await Law.countDocuments({ status: 'En revisión' });

    const byCategory = await Law.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      total,
      pending,
      approved,
      rejected,
      inReview,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Función para verificar la ley en blockchain
async function verifyLawInBlockchain(sessionId, lawId) {
  try {
    console.log('🔍 Verificando ley en blockchain:', { sessionId, lawId });
    
    // Intentar obtener la ley directamente primero
    try {
      const law = await contract.obtenerLey(sessionId, lawId);
      console.log('✅ Ley encontrada directamente:', {
        id: law.id.toString(),
        titulo: law.titulo,
        activa: law.activa
      });
      return true;
    } catch (error) {
      console.log('⚠️ No se pudo obtener la ley directamente:', error.message);
    }

    // Si falla la obtención directa, intentar verificar paso a paso
    try {
      const totalSesiones = await contract.obtenerCantidadSesiones();
      console.log('📊 Total de sesiones:', totalSesiones.toString());
      
      if (BigInt(sessionId) > totalSesiones) {
        throw new Error(`La sesión ${sessionId} no existe. Total de sesiones: ${totalSesiones}`);
      }

      const totalLeyes = await contract.obtenerCantidadLeyes(sessionId);
      console.log('📊 Total de leyes en sesión:', totalLeyes.toString());
      
      if (BigInt(lawId) > totalLeyes) {
        throw new Error(`La ley ${lawId} no existe en la sesión ${sessionId}. Total de leyes: ${totalLeyes}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error en verificación paso a paso:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error verificando ley en blockchain:', error);
    throw new Error(`Error al verificar la ley en el blockchain: ${error.message}`);
  }
}

export default router; 