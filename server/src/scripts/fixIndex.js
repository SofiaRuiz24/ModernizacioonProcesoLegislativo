import mongoose from 'mongoose';
import Law from '../models/Law.js';

async function fixIndex() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proceso-legislativo');
    console.log('📦 Conectado a MongoDB');

    // Obtener la colección
    const collection = mongoose.connection.collection('laws');
    
    // Listar todos los índices
    console.log('🔍 Índices actuales:');
    const indexes = await collection.indexes();
    console.log(indexes);

    // Eliminar el índice problemático si existe
    try {
      await collection.dropIndex('blockchainSessionId_blockchainId_1');
      console.log('✅ Índice blockchainSessionId_blockchainId_1 eliminado');
    } catch (error) {
      console.log('ℹ️ El índice no existía o ya fue eliminado');
    }

    // Crear el nuevo índice usando el modelo
    await Law.createIndexes();
    console.log('✅ Nuevos índices creados');

    // Verificar los índices finales
    console.log('🔍 Índices finales:');
    const finalIndexes = await collection.indexes();
    console.log(finalIndexes);

    console.log('✨ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar el script
fixIndex(); 