
import { FileText, Star } from "lucide-react";

export function Dashboard() {
  return (
    <div className="grid gap-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Leyes Pendientes</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold">12</span>
              <span className="text-xs text-muted-foreground"> leyes</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Leyes Aprobadas</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold">45</span>
              <span className="text-xs text-muted-foreground"> leyes</span>
            </div>
          </div>
        </div>
      </div>

      {/* entes */}
      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Orden del Día</h2>
          <div className="space-y-4">
            {[
              {
                title: "Ley de Protección Ambiental",
                author: "Juan Pérez",
                date: "2025-04-08",
                status: "En revisión",
              },
              {
                title: "Reforma Educativa 2025",
                author: "María González",
                date: "2025-04-07",
                status: "Pendiente",
              },
              {
                title: "Ley de Transporte Público",
                author: "Carlos Rodríguez",
                date: "2025-04-06",
                status: "En debate",
              },
            ].map((law, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{law.title}</h3>
                  <p className="text-sm text-gray-500">Presentado por: {law.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{law.date}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {law.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {[
              {
                action: "Ley aprobada",
                description: "Ley de Energías Renovables",
                time: "Hace 2 horas",
              },
              {
                action: "Nuevo comentario",
                description: "en Reforma Tributaria 2025",
                time: "Hace 3 horas",
              },
              {
                action: "Ley presentada",
                description: "Ley de Protección al Consumidor",
                time: "Hace 5 horas",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usuarios Activos */}
      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Legisladores Activos</h2>
          <div className="space-y-4">
            {[
              {
                name: "Laura Martínez",
                role: "Legisladora",
                status: "Revisando proyectos",
              },
              {
                name: "Roberto Torres",
                role: "Legislador",
                status: "En sesión",
              },
              {
                name: "Ana Silva",
                role: "Legisladora",
                status: "Presentó nueva ley",
              },
            ].map((user, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium">{user.name[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <span className="text-xs text-green-500">{user.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}