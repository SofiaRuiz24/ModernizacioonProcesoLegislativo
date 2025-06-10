import mongoose from 'mongoose';

async function removeIndexes() {
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

    // Eliminar todos los índices excepto _id
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Índice ${index.name} eliminado`);
        } catch (error) {
          console.log(`ℹ️ No se pudo eliminar el índice ${index.name}:`, error.message);
        }
      }
    }

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
removeIndexes(); 