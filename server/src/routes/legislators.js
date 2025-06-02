import express from 'express';
import { body, validationResult } from 'express-validator';
import Legislator from '../models/Legislator.js';

const router = express.Router();

// Obtener todos los legisladores
router.get('/', async (req, res) => {
  try {
    const { status, party, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (party) filter.party = party;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
    }

    const legislators = await Legislator.find(filter).sort({ name: 1 });
    res.json(legislators);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener un legislador por ID
router.get('/:id', async (req, res) => {
  try {
    const legislator = await Legislator.findById(req.params.id);
    if (!legislator) {
      return res.status(404).json({ message: 'Legislador no encontrado' });
    }
    res.json(legislator);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Crear nuevo legislador
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nombre es requerido'),
  body('party').trim().notEmpty().withMessage('Partido es requerido'),
  body('position').trim().notEmpty().withMessage('Posición es requerida'),
  body('district').trim().notEmpty().withMessage('Distrito es requerido'),
  body('email').isEmail().withMessage('Email debe ser válido'),
  body('startDate').isISO8601().withMessage('Fecha de inicio debe ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const legislator = new Legislator(req.body);
    await legislator.save();
    res.status(201).json(legislator);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email ya existe' });
    }
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Actualizar legislador
router.put('/:id', [
  body('name').trim().notEmpty().withMessage('Nombre es requerido'),
  body('party').trim().notEmpty().withMessage('Partido es requerido'),
  body('position').trim().notEmpty().withMessage('Posición es requerida'),
  body('district').trim().notEmpty().withMessage('Distrito es requerido'),
  body('email').isEmail().withMessage('Email debe ser válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const legislator = await Legislator.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!legislator) {
      return res.status(404).json({ message: 'Legislador no encontrado' });
    }

    res.json(legislator);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar legislador
router.delete('/:id', async (req, res) => {
  try {
    const legislator = await Legislator.findByIdAndDelete(req.params.id);
    if (!legislator) {
      return res.status(404).json({ message: 'Legislador no encontrado' });
    }
    res.json({ message: 'Legislador eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Cambiar status de legislador
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const legislator = await Legislator.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!legislator) {
      return res.status(404).json({ message: 'Legislador no encontrado' });
    }

    res.json(legislator);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

export default router; 