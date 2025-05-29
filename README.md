# Sistema de Modernización del Proceso Legislativo

Sistema integral de gestión legislativa con integración blockchain para votaciones transparentes y trazables, desarrollado con React, Node.js, MongoDB y Smart Contracts en Solidity.

## 🏗️ Arquitectura del Sistema

### Frontend (React + TypeScript)
- **Framework**: React con TypeScript y Vite
- **UI Components**: Componentes personalizados con Tailwind CSS
- **Estado**: React Hooks para manejo de estado local
- **Autenticación**: Integración con MetaMask + JWT tradicional
- **Tema**: Soporte para modo oscuro/claro

### Backend (Node.js)
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT + verificación de firmas Web3
- **Blockchain**: Integración con Ethereum (Red Sepolia)
- **Storage**: Sistema de archivos para documentos PDF

### Blockchain (Solidity)
- **Red**: Ethereum Sepolia Testnet
- **Wallet**: MetaMask para autenticación y firmas
- **Smart Contract**: `VotacionLegislatura.sol`

## 📊 Funcionalidades Principales

### 1. Gestión de Legisladores
- Registro y administración de legisladores
- Estados: Activo, Licencia, Suspendido
- Información de contacto y afiliación partidaria
- Historial de proyectos presentados

### 2. Sistema de Votación Blockchain
- Votaciones transparentes y auditables
- Tipos de voto: A favor, En contra, Abstención, Presente, Ausente
- Integración con MetaMask para firmas digitales
- Trazabilidad completa en blockchain

### 3. Gestión de Sesiones Legislativas
- Creación y administración de sesiones
- Agenda de leyes a tratar
- Control de estado de sesiones

### 4. Administración de Leyes
- Presentación de nuevos proyectos de ley
- Seguimiento de estado y progreso
- Carga de documentos PDF
- Sistema de categorización

### 5. Búsqueda y Archivo
- Búsqueda avanzada con múltiples filtros
- Archivo histórico de proyectos
- Estadísticas y métricas

## 🛠️ API Endpoints

### Autenticación y Autorización
```
POST /api/auth/login              # Login tradicional
POST /api/auth/logout             # Cerrar sesión
POST /api/auth/refresh-token      # Renovar token
GET  /api/auth/me                 # Obtener usuario actual
POST /api/auth/change-password    # Cambiar contraseña
```

### Gestión de Legisladores
```
GET    /api/legislators                    # Listar todos con filtros
POST   /api/legislators                    # Crear nuevo legislador
GET    /api/legislators/:id               # Obtener legislador específico
PUT    /api/legislators/:id               # Actualizar legislador
DELETE /api/legislators/:id               # Eliminar legislador
PATCH  /api/legislators/:id/status        # Cambiar estado
GET    /api/legislators/:id/projects      # Proyectos de un legislador
```

### Gestión de Sesiones Legislativas
```
GET    /api/sessions                      # Listar sesiones
POST   /api/sessions                      # Crear nueva sesión
GET    /api/sessions/:id                  # Obtener sesión específica
PUT    /api/sessions/:id                  # Actualizar sesión
DELETE /api/sessions/:id                  # Eliminar sesión
PATCH  /api/sessions/:id/finalize         # Finalizar sesión
GET    /api/sessions/active               # Obtener sesión activa
```

### Gestión de Leyes
```
GET    /api/laws                          # Listar leyes con filtros
POST   /api/laws                          # Crear nueva ley
GET    /api/laws/:id                      # Obtener ley específica
PUT    /api/laws/:id                      # Actualizar ley
DELETE /api/laws/:id                      # Eliminar ley
GET    /api/laws/:id/votes                # Obtener votos de una ley
POST   /api/laws/:id/upload-document      # Subir documento PDF
GET    /api/laws/:id/document             # Descargar documento
```

### Sistema de Votación (Blockchain)
```
POST   /api/voting/vote                   # Registrar voto
GET    /api/voting/session/:sessionId/law/:lawId/results  # Resultados
GET    /api/voting/legislator/:address/votes  # Votos de un legislador
POST   /api/voting/register-legislator    # Registrar en blockchain
POST   /api/voting/create-session         # Crear sesión en blockchain
POST   /api/voting/add-law-to-session     # Agregar ley a sesión
```

### Búsqueda y Archivo
```
GET    /api/archive/search                # Búsqueda avanzada
GET    /api/archive/projects              # Proyectos archivados
GET    /api/archive/laws                  # Leyes archivadas
GET    /api/archive/statistics            # Estadísticas históricas
```

### Dashboard y Métricas
```
GET    /api/dashboard/stats               # Estadísticas generales
GET    /api/dashboard/pending-votes       # Votos pendientes
GET    /api/dashboard/recent-activity     # Actividad reciente
GET    /api/dashboard/upcoming-sessions   # Próximas sesiones
```

### Integraciones Web3/MetaMask
```
POST   /api/web3/connect                  # Conectar wallet
POST   /api/web3/verify-signature         # Verificar firma de MetaMask
GET    /api/web3/contract-info            # Información del contrato
POST   /api/web3/deploy-contract          # Desplegar contrato (admin)
```

