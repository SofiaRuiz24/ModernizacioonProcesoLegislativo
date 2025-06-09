import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  favor: { type: Number, default: 0 },
  contra: { type: Number, default: 0 },
  abstenciones: { type: Number, default: 0 }
});

const lawSchema = new mongoose.Schema({
  blockchainId: Number,
  blockchainSessionId: Number,
  title: String,
  description: String,
  author: String,
  party: String,
  category: String,
  status: {
    type: String,
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
  documentLink: String,
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

// Método para calcular días restantes
lawSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const expiry = new Date(this.dateExpiry);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

export default mongoose.model('Law', lawSchema); 