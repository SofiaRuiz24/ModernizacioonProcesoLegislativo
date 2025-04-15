
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ThumbsUp, ThumbsDown } from 'lucide-react';

const pendingLaws = [
  {
    id: 1,
    title: 'Ley de Protección Ambiental',
    author: 'Juan Pérez',
    date: '2025-04-08',
    status: 'En revisión',
    description: 'Esta ley propone medidas para proteger el medio ambiente y promover prácticas sostenibles...',
  },
  {
    id: 2,
    title: 'Reforma Educativa 2025',
    author: 'María González',
    date: '2025-04-07',
    status: 'Pendiente',
    description: 'Propuesta de reforma integral del sistema educativo para mejorar la calidad de la enseñanza...',
  },
  {
    id: 3,
    title: 'Ley de Transporte Público',
    author: 'Carlos Rodríguez',
    date: '2025-04-06',
    status: 'En debate',
    description: 'Proyecto para modernizar y mejorar el sistema de transporte público en la ciudad...',
  },
];

export function PendingLaws() {

  const handleVote = (id: number, vote: 'approve' | 'reject') => {
    console.log(`Voted ${vote} on law ${id}`);
    // Aquí iría la lógica para procesar el voto
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Leyes Pendientes de Aprobación</h1>
        
        <div className="space-y-4">
          {pendingLaws.map((law) => (
            <Card key={law.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{law.title}</span>
                  <span className="text-sm font-normal text-gray-500">{law.date}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Presentado por: {law.author}</p>
                    <p className="mt-2">{law.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {law.status}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleVote(law.id, 'approve')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleVote(law.id, 'reject')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PendingLaws;
