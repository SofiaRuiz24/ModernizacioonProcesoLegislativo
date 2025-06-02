import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proceso-legislativo';
    
    console.log('🔄 Intentando conectar a MongoDB...');
    console.log(`📍 URI de conexión: ${mongoURI}`);
    
    // Configuración moderna de Mongoose (sin opciones obsoletas)
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 segundos - tiempo suficiente
      socketTimeoutMS: 45000,
      family: 4, // Usar IPv4, evita problemas de IPv6
      maxPoolSize: 10, // Máximo 10 conexiones en el pool
      minPoolSize: 5,  // Mínimo 5 conexiones en el pool
      maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30s
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    
    console.log(`✅ MongoDB conectado exitosamente: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    
    // Event listeners para la conexión
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    
    // Mostrar detalles específicos del error
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 PROBLEMA: Conexión rechazada');
      console.log('   MongoDB no está corriendo o no está accesible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 PROBLEMA: Host no encontrado');
      console.log('   Verifica la URL de conexión');
    } else {
      console.log('\n🔧 PROBLEMA:', error.code || 'Error desconocido');
    }
    
    console.log('\n💡 SOLUCIONES POSIBLES:');
    console.log('1. Verifica que MongoDB esté corriendo:');
    console.log('   - Windows: net start MongoDB');
    console.log('   - macOS: brew services start mongodb-community');
    console.log('   - Linux: sudo systemctl start mongod');
    console.log('2. Verifica que MongoDB esté escuchando en el puerto 27017');
    console.log('3. Prueba la conexión manualmente: mongosh "mongodb://localhost:27017/proceso-legislativo"');
    console.log('4. Si usas Docker: docker run -d -p 27017:27017 mongo');
    console.log('\n⚠️ El servidor seguirá corriendo sin base de datos');
    console.log('   Algunas funciones no estarán disponibles hasta que se conecte MongoDB\n');
    
    return null;
  }
};

export default connectDB; 