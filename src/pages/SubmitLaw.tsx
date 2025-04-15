import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';

export function SubmitLaw() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la ley
    console.log({ title, description, file });
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Panel
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Presentar Nueva Ley</CardTitle>
            <CardDescription>
              Complete el formulario para presentar un nuevo proyecto de ley
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Ley</Label>
                <Input
                  id="title"
                  placeholder="Ej: Ley de Protección Ambiental"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describa los objetivos y alcance de la ley..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Documento PDF</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Suba el documento completo de la ley en formato PDF
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-[#1D2B3E] hover:bg-[#557B97]">
                  <FileText className="mr-2 h-4 w-4" />
                  Presentar Ley
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
