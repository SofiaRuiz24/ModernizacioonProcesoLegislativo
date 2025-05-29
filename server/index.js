require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

// Seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por ventana de tiempo
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
  }
});
app.use('/api/', limiter);

// Parsing y logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('combined'));

// ==================== VERIFICACIÓN DE CONFIGURACIÓN ====================

const requiredEnvVars = [
  'SEPOLIA_RPC_URL',
  'PRIVATE_KEY',
  'CONTRACT_ADDRESS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Asegúrate de configurar tu archivo .env correctamente');
  process.exit(1);
}

console.log('✅ Variables de entorno verificadas');
console.log(`🔗 Contrato: ${process.env.CONTRACT_ADDRESS}`);
console.log(`🌐 Red: ${process.env.SEPOLIA_RPC_URL.includes('sepolia') ? 'Sepolia' : 'Unknown'}`);

// ==================== RUTAS ====================

// Ruta de salud básica
app.get('/', (req, res) => {
  res.json({
    message: 'Legislative Voting System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      voting: '/api/voting',
      health: '/api/voting/health',
      networkInfo: '/api/voting/network-info'
    },
    timestamp: new Date().toISOString()
  });
});

// Importar y usar rutas de votación
const votingRoutes = require('./routes/voting');
app.use('/api/voting', votingRoutes);

// ==================== MANEJO DE ERRORES ====================

// Middleware de manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/voting/health',
      'GET /api/voting/network-info',
      'POST /api/voting/register-legislator',
      'POST /api/voting/create-session',
      'POST /api/voting/add-law'
    ]
  });
});

// Middleware de manejo de errores globales
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// ==================== INICIO DEL SERVIDOR ====================

const server = app.listen(PORT, () => {
  console.log('\n🚀 =======================================');
  console.log(`📡 Servidor iniciado en puerto ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/voting/health`);
  console.log(`📊 Network info: http://localhost:${PORT}/api/voting/network-info`);
  console.log('🚀 =======================================\n');
});

// ==================== MANEJO GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  console.log('📡 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📡 SIGINT recibido (Ctrl+C), cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app; 