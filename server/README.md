# Servidor - Sistema de Modernización del Proceso Legislativo

API REST desarrollada con Node.js, Express y MongoDB para el sistema de gestión legislativa.

## 🚀 Características

- **Autenticación JWT** - Sistema de login y registro
- **Gestión de Legisladores** - CRUD completo para legisladores
- **Gestión de Leyes** - CRUD completo para leyes con sistema de votación
- **Búsqueda y Filtros** - Búsqueda avanzada y filtros por categoría, estado, etc.
- **API RESTful** - Endpoints bien estructurados y documentados
- **Validación de Datos** - Validación robusta con express-validator
- **Manejo de Errores** - Sistema centralizado de manejo de errores

## 📋 Requisitos Previos

- **Node.js** (v16 o superior)
- **MongoDB** (v4.4 o superior) - Instalado y corriendo localmente
- **npm** o **yarn**

## 🛠️ Instalación

1. **Clonar el repositorio** (si aún no lo has hecho)
   ```bash
   git clone <url-del-repositorio>
   cd ModernizacioonProcesoLegislativo/server
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del directorio server:
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/proceso-legislativo
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Verificar que MongoDB esté corriendo**
   ```bash
   # En Windows
   net start MongoDB
   
   # En macOS/Linux
   sudo systemctl start mongod
   # o
   brew services start mongodb-community
   ```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Poblar base de datos con datos de ejemplo
```bash
npm run seed
```

El servidor estará disponible en: `http://localhost:5000`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Legisladores
- `GET /api/legislators` - Obtener todos los legisladores
- `GET /api/legislators/:id` - Obtener un legislador específico
- `POST /api/legislators` - Crear nuevo legislador
- `PUT /api/legislators/:id` - Actualizar legislador
- `DELETE /api/legislators/:id` - Eliminar legislador
- `PATCH /api/legislators/:id/status` - Cambiar estado del legislador

### Leyes
- `GET /api/laws` - Obtener todas las leyes (con paginación y filtros)
- `GET /api/laws/:id` - Obtener una ley específica
- `POST /api/laws` - Crear nueva ley
- `PUT /api/laws/:id` - Actualizar ley
- `DELETE /api/laws/:id` - Eliminar ley
- `POST /api/laws/:id/vote` - Votar por una ley
- `PATCH /api/laws/:id/status` - Cambiar estado de la ley
- `GET /api/laws/stats/dashboard` - Obtener estadísticas

### Utilidades
- `GET /api/health` - Estado del servidor
- `GET /` - Información de la API

## 🔧 Estructura del Proyecto

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── models/
│   │   ├── User.js              # Modelo de Usuario
│   │   ├── Legislator.js        # Modelo de Legislador
│   │   └── Law.js               # Modelo de Ley
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── legislators.js       # Rutas de legisladores
│   │   └── laws.js              # Rutas de leyes
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación
│   ├── utils/
│   │   └── seed.js              # Script para poblar datos
│   └── server.js                # Archivo principal del servidor
├── package.json
└── README.md
```

## 🛡️ Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos, incluye el token en el header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Datos de Ejemplo

Después de ejecutar `npm run seed`, tendrás acceso a:

### Usuarios de prueba:
- **Admin**: admin@legislativo.com / admin123
- **Legislador**: legislador1@congreso.com / legislador123
- **Ciudadano**: ciudadano1@email.com / ciudadano123

### Datos incluidos:
- 3 usuarios con diferentes roles
- 3 legisladores de ejemplo
- 4 leyes de ejemplo con diferentes estados

## 🔍 Filtros y Búsqueda

### Legisladores
- `?status=Activo` - Filtrar por estado
- `?party=Partido Democrático` - Filtrar por partido
- `?search=María` - Búsqueda por nombre o distrito

### Leyes
- `?status=Pendiente` - Filtrar por estado
- `?category=Educación` - Filtrar por categoría
- `?author=María` - Filtrar por autor
- `?search=tecnología` - Búsqueda en título, descripción y tags
- `?page=1&limit=10` - Paginación

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongo --eval "db.stats()"

# Si no está corriendo, iniciarlo
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod
```

### Puerto ya en uso
```bash
# Cambiar el puerto en el archivo .env
PORT=5001
```

### Errores de dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC. 