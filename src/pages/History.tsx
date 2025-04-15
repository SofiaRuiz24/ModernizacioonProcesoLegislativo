
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, X } from 'lucide-react';

const historyItems = [
  {
    id: 1,
    title: 'Ley de Energías Renovables',
    author: 'Ana Silva',
    date: '2025-04-01',
    status: 'Aprobada',
    description: 'Ley para promover el uso de energías renovables y reducir la dependencia de combustibles fósiles.',
    votes: { approve: 15, reject: 3 }
  },
  {
    id: 2,
    title: 'Reforma Tributaria 2025',
    author: 'Roberto Torres',
    date: '2025-03-28',
    status: 'Rechazada',
    description: 'Propuesta de modificación del sistema tributario para optimizar la recaudación.',
    votes: { approve: 5, reject: 12 }
  },
  {
    id: 3,
    title: 'Ley de Protección al Consumidor',
    author: 'Laura Martínez',
    date: '2025-03-25',
    status: 'Aprobada',
    description: 'Marco legal para proteger los derechos de los consumidores y regular prácticas comerciales.',
    votes: { approve: 18, reject: 1 }
  },
];

export function History() {


  const getStatusColor = (status: string) => {
    return status === 'Aprobada' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Historial de Leyes</h1>
        
        <div className="space-y-4">
          {historyItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="text-sm font-normal text-gray-500">{item.date}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Presentado por: {item.author}</p>
                    <p className="mt-2">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Check className="h-4 w-4 text-green-600 mr-1" />
                          {item.votes.approve}
                        </span>
                        <span className="flex items-center">
                          <X className="h-4 w-4 text-red-600 mr-1" />
                          {item.votes.reject}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver PDF
                    </Button>
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

export default History;