## 📁 Modelos de Base de Datos (MongoDB)

### User Schema
```javascript
{
  _id: ObjectId,
  walletAddress: String,        // MetaMask address
  name: String,
  email: String,
  phone: String,
  party: String,               // Partido político
  status: String,              // 'Activo', 'Licencia', 'Suspendido'
  role: String,                // 'admin', 'legislador'
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
  isRegisteredOnBlockchain: Boolean
}
```

### Session Schema
```javascript
{
  _id: ObjectId,
  blockchainSessionId: Number,
  title: String,
  description: String,
  date: Date,
  status: String,              // 'active', 'finalized', 'scheduled'
  laws: [ObjectId],           // Referencias a laws
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Law Schema
```javascript
{
  _id: ObjectId,
  blockchainLawId: Number,
  sessionId: ObjectId,
  title: String,
  description: String,
  author: ObjectId,
  category: String,
  status: String,              // 'En revisión', 'Pendiente', 'En debate'
  datePresented: Date,
  dateExpiry: Date,
  documentUrl: String,
  votes: {
    favor: Number,
    contra: Number,
    abstenciones: Number,
    ausentes: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Vote Schema
```javascript
{
  _id: ObjectId,
  sessionId: Number,
  lawId: Number,
  legislatorAddress: String,
  vote: String,                // 'A_FAVOR', 'EN_CONTRA', 'ABSTENCION', 'AUSENTE', 'PRESENTE'
  txHash: String,
  blockNumber: Number,
  timestamp: Date,
  createdAt: Date
}
```

## ⚙️ Configuración del Entorno

### Variables de Entorno (.env)
```bash
# Blockchain Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY
CONTRACT_ADDRESS=DEPLOYED_CONTRACT_ADDRESS
CHAIN_ID=11155111

# Database
MONGODB_URI=mongodb://localhost:27017/legislative_system

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10MB

# Server
PORT=3000
NODE_ENV=development
```

## 🔐 Autenticación Híbrida

### Autenticación Tradicional
- Login con usuario y contraseña
- JWT tokens para sesiones
- Refresh tokens para renovación automática

### Autenticación Web3
- Conectar wallet MetaMask
- Verificación de firmas digitales
- Autenticación sin contraseñas

### Middleware de Verificación
```javascript
const verifyMetaMaskSignature = async (req, res, next) => {
  const { signature, message, address } = req.body;
  
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    req.userAddress = address;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

## 🔗 Integración con Smart Contract

### Smart Contract: VotacionLegislatura.sol

El contrato principal del sistema está desarrollado en Solidity ^0.8.0 y maneja toda la lógica de votación de manera transparente e inmutable.

#### Estructuras Principales

```solidity
enum EstadoVoto { AUSENTE, PRESENTE, A_FAVOR, EN_CONTRA, ABSTENCION }

struct Ley {
    uint256 id;
    string titulo;
    string descripcion;
    uint256 votosAFavor;
    uint256 votosEnContra;
    uint256 abstenciones;
    uint256 ausentes;
    bool activa;
}

struct Sesion {
    uint256 id;
    string fecha;
    string descripcion;
    bool activa;
    uint256[] leyesIds;
}
```

#### Funciones Principales del Smart Contract

**Gestión de Legisladores (Solo Administrador)**
```solidity
function registrarLegislador(address _legislador) public soloAdministrador
function eliminarLegislador(address _legislador) public soloAdministrador
```

**Gestión de Sesiones (Solo Administrador)**
```solidity
function crearSesion(string memory _fecha, string memory _descripcion) public soloAdministrador
function agregarLey(uint256 _idSesion, string memory _titulo, string memory _descripcion) public soloAdministrador
function finalizarSesion(uint256 _idSesion) public soloAdministrador
```

**Sistema de Votación (Solo Legisladores)**
```solidity
function registrarVoto(uint256 _idSesion, uint256 _idLey, EstadoVoto _estadoVoto) public soloLegislador
```

**Funciones de Consulta (Públicas)**
```solidity
function obtenerResultadosLey(uint256 _idSesion, uint256 _idLey) public view returns (uint256, uint256, uint256, uint256)
function obtenerVotoLegislador(uint256 _idSesion, uint256 _idLey, address _legislador) public view returns (EstadoVoto)
function obtenerLey(uint256 _idSesion, uint256 _idLey) public view returns (uint256, string memory, string memory, bool)
```

#### Eventos del Smart Contract
```solidity
event LegisladorRegistrado(address legislador);
event LegisladorEliminado(address legislador);
event SesionCreada(uint256 idSesion, string fecha);
event LeyAgregada(uint256 idSesion, uint256 idLey, string titulo);
event VotoRegistrado(uint256 idSesion, uint256 idLey, address legislador, EstadoVoto voto);
event SesionFinalizada(uint256 idSesion);
```

#### Características de Seguridad

1. **Modificadores de Acceso**:
   - `soloAdministrador`: Solo el deployer del contrato puede ejecutar funciones administrativas
   - `soloLegislador`: Solo direcciones registradas como legisladores pueden votar
   - `sesionActiva`: Solo permite acciones en sesiones activas

2. **Validaciones**:
   - Verificación de existencia de sesiones y leyes
   - Control de estados de votación
   - Prevención de doble registro de legisladores
   - Validación de tipos de voto permitidos

3. **Gestión de Estado**:
   - Permite cambio de votos antes del cierre de sesión
   - Actualización automática de contadores
   - Control de consistencia de datos

### Configuración de Ethers.js
```javascript
const ethers = require('ethers');
const contractABI = require('./VotacionLegislatura.json');

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);
```

### Ejemplo de Registro de Voto
```javascript
const registerVote = async (sessionId, lawId, legislatorAddress, voteType) => {
  try {
    const tx = await contract.registrarVoto(sessionId, lawId, voteType);
    const receipt = await tx.wait();
    
    // Guardar en MongoDB para consultas rápidas
    await Vote.create({
      sessionId,
      lawId,
      legislatorAddress,
      vote: voteType,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date()
    });
    
    return receipt;
  } catch (error) {
    throw new Error(`Error registering vote: ${error.message}`);
  }
};
```

### Integración Frontend-Backend-Blockchain

#### Flujo de Votación
1. **Frontend**: Legislador selecciona su voto en la interfaz
2. **MetaMask**: Solicita firma de transacción al legislador
3. **Smart Contract**: Valida y registra el voto en blockchain
4. **Backend**: Escucha eventos del contrato y actualiza MongoDB
5. **Frontend**: Actualiza la UI con los resultados en tiempo real

#### Sincronización de Datos
```javascript
// Escuchar eventos del contrato
contract.on("VotoRegistrado", async (idSesion, idLey, legislador, voto, event) => {
  console.log(`Voto registrado: ${legislador} votó ${voto} en ley ${idLey}`);
  
  // Actualizar base de datos
  await updateVoteInDatabase({
    sessionId: idSesion,
    lawId: idLey,
    legislatorAddress: legislador,
    vote: voto,
    txHash: event.transactionHash,
    blockNumber: event.blockNumber
  });
  
  // Notificar a clientes conectados via WebSocket
  io.emit('voteUpdated', {
    sessionId: idSesion,
    lawId: idLey,
    results: await getVoteResults(idSesion, idLey)
  });
});
```

## 🚀 Instalación y Despliegue

### Prerequisitos
- Node.js 18+
- MongoDB
- MetaMask wallet
- Cuenta en Sepolia testnet con ETH

### Instalación del Cliente
```bash
cd client
npm install
npm run dev
```

### Instalación del Servidor
```bash
cd server
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Despliegue del Smart Contract
```bash
cd server
npx hardhat compile
npx hardhat deploy --network sepolia
# Copiar la dirección del contrato al .env
```

## 📋 Funcionalidades por Componente

### Frontend Components
- **Header.tsx**: Navegación principal con autenticación
- **DashboardLayout.tsx**: Layout del dashboard con sidebar
- **PendingLaws.tsx**: Gestión de leyes pendientes y votación
- **Legislators.tsx**: CRUD de legisladores
- **SubmitLaw.tsx**: Formulario de presentación de leyes
- **ArchiveSearch.tsx**: Búsqueda avanzada en archivo
- **LoginPage.tsx**: Autenticación híbrida
- **ThemeProvider.tsx**: Manejo de temas oscuro/claro

### Características Destacadas
1. **Votación Transparente**: Todos los votos quedan registrados en blockchain
2. **Trazabilidad Completa**: Historial inmutable de decisiones
3. **Interfaz Intuitiva**: UI moderna y responsive
4. **Búsqueda Avanzada**: Filtros múltiples para encontrar información
5. **Dashboard Analítico**: Métricas y estadísticas en tiempo real
6. **Gestión de Documentos**: Carga y descarga de PDFs
7. **Notificaciones**: Sistema de alertas y recordatorios
8. **Audit Trail**: Registro completo de todas las acciones

## 🔧 Desarrollo

### Estructura del Proyecto
```
ModernizacioonProcesoLegislativo/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── pages/        # Páginas principales
│   │   └── lib/          # Utilidades
├── server/                # Backend Node.js
│   ├── routes/           # Endpoints API
│   ├── models/           # Modelos MongoDB
│   ├── middleware/       # Middleware personalizado
│   ├── contracts/        # Smart contracts
│   └── utils/           # Utilidades
└── README.md            # Este archivo
```

### Scripts Disponibles
```bash
# Cliente
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa del build

# Servidor
npm run dev          # Servidor con hot reload
npm run start        # Servidor de producción
npm run test         # Ejecutar tests
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

**Equipo de Desarrollo**
- Email: desarrollo@legislatura.gov.ar
- Documentación: [Wiki del Proyecto](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

---

**Nota**: Este sistema está diseñado para modernizar los procesos legislativos mediante la implementación de tecnología blockchain, garantizando transparencia, trazabilidad y confianza en las decisiones democráticas. 