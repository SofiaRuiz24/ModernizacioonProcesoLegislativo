require('dotenv').config();
const { ContractService } = require('../services/contractService');

async function testContract() {
  console.log('🧪 =======================================');
  console.log('   PRUEBA DEL SMART CONTRACT');
  console.log('🧪 =======================================\n');

  let contractService;
  
  try {
    // Inicializar servicio
    console.log('🔄 Inicializando servicio del contrato...');
    contractService = new ContractService();
    console.log('✅ Servicio inicializado correctamente\n');

    // 1. Verificar información de la red
    console.log('1️⃣ VERIFICANDO INFORMACIÓN DE LA RED');
    console.log('─'.repeat(50));
    
    const networkInfo = await contractService.getNetworkInfo();
    console.log('🌐 Red:', networkInfo.name);
    console.log('🔗 Chain ID:', networkInfo.chainId);
    console.log('📦 Bloque actual:', networkInfo.blockNumber);
    console.log('👤 Admin:', networkInfo.adminAddress);
    console.log('💰 Balance admin:', networkInfo.adminBalance, 'ETH');
    console.log('📄 Contrato:', networkInfo.contractAddress);
    console.log('');

    // 2. Verificar administrador
    console.log('2️⃣ VERIFICANDO ADMINISTRADOR');
    console.log('─'.repeat(50));
    
    const adminAddress = await contractService.getAdminAddress();
    console.log('👑 Administrador del contrato:', adminAddress);
    console.log('');

    // 3. Obtener estado inicial
    console.log('3️⃣ ESTADO INICIAL DEL CONTRATO');
    console.log('─'.repeat(50));
    
    const sessionCount = await contractService.getSessionCount();
    console.log('📊 Sesiones totales:', sessionCount);
    
    if (parseInt(sessionCount) > 0) {
      console.log('\n📋 Información de sesiones existentes:');
      for (let i = 0; i < parseInt(sessionCount); i++) {
        const sessionInfo = await contractService.getSessionInfo(i);
        const lawCount = await contractService.getLawCount(i);
        
        console.log(`   Sesión ${i}:`);
        console.log(`     Fecha: ${sessionInfo.fecha}`);
        console.log(`     Descripción: ${sessionInfo.descripcion}`);
        console.log(`     Activa: ${sessionInfo.activa ? 'Sí' : 'No'}`);
        console.log(`     Leyes: ${lawCount}`);
        
        // Mostrar leyes si existen
        if (parseInt(lawCount) > 0) {
          console.log('     📜 Leyes:');
          for (let j = 0; j < parseInt(lawCount); j++) {
            const lawInfo = await contractService.getLawInfo(i, j);
            const lawResults = await contractService.getLawResults(i, j);
            
            console.log(`       Ley ${j}: ${lawInfo.titulo}`);
            console.log(`         Activa: ${lawInfo.activa ? 'Sí' : 'No'}`);
            console.log(`         Votos - Favor: ${lawResults.favor}, Contra: ${lawResults.contra}, Abstenciones: ${lawResults.abstenciones}`);
          }
        }
        console.log('');
      }
    }

    // 4. Crear una sesión de prueba (si no hay ninguna)
    if (parseInt(sessionCount) === 0) {
      console.log('4️⃣ CREANDO SESIÓN DE PRUEBA');
      console.log('─'.repeat(50));
      
      const currentDate = new Date().toISOString().split('T')[0];
      const result = await contractService.createSession(
        currentDate,
        'Sesión de prueba desde script'
      );
      
      console.log('✅ Sesión creada exitosamente!');
      console.log('📄 TX Hash:', result.txHash);
      console.log('🆔 Session ID:', result.sessionId);
      console.log('📦 Bloque:', result.blockNumber);
      console.log('');

      // 5. Agregar una ley de prueba
      console.log('5️⃣ AGREGANDO LEY DE PRUEBA');
      console.log('─'.repeat(50));
      
      const lawResult = await contractService.addLaw(
        result.sessionId || 0,
        'Ley de Prueba de Blockchain',
        'Esta es una ley de prueba para verificar el funcionamiento del smart contract en la red Sepolia'
      );
      
      console.log('✅ Ley agregada exitosamente!');
      console.log('📄 TX Hash:', lawResult.txHash);
      console.log('🆔 Law ID:', lawResult.lawId);
      console.log('📦 Bloque:', lawResult.blockNumber);
      console.log('');
    }

    // 6. Verificar estado final
    console.log('6️⃣ ESTADO FINAL');
    console.log('─'.repeat(50));
    
    const finalSessionCount = await contractService.getSessionCount();
    console.log('📊 Sesiones totales:', finalSessionCount);
    
    if (parseInt(finalSessionCount) > 0) {
      const lastSessionInfo = await contractService.getSessionInfo(parseInt(finalSessionCount) - 1);
      const lastSessionLawCount = await contractService.getLawCount(parseInt(finalSessionCount) - 1);
      
      console.log(`📋 Última sesión (${parseInt(finalSessionCount) - 1}):`);
      console.log(`   Fecha: ${lastSessionInfo.fecha}`);
      console.log(`   Descripción: ${lastSessionInfo.descripcion}`);
      console.log(`   Activa: ${lastSessionInfo.activa ? 'Sí' : 'No'}`);
      console.log(`   Leyes: ${lastSessionLawCount}`);
    }

    console.log('\n✅ =======================================');
    console.log('   PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ =======================================');

  } catch (error) {
    console.error('\n❌ =======================================');
    console.error('   ERROR EN LA PRUEBA');
    console.error('❌ =======================================');
    console.error('💥 Error:', error.message);
    
    if (error.message.includes('could not detect network')) {
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. Verificar que SEPOLIA_RPC_URL esté correctamente configurado');
      console.error('   2. Verificar conexión a internet');
      console.error('   3. Verificar que el proveedor RPC esté funcionando');
    } else if (error.message.includes('invalid address')) {
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. Verificar que CONTRACT_ADDRESS esté correctamente configurado');
      console.error('   2. Verificar que el contrato esté desplegado en Sepolia');
    } else if (error.message.includes('insufficient funds')) {
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. Verificar que la cuenta admin tenga ETH suficiente');
      console.error('   2. Obtener ETH de prueba de un faucet de Sepolia');
    }
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testContract()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = testContract; 