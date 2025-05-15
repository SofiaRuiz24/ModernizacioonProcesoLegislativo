import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Phone, Building2, User } from 'lucide-react';

export function Profile() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Perfil de Usuario</h1>
        
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-indigo-100 shadow-sm mr-4">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Admin User</CardTitle>
                <CardDescription className="text-indigo-600 font-medium">
                  Administrador del Sistema
                </CardDescription>
              </div>
            </div>
            
            <div className="bg-gray-50 p-1 rounded-lg mb-2">
              <div className="flex space-x-2 overflow-x-auto py-2 px-2">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Activo
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  Miembro desde Abril 2025
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  8 proyectos
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 px-6">
            <form className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Información Personal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">Nombre</Label>
                    <Input 
                      id="firstName" 
                      defaultValue="Admin" 
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">Apellido</Label>
                    <Input 
                      id="lastName" 
                      defaultValue="User" 
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="flex items-center gap-2 relative">
                    <Mail className="absolute left-3 h-4 w-4 text-indigo-500" />
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="admin@example.com" 
                      className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">Teléfono</Label>
                  <div className="flex items-center gap-2 relative">
                    <Phone className="absolute left-3 h-4 w-4 text-indigo-500" />
                    <Input 
                      id="phone" 
                      defaultValue="+54 261 555-0100" 
                      className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700">Rol</Label>
                  <div className="flex items-center gap-2 relative">
                    <Building2 className="absolute left-3 h-4 w-4 text-indigo-500" />
                    <Input 
                      id="role" 
                      defaultValue="Administrador del Sistema" 
                      readOnly 
                      className="pl-10 bg-gray-50 border-gray-300 text-gray-600 rounded-lg cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all duration-200"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
