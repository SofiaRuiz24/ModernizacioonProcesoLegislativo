import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import { Github, Building2, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setError('Las credenciales ingresadas son inválidas');
      }
    } catch (err) {
      setError('Ocurrió un error al intentar iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-gray-100 dark:bg-black">

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r dark:border-gray-900">
        <div className="absolute inset-0 bg-zinc-900 bg-[url('https://www.hcdmza.gob.ar/site/images/Noticias/2023/09-septiembre/WhatsApp_Image_2023-09-26_at_101812.jpeg')] bg-cover bg-center bg-no-repeat opacity-50 dark:opacity-30" />
        <div className="relative z-20 flex items-center text-lg font-medium text-black dark:text-white">
          <Building2 className="h-8 w-8 mr-2" />
          Poder Legislativo
        </div>
        <div className="relative z-20 mt-auto text-black dark:text-white">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Esta plataforma ha revolucionado la forma en que gestionamos nuestros proyectos."
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 dark:bg-black">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Button
            variant="default"
            className="mb-4 flex items-center gap-2 w-full justify-center bg-[#1D2B3E] hover:bg-[#557B97] dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
          <Card className="border-none shadow-none lg:border lg:shadow-sm dark:bg-[#111111] dark:border-gray-900">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</CardTitle>
              <CardDescription className="dark:text-gray-400">Ingresa tus credenciales para acceder al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="admin"
                      type="text"
                      disabled={isLoading}
                      required
                      className="dark:bg-[#1a1a1a] dark:border-gray-800"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      required
                      className="dark:bg-[#1a1a1a] dark:border-gray-800"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                  <Button 
                    disabled={isLoading}
                    className="bg-[#1D2B3E] hover:bg-[#557B97] dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Iniciar Sesión
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
