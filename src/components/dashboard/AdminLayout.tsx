import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Users, LogOut, Video, School, Megaphone, Swords, ShoppingBag, Zap, GraduationCap, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import logoAce from "@/assets/logo-ace.png";

export const AdminLayout = () => {
  const { logout } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-background light" style={{ colorScheme: 'light' }}>
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logoAce} alt="Logo" className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Acelingua Language Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {isAdmin && (
            <Link to="/admin/usuarios">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActive("/admin/usuarios")
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Users className={`mr-3 h-5 w-5 ${isActive("/admin/usuarios") ? "text-primary" : "text-muted-foreground"}`} />
                Gestión de Usuarios
              </Button>
            </Link>
          )}
          <Link to="/admin/cursos">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/cursos")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <BookOpen className={`mr-3 h-5 w-5 ${isActive("/admin/cursos") ? "text-primary" : "text-muted-foreground"}`} />
              Gestión de Cursos
            </Button>
          </Link>
          <Link to="/admin/salones">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/salones")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <School className={`mr-3 h-5 w-5 ${isActive("/admin/salones") ? "text-primary" : "text-muted-foreground"}`} />
              Salones
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin/horario">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActive("/admin/horario")
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Clock className={`mr-3 h-5 w-5 ${isActive("/admin/horario") ? "text-primary" : "text-muted-foreground"}`} />
                Horario
              </Button>
            </Link>
          )}
          <Link to="/admin/programas">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/programas")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Video className={`mr-3 h-5 w-5 ${isActive("/admin/programas") ? "text-primary" : "text-muted-foreground"}`} />
              Programas en Vivo
            </Button>
          </Link>
          <Link to="/admin/lessons">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/lessons")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <GraduationCap className={`mr-3 h-5 w-5 ${isActive("/admin/lessons") ? "text-primary" : "text-muted-foreground"}`} />
              Free Lessons
            </Button>
          </Link>
          <Link to="/admin/anuncios">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/anuncios")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Megaphone className={`mr-3 h-5 w-5 ${isActive("/admin/anuncios") ? "text-primary" : "text-muted-foreground"}`} />
              Anuncios
            </Button>
          </Link>
          <Link to="/admin/word-survivor">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/word-survivor")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Swords className={`mr-3 h-5 w-5 ${isActive("/admin/word-survivor") ? "text-primary" : "text-muted-foreground"}`} />
              Word Survivor
            </Button>
          </Link>
          <Link to="/admin/word-survivor-tienda">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/word-survivor-tienda")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <ShoppingBag className={`mr-3 h-5 w-5 ${isActive("/admin/word-survivor-tienda") ? "text-primary" : "text-muted-foreground"}`} />
              Tienda Word Survivor
            </Button>
          </Link>
          <Link to="/admin/word-survivor-recargas">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/admin/word-survivor-recargas")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Zap className={`mr-3 h-5 w-5 ${isActive("/admin/word-survivor-recargas") ? "text-primary" : "text-muted-foreground"}`} />
              Recargas de energía
            </Button>
          </Link>

          <div className="pt-4 mt-4 border-t border-border">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-muted"
              >
                <Home className="mr-3 h-5 w-5 text-muted-foreground" />
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};
