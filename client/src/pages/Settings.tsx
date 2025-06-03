import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

export function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    twoFactorAuth: false
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sincronizar el estado del interruptor con el tema actual
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  // Cambiar el tema cuando se activa/desactiva el interruptor
  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? 'dark' : 'light');
  };

  const handleSave = () => {
    console.log('Guardando configuraciones:', {
      ...settings,
      darkMode: isDarkMode
    });
    // Aquí iría la lógica para guardar las configuraciones
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Configuración</h1>

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Cambiar entre tema claro y oscuro
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
                <Moon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar la preferencia del sistema
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-4 w-4" />
                  <span>Usar tema del sistema</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas del Sistema</Label>
                <p className="text-sm text-gray-500">
                  Recibir alertas sobre nuevas leyes y actualizaciones
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas por Email</Label>
                <p className="text-sm text-gray-500">
                  Recibir actualizaciones por correo electrónico
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-gray-500">
                  Aumentar la seguridad de tu cuenta
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, twoFactorAuth: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cambiar Contraseña</Label>
              <div className="grid gap-2">
                <Input type="password" placeholder="Contraseña actual" />
                <Input type="password" placeholder="Nueva contraseña" />
                <Input type="password" placeholder="Confirmar nueva contraseña" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSave}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Settings;
