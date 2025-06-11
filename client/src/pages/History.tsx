import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, X, Loader2 } from 'lucide-react';

interface HistoryLaw {
  _id: string;
  blockchainId: number;
  blockchainSessionId: number;
  title: string;
  description: string;
  author: string;
  party: string;
  category: string;
  status: string;
  finalStatus: string;
  datePresented: string;
  blockchainVotes: {
    favor: number;
    contra: number;
    abstenciones: number;
    ausentes: number;
  };
  projectDocument?: {
    filename: string;
    originalName: string;
  };
}

export function History() {
  const [laws, setLaws] = useState<HistoryLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoryLaws();
  }, []);

  const fetchHistoryLaws = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/laws?status=Finalizada');
      if (!response.ok) {
        throw new Error('Error al obtener el historial de leyes');
      }
      const data = await response.json();
      console.log('Leyes finalizadas obtenidas:', data);
      setLaws(data.laws);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobada':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Historial de Leyes</h1>
        
        {laws.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-gray-600">No hay leyes finalizadas en el historial.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {laws.map((law) => (
              <Card key={law._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{law.title}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {formatDate(law.datePresented)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Presentado por: {law.author}
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {law.party}
                        </span>
                      </p>
                      <p className="mt-2">{law.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(law.finalStatus)}`}>
                          {law.finalStatus}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Check className="h-4 w-4 text-green-600 mr-1" />
                            {law.blockchainVotes.favor}
                          </span>
                          <span className="flex items-center">
                            <X className="h-4 w-4 text-red-600 mr-1" />
                            {law.blockchainVotes.contra}
                          </span>
                          <span className="text-gray-400">
                            ({law.blockchainVotes.abstenciones} abstenciones)
                          </span>
                        </div>
                      </div>
                      {law.projectDocument && (
                        <Button variant="outline" asChild>
                          <a 
                            href={`http://localhost:5001/api/laws/documents/${law.projectDocument.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
