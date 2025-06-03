import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  ChevronDown, 
  FileText, 
  LogOut, 
  Settings,  
  Users, 
  History 
} from 'lucide-react';
import { ThemeSwitcher } from './ui/theme-switcher';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'ghost';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ username: '', email: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5001/api/validate-token', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            username: data.user.username || '',
            email: data.user.email || '',
          });
        }
      } catch (e) { /* ignore error */ }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const navigation: NavSection[] = [
    {
      title: 'Plataforma',
      items: [
        {
          title: 'Inicio',
          icon: <FileText className="mr-2 h-4 w-4" />,
          variant: 'ghost',
          href: '/dashboard'
        },
        {
          title: 'Presentar Proyecto',
          icon: <FileText className="mr-2 h-4 w-4" />,
          variant: 'ghost',
          href: '/dashboard/submit-law'
        },
        {
          title: 'En Sesión',
          icon: <History className="mr-2 h-4 w-4" />,
          variant: 'ghost',
          href: '/dashboard/pending-laws'
        },
        {
          title: 'Historial',
          icon: <History className="mr-2 h-4 w-4" />,
          variant: 'ghost',
          href: '/dashboard/history'
        }
      ]
    },
    {
      title: 'Administración',
      items: [
        {
          title: 'Legisladores',
          icon: <Users className="mr-2 h-4 w-4" />,
          variant: 'ghost',
          href: '/dashboard/legislators'
        },
        {
          title: 'Configuración',
          icon: <Settings className="mr-2 h-4 w-4" />,
          variant: 'ghost',
          href: '/dashboard/settings'
        }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-border bg-card">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <h1 className="text-lg font-semibold">Panel Administrativo</h1>
            <ThemeSwitcher />
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              {navigation.map((section, index) => (
                <div key={index} className="py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <div className="space-y-1">
                    {section.items.map((item, index) => (
                      <Link key={index} to={item.href || '#'}>
                        <Button
                          variant={location.pathname === item.href ? 'default' : 'ghost'}
                          className={cn(
                            'w-full justify-start',
                            location.pathname === item.href
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                              : 'hover:bg-muted'
                          )}
                        >
                          {item.icon}
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <img
                    src="https://github.com/shadcn.png"
                    alt={user.username || 'avatar'}
                    className="mr-2 h-6 w-6 rounded-full"
                  />
                  <span>{user.username || 'Usuario'}</span>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center">
                  <div className="ml-2">
                    <p className="text-sm font-medium leading-none">{user.username || 'Usuario'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || 'Sin email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto md:ml-64 p-8">
        <div className="md:hidden flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Panel Administrativo</h1>
          <ThemeSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
