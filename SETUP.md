# 🚀 Guía de Configuración - Sistema Legislativo con Blockchain

Esta guía te ayudará a configurar y ejecutar el sistema completo con integración blockchain.

## 📋 Prerequisitos

### Herramientas Necesarias
- **Node.js** 18+ 
- **npm** o **yarn**
- **MetaMask** (extensión del navegador)
- **Git**

### Cuentas y Servicios
- Cuenta en [Infura](https://infura.io/) (para RPC de Sepolia)
- ETH de prueba en Sepolia (de faucets)
- Tu contrato ya desplegado en Sepolia desde Remix

## 🔧 Configuración del Servidor

### 1. Instalar Dependencias
```bash
cd server
npm install
```

### 2. Configurar Variables de Entorno
Crear archivo `server/.env`:
```bash
# ======== BLOCKCHAIN CONFIGURATION ========
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_PROJECT_ID_INFURA
PRIVATE_KEY=TU_PRIVATE_KEY_SIN_0x
CONTRACT_ADDRESS=TU_DIRECCION_CONTRATO_DESDE_REMIX

# ======== SERVER CONFIGURATION ========
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ======== DATABASE (Opcional) ========
MONGODB_URI=mongodb://localhost:27017/legislative_system

# ======== AUTHENTICATION (Opcional) ========
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h
```

### 3. Obtener las Claves Necesarias

#### **Infura Project ID**
1. Ir a [infura.io](https://infura.io/)
2. Crear cuenta gratuita
3. Crear nuevo proyecto "Web3 API"
4. Copiar el Project ID

#### **Private Key de MetaMask**
1. Abrir MetaMask
2. Hacer clic en los 3 puntos → Configuración → Seguridad y privacidad
3. "Revelar clave privada"
4. Ingresar contraseña
5. **¡IMPORTANTE!** Copiar SIN el prefijo "0x"

#### **Contract Address**
- Dirección que obtuviste cuando desplegaste en Remix
- Formato: `0x1234567890abcdef...`

### 4. Verificar Configuración
```bash
# Probar conexión al contrato
npm run test-contract
```

### 5. Iniciar Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará en: `http://localhost:3000`

## 🌐 Configuración del Cliente

### 1. Instalar Dependencias
```bash
cd client
npm install ethers@^6.8.0
```

### 2. Configurar Variables de Entorno
Crear archivo `client/.env`:
```bash
VITE_CONTRACT_ADDRESS=TU_DIRECCION_CONTRATO_DESDE_REMIX
VITE_API_URL=http://localhost:3000
```

### 3. Iniciar Cliente
```bash
npm run dev
```

El cliente estará en: `http://localhost:5173`

## 🦊 Configuración de MetaMask

### 1. Agregar Red Sepolia
- **Nombre de red**: Sepolia Test Network
- **Nueva URL de RPC**: `https://sepolia.infura.io/v3/`
- **ID de cadena**: `11155111`
- **Símbolo de moneda**: `ETH`
- **URL del explorador de bloques**: `https://sepolia.etherscan.io/`

### 2. Obtener ETH de Prueba
Visitar cualquiera de estos faucets:
- [sepoliafaucet.com](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [pk910 Sepolia Faucet](https://sepolia-faucet.pk910.de/)

### 3. Importar Cuenta Admin (Opcional)
Si quieres usar la misma cuenta que desplegó el contrato:
1. MetaMask → Importar cuenta
2. Pegar la private key
3. Cambiar a red Sepolia

## 🧪 Probar la Integración

### 1. Verificar Servidor
```bash
# Health check
curl http://localhost:3000/api/voting/health

# Info de red
curl http://localhost:3000/api/voting/network-info

# Cantidad de sesiones
curl http://localhost:3000/api/voting/session-count
```

### 2. Probar Frontend
1. Abrir `http://localhost:5173`
2. Ir a la página de votación
3. Conectar MetaMask
4. Verificar que detecta si eres legislador

### 3. Crear Datos de Prueba (Como Admin)
```bash
# Crear sesión
curl -X POST http://localhost:3000/api/voting/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-15",
    "description": "Sesión de prueba"
  }'

# Agregar ley
curl -X POST http://localhost:3000/api/voting/add-law \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 0,
    "title": "Ley de Prueba",
    "description": "Ley para probar el sistema"
  }'

# Registrar legislador
curl -X POST http://localhost:3000/api/voting/register-legislator \
  -H "Content-Type: application/json" \
  -d '{
    "address": "TU_DIRECCION_METAMASK"
  }'
```

## 🎯 Flujo de Votación Completo

### 1. Preparación (Admin)
1. Crear sesión legislativa
2. Agregar leyes a la sesión
3. Registrar legisladores

### 2. Votación (Legislador)
1. Conectar MetaMask
2. Verificar que está registrado como legislador
3. Votar en las leyes disponibles

### 3. Resultados
1. Ver resultados en tiempo real
2. Verificar transacciones en Etherscan
3. Consultar histórico de votos

## 🔍 Solución de Problemas

### Error: "could not detect network"
**Causa**: RPC URL incorrecto o sin conexión
**Solución**:
1. Verificar `SEPOLIA_RPC_URL` en `.env`
2. Verificar que Infura esté funcionando
3. Probar con otro RPC público

### Error: "invalid address"
**Causa**: Dirección del contrato incorrecta
**Solución**:
1. Verificar `CONTRACT_ADDRESS` en `.env`
2. Confirmar que el contrato está desplegado en Sepolia
3. Verificar en Etherscan

### Error: "insufficient funds"
**Causa**: Sin ETH para gas
**Solución**:
1. Obtener ETH de faucets de Sepolia
2. Verificar balance en MetaMask

### Error: "user rejected transaction"
**Causa**: Usuario canceló en MetaMask
**Solución**:
1. Volver a intentar la transacción
2. Verificar que el gas es razonable

### Error: "execution reverted"
**Causa**: Error del smart contract
**Solución**:
1. Verificar que el usuario esté registrado como legislador
2. Verificar que la sesión esté activa
3. Verificar que la ley existe

## 📁 Estructura de Archivos

```
proyecto/
├── server/
│   ├── contracts/
│   │   └── VotacionLegislatura.json     # ABI del contrato
│   ├── services/
│   │   └── contractService.js           # Servicio principal
│   ├── routes/
│   │   └── voting.js                    # Endpoints API
│   ├── scripts/
│   │   └── testContract.js              # Script de prueba
│   ├── package.json                     # Dependencias
│   ├── index.js                         # Servidor principal
│   └── .env                            # Variables de entorno
├── client/
│   ├── src/
│   │   ├── services/
│   │   │   └── web3Service.js           # Servicio Web3
│   │   ├── hooks/
│   │   │   └── useVoting.js             # Hook de votación
│   │   └── pages/
│   │       └── PendingLaws.tsx          # Página de votación
│   └── .env                            # Variables de entorno cliente
└── README.md                           # Documentación principal
```

## 🎉 ¡Todo Listo!

Si has seguido todos los pasos, deberías tener:

✅ Servidor funcionando en puerto 3000  
✅ Cliente funcionando en puerto 5173  
✅ MetaMask configurado con Sepolia  
✅ Contrato conectado y funcionando  
✅ Capacidad de votar desde la UI  

## 🆘 Soporte

Si encuentras problemas:

1. Revisar logs del servidor y cliente
2. Verificar configuración de variables de entorno
3. Probar endpoints individuales con curl
4. Verificar transacciones en Etherscan

**¡Feliz votación blockchain!** 🗳️⛓️ 