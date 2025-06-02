import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import legislatorRoutes from './routes/legislators.js';
import lawRoutes from './routes/laws.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Variable para rastrear el estado de la conexión
let dbConnected = false;

// Conectar a la base de datos
connectDB().then((connection) => {
  dbConnected = !!connection;
  if (connection) {
    console.log('🎯 Estado de conexión actualizado: CONECTADO');
  } else {
    console.log('🎯 Estado de conexión actualizado: DESCONECTADO');
  }
}).catch((error) => {
  console.error('💥 Error inesperado en connectDB:', error);
  dbConnected = false;
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware para verificar conexión a BD en rutas que la necesitan
const requireDB = (req, res, next) => {
  if (!dbConnected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Base de datos no disponible',
      error: 'MongoDB no está conectado. Verifica que esté corriendo.',
      solutions: [
        'Ejecuta: net start MongoDB (como administrador)',
        'Verifica que MongoDB esté instalado',
        'Configura MongoDB Atlas en tu archivo .env'
      ]
    });
  }
  next();
};

// Rutas principales (con verificación de BD)
app.use('/api', authRoutes);
app.use('/api/legislators', requireDB, legislatorRoutes);
app.use('/api/laws', requireDB, lawRoutes);

// Ruta de health check (sin requerir BD)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbConnected && mongoose.connection.readyState === 1,
      status: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
    }
  });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema de Modernización del Proceso Legislativo',
    version: '1.0.0',
    status: dbConnected ? 'Completamente operacional' : 'MongoDB desconectado',
    database: {
      connected: dbConnected && mongoose.connection.readyState === 1,
      message: dbConnected ? 'Base de datos conectada' : 'Conecta MongoDB para funcionalidad completa'
    },
    endpoints: {
      auth: '/api/auth',
      legislators: '/api/legislators',
      laws: '/api/laws',
      health: '/api/health'
    },
    instructions: !dbConnected ? [
      'Para conectar MongoDB:',
      '1. Ejecuta: net start MongoDB (como administrador)',
      '2. O configura MongoDB Atlas en .env',
      '3. Reinicia el servidor'
    ] : null
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 API disponible en http://localhost:${PORT}`);
  console.log(`📚 Documentación en http://localhost:${PORT}`);
  
  if (!dbConnected) {
    console.log('\n⚠️  ATENCIÓN: MongoDB no está conectado');
    console.log('   El servidor está corriendo pero algunas funciones están limitadas');
    console.log(`   Visita http://localhost:${PORT} para instrucciones\n`);
  }
});

export default app; 