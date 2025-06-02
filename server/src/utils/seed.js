import connectDB from '../config/database.js';
import User from '../models/User.js';
import Legislator from '../models/Legislator.js';
import Law from '../models/Law.js';

const seedData = async () => {
  try {
    await connectDB();
    
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await User.deleteMany({});
    await Legislator.deleteMany({});
    await Law.deleteMany({});

    // Crear usuarios de ejemplo
    console.log('👤 Creando usuarios...');
    const users = [
      {
        username: 'admin',
        email: 'admin@legislativo.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'legislador1',
        email: 'legislador1@congreso.com',
        password: 'legislador123',
        role: 'legislator'
      },
      {
        username: 'ciudadano1',
        email: 'ciudadano1@email.com',
        password: 'ciudadano123',
        role: 'citizen'
      }
    ];

    await User.create(users);
    console.log('✅ Usuarios creados');

    // Crear legisladores de ejemplo
    console.log('🏛️ Creando legisladores...');
    const legislators = [
      {
        name: 'María González',
        party: 'Partido Democrático',
        position: 'Diputada',
        district: 'Distrito 1',
        email: 'maria.gonzalez@congreso.com',
        phone: '+505-1234-5678',
        status: 'Activo',
        startDate: new Date('2020-01-01'),
        biography: 'Abogada especializada en derecho constitucional con 15 años de experiencia.'
      },
      {
        name: 'Carlos Rodríguez',
        party: 'Partido Liberal',
        position: 'Senador',
        district: 'Distrito 2',
        email: 'carlos.rodriguez@congreso.com',
        phone: '+505-2345-6789',
        status: 'Activo',
        startDate: new Date('2018-01-01'),
        biography: 'Economista con amplia experiencia en políticas públicas.'
      },
      {
        name: 'Ana Martínez',
        party: 'Partido Verde',
        position: 'Diputada',
        district: 'Distrito 3',
        email: 'ana.martinez@congreso.com',
        phone: '+505-3456-7890',
        status: 'Activo',
        startDate: new Date('2019-01-01'),
        biography: 'Activista ambiental y defensora de los derechos humanos.'
      }
    ];

    await Legislator.create(legislators);
    console.log('✅ Legisladores creados');

    // Crear leyes de ejemplo
    console.log('📜 Creando leyes...');
    const laws = [
      {
        title: 'Ley de Modernización Tecnológica del Estado',
        description: 'Propuesta para digitalizar los procesos gubernamentales y mejorar la eficiencia del Estado.',
        author: 'María González',
        party: 'Partido Democrático',
        category: 'Infraestructura',
        status: 'En debate',
        datePresented: new Date('2024-01-15'),
        dateExpiry: new Date('2024-06-15'),
        documentLink: 'https://example.com/ley1.pdf',
        votes: { favor: 25, contra: 8, abstenciones: 3 },
        tags: ['tecnología', 'digitalización', 'eficiencia'],
        priority: 'Alta'
      },
      {
        title: 'Ley de Protección Ambiental',
        description: 'Legislación para fortalecer la protección del medio ambiente y combatir el cambio climático.',
        author: 'Ana Martínez',
        party: 'Partido Verde',
        category: 'Medio Ambiente',
        status: 'Pendiente',
        datePresented: new Date('2024-02-01'),
        dateExpiry: new Date('2024-08-01'),
        documentLink: 'https://example.com/ley2.pdf',
        votes: { favor: 18, contra: 12, abstenciones: 6 },
        tags: ['medio ambiente', 'sostenibilidad', 'clima'],
        priority: 'Urgente'
      },
      {
        title: 'Ley de Reforma Educativa',
        description: 'Propuesta para mejorar la calidad educativa y garantizar el acceso universal a la educación.',
        author: 'Carlos Rodríguez',
        party: 'Partido Liberal',
        category: 'Educación',
        status: 'En revisión',
        datePresented: new Date('2024-01-30'),
        dateExpiry: new Date('2024-07-30'),
        documentLink: 'https://example.com/ley3.pdf',
        votes: { favor: 22, contra: 10, abstenciones: 4 },
        tags: ['educación', 'reforma', 'acceso universal'],
        priority: 'Alta'
      },
      {
        title: 'Ley de Seguridad Ciudadana',
        description: 'Marco legal para fortalecer la seguridad pública y reducir los índices de criminalidad.',
        author: 'María González',
        party: 'Partido Democrático',
        category: 'Seguridad',
        status: 'Aprobada',
        datePresented: new Date('2023-11-01'),
        dateExpiry: new Date('2024-05-01'),
        documentLink: 'https://example.com/ley4.pdf',
        votes: { favor: 30, contra: 5, abstenciones: 1 },
        tags: ['seguridad', 'criminalidad', 'orden público'],
        priority: 'Urgente'
      }
    ];

    await Law.create(laws);
    console.log('✅ Leyes creadas');

    console.log('🎉 Datos de ejemplo creados exitosamente!');
    console.log('📊 Estadísticas:');
    console.log(`   - Usuarios: ${users.length}`);
    console.log(`   - Legisladores: ${legislators.length}`);
    console.log(`   - Leyes: ${laws.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
    process.exit(1);
  }
};

seedData(); 