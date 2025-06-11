import express from 'express';
import { body, validationResult } from 'express-validator';
import Law from '../models/Law.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';
import upload from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
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
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

// Función auxiliar para sincronizar una ley del blockchain
async function syncLawFromBlockchain(sessionId, lawId) {
  try {
    console.log('🔄 Sincronizando ley desde blockchain:', { 
      sessionId: Number(sessionId), 
      lawId: Number(lawId) 
    });
    
    // Verificar que tenemos una wallet configurada
    if (!process.env.PRIVATE_KEY) {
      console.error('❌ No hay una clave privada configurada para el backend');
      throw new Error('Configuración incompleta del backend');
    }

    // Convertir a números regulares
    const sessionIdNum = Number(sessionId);
    const lawIdNum = Number(lawId);

    // Primero verificar si la sesión y la ley existen
    const cantidadLeyes = await contract.obtenerCantidadLeyes(sessionIdNum);
    console.log('📊 Cantidad de leyes en la sesión:', cantidadLeyes.toString());

    if (lawIdNum >= Number(cantidadLeyes)) {
      console.error('❌ La ley no existe en esta sesión:', {
        sessionId: sessionIdNum,
        lawId: lawIdNum,
        totalLeyes: cantidadLeyes.toString()
      });
      throw new Error(`La ley ${lawIdNum} no existe en la sesión ${sessionIdNum}`);
    }

    // Obtener datos de la ley y resultados usando el contrato con wallet
    const law = await contract.obtenerLey(sessionIdNum, lawIdNum);
    const resultados = await contract.obtenerResultadosLey(sessionIdNum, lawIdNum);
    
    console.log('📊 Datos obtenidos del blockchain:', {
      ley: {
        id: law.id.toString(),
        titulo: law.titulo,
        activa: law.activa
      },
      votos: {
        favor: resultados.votosAFavor.toString(),
        contra: resultados.votosEnContra.toString(),
        abstenciones: resultados.abstenciones.toString(),
        ausentes: resultados.ausentes.toString()
      }
    });
    
    // Buscar si la ley ya existe
    let existingLaw = await Law.findOne({ 
      blockchainId: Number(lawId),
      blockchainSessionId: Number(sessionId)
    });

    if (existingLaw) {
      console.log('📝 Actualizando ley existente:', {
        id: existingLaw._id,
        blockchainId: existingLaw.blockchainId,
        blockchainSessionId: existingLaw.blockchainSessionId
      });

      // Actualizar ley existente
      existingLaw.title = law.titulo;
      existingLaw.description = law.descripcion;
      existingLaw.blockchainStatus = law.activa;
      
      // Actualizar votos
      const nuevosVotos = {
        favor: Number(resultados.votosAFavor),
        contra: Number(resultados.votosEnContra),
        abstenciones: Number(resultados.abstenciones),
        ausentes: Number(resultados.ausentes)
      };

      // Solo actualizar si hay cambios en los votos
      if (
        existingLaw.blockchainVotes.favor !== nuevosVotos.favor ||
        existingLaw.blockchainVotes.contra !== nuevosVotos.contra ||
        existingLaw.blockchainVotes.abstenciones !== nuevosVotos.abstenciones ||
        existingLaw.blockchainVotes.ausentes !== nuevosVotos.ausentes
      ) {
        console.log('📊 Actualizando votos:', {
          anteriores: existingLaw.blockchainVotes,
          nuevos: nuevosVotos
        });
        existingLaw.blockchainVotes = nuevosVotos;
      }

      await existingLaw.save();
      console.log('✅ Ley actualizada en MongoDB');
      return existingLaw;
    } else {
      console.log('📝 Creando nueva ley en MongoDB');
      
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
      console.log('✅ Nueva ley creada en MongoDB');
      return newLaw;
    }
  } catch (error) {
    console.error('❌ Error syncing law from blockchain:', error);
    if (error.message.includes('No hay una clave privada configurada')) {
      throw new Error('El backend no está configurado correctamente. Contacta al administrador.');
    }
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
    const sessionId = Number(req.params.sessionId);
    const lawId = Number(req.params.lawId);
    const { action } = req.body; // 'approve', 'reject', o 'abstain'

    console.log('📝 Actualizando votos en MongoDB:', {
      sessionId,
      lawId,
      action
    });

    // Buscar la ley en MongoDB
    const law = await Law.findOne({ 
      blockchainId: lawId,
      blockchainSessionId: sessionId
    });

    if (!law) {
      console.error('❌ Ley no encontrada en MongoDB:', { sessionId, lawId });
      return res.status(404).json({ message: 'Ley no encontrada en la base de datos' });
    }

    // Actualizar los votos según la acción
    switch (action) {
      case 'approve':
        law.blockchainVotes.favor += 1;
        break;
      case 'reject':
        law.blockchainVotes.contra += 1;
        break;
      case 'abstain':
        law.blockchainVotes.abstenciones += 1;
        break;
      default:
        console.error('❌ Acción de voto inválida:', action);
        return res.status(400).json({ message: 'Acción de voto inválida' });
    }

    // Guardar los cambios
    await law.save();
    console.log('✅ Votos actualizados en MongoDB:', {
      ley: law.title,
      votos: law.blockchainVotes
    });

    res.json(law);
  } catch (error) {
    console.error('❌ Error actualizando votos:', error);
    res.status(500).json({ message: 'Error al actualizar los votos', error: error.message });
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
router.post('/', upload.fields([
  { name: 'projectDocument', maxCount: 1 },
  { name: 'signaturesDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📦 Datos recibidos en el backend:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files'
    });

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

    console.log('🔍 Valores extraídos:', {
      blockchainSessionId,
      blockchainId,
      title,
      hasDescription: !!description,
      hasAuthor: !!author,
      hasParty: !!party,
      hasCategory: !!category,
      hasDateExpiry: !!dateExpiry
    });

    // Validar que los IDs sean números válidos
    const sessionId = parseInt(blockchainSessionId);
    const lawId = parseInt(blockchainId);

    console.log('🔢 IDs después de parse:', {
      sessionId,
      lawId,
      originalSessionId: blockchainSessionId,
      originalLawId: blockchainId
    });

    if (isNaN(sessionId) || isNaN(lawId)) {
      console.error('❌ IDs inválidos:', { sessionId, lawId });
      return res.status(400).json({ 
        message: 'Error al crear la ley',
        error: 'IDs de blockchain inválidos'
      });
    }

    // Procesar archivos subidos
    const files = req.files;
    const projectDoc = files?.projectDocument?.[0];
    const signaturesDoc = files?.signaturesDocument?.[0];

    console.log('📄 Archivos procesados:', {
      hasProjectDoc: !!projectDoc,
      hasSignaturesDoc: !!signaturesDoc
    });

    // Crear la ley en MongoDB
    const lawData = {
      blockchainSessionId: sessionId,
      blockchainId: lawId,
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
      },
      projectDocument: projectDoc ? {
        filename: projectDoc.filename,
        originalName: projectDoc.originalname,
        path: projectDoc.path,
        mimetype: projectDoc.mimetype,
        size: projectDoc.size
      } : null,
      signaturesDocument: signaturesDoc ? {
        filename: signaturesDoc.filename,
        originalName: signaturesDoc.originalname,
        path: signaturesDoc.path,
        mimetype: signaturesDoc.mimetype,
        size: signaturesDoc.size
      } : null
    };

    console.log('📝 Datos a guardar en MongoDB:', {
      blockchainSessionId: lawData.blockchainSessionId,
      blockchainId: lawData.blockchainId,
      title: lawData.title,
      hasProjectDoc: !!lawData.projectDocument,
      hasSignaturesDoc: !!lawData.signaturesDocument
    });

    const law = new Law(lawData);
    await law.save();

    console.log('✅ Ley creada en MongoDB:', {
      id: law._id,
      blockchainId: law.blockchainId,
      blockchainSessionId: law.blockchainSessionId,
      title: law.title,
      author: law.author,
      hasProjectDoc: !!law.projectDocument,
      hasSignaturesDoc: !!law.signaturesDocument
    });
    
    res.status(201).json(law);
  } catch (error) {
    console.error('❌ Error creando ley:', error);
    console.error('Detalles del error:', {
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
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

// Agregar ruta para servir archivos PDF
router.get('/documents/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  // Verificar que el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Archivo no encontrado' });
  }

  // Servir el archivo
  res.sendFile(filePath);
});

// Finalizar sesión y actualizar estados de leyes
router.post('/finalize-session/:sessionId', async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    console.log('🔄 Actualizando estados de leyes en MongoDB para sesión:', sessionId);

    // Obtener todas las leyes de la sesión
    const laws = await Law.find({ blockchainSessionId: sessionId });
    console.log(`📊 Procesando ${laws.length} leyes de la sesión`);

    // Actualizar estado de cada ley
    for (const law of laws) {
      try {
        // Calcular resultado final basado en los votos actuales
        const { favor, contra, abstenciones } = law.blockchainVotes;
        const totalVotos = favor + contra + abstenciones;
        
        let finalStatus;
        if (totalVotos === 0) {
          finalStatus = 'Pendiente';
        } else if (favor > contra) {
          finalStatus = 'Aprobada';
        } else if (favor < contra) {
          finalStatus = 'Rechazada';
        } else {
          // En caso de empate, se considera rechazada
          finalStatus = 'Rechazada';
        }

        // Actualizar estados de la ley
        law.status = 'Finalizada';
        law.finalStatus = finalStatus;
        law.blockchainStatus = false;
        
        // Guardar cambios
        await law.save();
        console.log(`✅ Ley ${law.blockchainId} actualizada:`, {
          titulo: law.title,
          votos: law.blockchainVotes,
          estadoFinal: finalStatus,
          status: law.status
        });
      } catch (error) {
        console.error(`❌ Error actualizando ley ${law.blockchainId}:`, error);
        // Continuar con la siguiente ley aunque haya error
      }
    }

    res.json({
      message: 'Estados de leyes actualizados correctamente',
      leyesActualizadas: laws.length,
      detalles: laws.map(law => ({
        id: law.blockchainId,
        titulo: law.title,
        votos: law.blockchainVotes,
        estadoFinal: law.finalStatus,
        status: law.status
      }))
    });

  } catch (error) {
    console.error('❌ Error actualizando estados de leyes:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estados de leyes',
      error: error.message 
    });
  }
});

export default router; 