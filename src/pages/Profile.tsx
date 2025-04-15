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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
              <div>
                <CardTitle>Admin User</CardTitle>
                <CardDescription>Administrador del Sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" defaultValue="Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" defaultValue="User" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Input id="email" type="email" defaultValue="admin@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input id="phone" defaultValue="+54 261 555-0100" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <Input id="role" defaultValue="Administrador del Sistema" readOnly />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-[#1D2B3E] hover:bg-[#557B97]">
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
