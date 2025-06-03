import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, LogIn, Menu, Building2, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from './ui/theme-switcher';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function NavLink({ to, children, className, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-all duration-200',
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado usando userToken
    const userToken = localStorage.getItem('userToken');
    setIsAuthenticated(!!userToken);

    const checkAuth = () => {
      const token = localStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    };
    
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleAuthButtonClick = async () => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const res = await fetch('/api/validate-token', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          navigate('/dashboard');
        } else {
          localStorage.removeItem('userToken');
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch (err) {
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm dark:bg-background/80">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Building2 className="h-8 w-8 text-foreground" />
              <span className="text-xl font-semibold text-foreground hidden sm:inline-block">
                Portal Legislativo
              </span>
            </Link>
          </div>

          {/* Menú de navegación - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NavLink to="/archive-search">
              <Search className="h-4 w-4" />
              Buscar Proyectos
            </NavLink>
            
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            <Button 
              variant="default" 
              className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
              onClick={handleAuthButtonClick}
            >
              {isAuthenticated ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Ir al Panel
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              className="text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={cn(
            'md:hidden fixed inset-x-0 top-16 bg-background/95 backdrop-blur-md border-b border-border shadow-lg transition-all duration-300 transform dark:bg-background/80',
            isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          )}
        >
          <div className="pt-2 pb-3 space-y-1 px-4">
            <NavLink 
              to="/archive-search"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              Buscar Proyectos
            </NavLink>
            <NavLink 
              to="/submit-project"
              onClick={() => setIsMenuOpen(false)}
            >
              <PlusCircle className="h-4 w-4" />
              Presentar Proyecto
            </NavLink>
            <Button
              variant="link"
              className="w-full justify-start p-0"
              onClick={() => {
                handleAuthButtonClick();
                setIsMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-2 text-foreground font-medium px-4 py-2">
                {isAuthenticated ? (
                  <>
                    <User className="h-4 w-4" />
                    Ir al Panel
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
