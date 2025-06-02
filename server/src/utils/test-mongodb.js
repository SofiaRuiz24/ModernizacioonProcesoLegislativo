import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const testMongoDB = async () => {
  console.log('🔍 DIAGNÓSTICO DE MONGODB');
  console.log('========================\n');
  
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proceso-legislativo';
  console.log(`📍 URI de conexión: ${mongoURI}`);
  console.log(`🔧 Node.js version: ${process.version}`);
  console.log(`📦 Mongoose version: ${mongoose.version}`);
  console.log('\n⏳ Intentando conectar...\n');
  
  try {
    // Intento de conexión con timeout extendido para diagnóstico
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 segundos para diagnóstico
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`🚪 Puerto: ${conn.connection.port}`);
    console.log(`💾 Base de datos: ${conn.connection.name}`);
    console.log(`📊 Estado de conexión: ${conn.connection.readyState}`);
    
    // Probar una operación simple
    console.log('\n🧪 Probando operación básica...');
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Colecciones encontradas: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Lista de colecciones:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }
    
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔐 Conexión cerrada correctamente');
    console.log('\n🎉 MongoDB está funcionando perfectamente!');
    
  } catch (error) {
    console.log('❌ ERROR EN LA CONEXIÓN');
    console.log('======================');
    console.log(`🚨 Mensaje: ${error.message}`);
    console.log(`🔍 Código: ${error.code || 'N/A'}`);
    console.log(`📝 Nombre: ${error.name || 'N/A'}`);
    
    console.log('\n🔧 DIAGNÓSTICOS ESPECÍFICOS:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ MongoDB no está corriendo o no acepta conexiones');
      console.log('💡 Soluciones:');
      console.log('   1. Inicia MongoDB: net start MongoDB (Windows)');
      console.log('   2. Verifica el puerto: netstat -an | findstr :27017');
      console.log('   3. Verifica el servicio: sc query MongoDB');
      
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ No se puede resolver el hostname');
      console.log('💡 Soluciones:');
      console.log('   1. Verifica la URL de conexión');
      console.log('   2. Prueba con 127.0.0.1 en lugar de localhost');
      
    } else if (error.name === 'MongoServerSelectionError') {
      console.log('❌ No se puede seleccionar un servidor MongoDB');
      console.log('💡 Soluciones:');
      console.log('   1. Verifica que MongoDB esté corriendo');
      console.log('   2. Verifica la configuración de red');
      console.log('   3. Revisa los logs de MongoDB');
      
    } else if (error.name === 'MongooseServerSelectionError') {
      console.log('❌ Error de selección de servidor de Mongoose');
      console.log('💡 El problema está en la conexión inicial');
      
    } else {
      console.log('❓ Error desconocido - revisa la configuración');
    }
    
    console.log('\n🛠️ COMANDOS ÚTILES PARA DIAGNOSTICAR:');
    console.log('Windows:');
    console.log('   net start MongoDB');
    console.log('   sc query MongoDB');
    console.log('   netstat -an | findstr :27017');
    console.log('   mongosh --eval "db.runCommand({ping: 1})"');
    console.log('\nmacOS/Linux:');
    console.log('   brew services start mongodb-community');
    console.log('   sudo systemctl status mongod');
    console.log('   netstat -tulpn | grep :27017');
    console.log('   mongosh --eval "db.runCommand({ping: 1})"');
  }
  
  process.exit(0);
};

// Ejecutar diagnóstico
testMongoDB().catch(console.error); 