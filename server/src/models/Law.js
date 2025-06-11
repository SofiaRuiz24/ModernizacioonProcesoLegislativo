import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  favor: { type: Number, default: 0 },
  contra: { type: Number, default: 0 },
  abstenciones: { type: Number, default: 0 }
});

const documentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const lawSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true
  },
  blockchainSessionId: {
    type: Number,
    required: true
  },
  title: String,
  description: String,
  author: String,
  party: String,
  category: String,
  status: {
    type: String,
    enum: ['Pendiente', 'En debate', 'Aprobada', 'Rechazada', 'Finalizada'],
    default: 'Pendiente'
  },
  finalStatus: {
    type: String,
    enum: ['Aprobada', 'Rechazada', 'Pendiente'],
    default: 'Pendiente'
  },
  blockchainStatus: {
    type: Boolean,
    default: true
  },
  blockchainVotes: {
    favor: { type: Number, default: 0 },
    contra: { type: Number, default: 0 },
    abstenciones: { type: Number, default: 0 },
    ausentes: { type: Number, default: 0 }
  },
  datePresented: {
    type: Date,
    default: Date.now
  },
  dateExpiry: Date,
  // Documentos PDF
  projectDocument: {
    type: documentSchema,
    default: null
  },
  signaturesDocument: {
    type: documentSchema,
    default: null
  },
  votes: {
    type: voteSchema,
    default: () => ({})
  },
  tags: [String],
  priority: {
    type: String,
    default: 'Media'
  }
}, {
  timestamps: true
});

// Eliminar cualquier índice existente
lawSchema.indexes().forEach(index => {
  lawSchema.index(index[0], { unique: false });
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