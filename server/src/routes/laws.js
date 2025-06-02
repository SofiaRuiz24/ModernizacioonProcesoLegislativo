import express from 'express';
import { body, validationResult } from 'express-validator';
import Law from '../models/Law.js';

const router = express.Router();

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
router.post('/', [
  body('title').trim().notEmpty().withMessage('Título es requerido'),
  body('description').trim().notEmpty().withMessage('Descripción es requerida'),
  body('author').trim().notEmpty().withMessage('Autor es requerido'),
  body('party').trim().notEmpty().withMessage('Partido es requerido'),
  body('category').notEmpty().withMessage('Categoría es requerida'),
  body('dateExpiry').isISO8601().withMessage('Fecha de expiración debe ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const law = new Law(req.body);
    await law.save();
    res.status(201).json(law);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
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

export default router; 