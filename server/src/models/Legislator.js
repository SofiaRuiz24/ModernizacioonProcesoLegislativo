import mongoose from 'mongoose';

const legislatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Activo', 'Inactivo', 'Suspendido'],
    default: 'Activo'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  biography: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Legislator', legislatorSchema); 