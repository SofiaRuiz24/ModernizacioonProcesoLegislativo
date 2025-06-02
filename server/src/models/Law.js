import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  favor: { type: Number, default: 0 },
  contra: { type: Number, default: 0 },
  abstenciones: { type: Number, default: 0 }
});

const lawSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Económica', 'Social', 'Educación', 'Salud', 'Seguridad', 'Medio Ambiente', 'Infraestructura', 'Justicia']
  },
  status: {
    type: String,
    enum: ['En revisión', 'Pendiente', 'En debate', 'Aprobada', 'Rechazada'],
    default: 'Pendiente'
  },
  datePresented: {
    type: Date,
    default: Date.now
  },
  dateExpiry: {
    type: Date,
    required: true
  },
  documentLink: {
    type: String,
    trim: true
  },
  votes: {
    type: voteSchema,
    default: () => ({})
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['Baja', 'Media', 'Alta', 'Urgente'],
    default: 'Media'
  }
}, {
  timestamps: true
});

// Método para calcular días restantes
lawSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const expiry = new Date(this.dateExpiry);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

export default mongoose.model('Law', lawSchema); 