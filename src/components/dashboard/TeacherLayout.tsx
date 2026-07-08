import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Users, LogOut, School } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logoAce from "@/assets/logo-ace.png";

export const TeacherLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-background light" style={{ colorScheme: "light" }}>
      <div className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logoAce} alt="Logo" className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Panel Docente</h1>
              <p className="text-xs text-muted-foreground">Acelingua Language Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/teacher">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                location.pathname === "/teacher"
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Home className={`mr-3 h-5 w-5 ${location.pathname === "/teacher" ? "text-primary" : "text-muted-foreground"}`} />
              Inicio
            </Button>
          </Link>
          <Link to="/teacher">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive("/teacher/salon")
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <BookOpen className={`mr-3 h-5 w-5 ${isActive("/teacher/salon") ? "text-primary" : "text-muted-foreground"}`} />
              Mis Salones
            </Button>
          </Link>

          <div className="pt-4 mt-4 border-t border-border">
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-muted">
                <School className="mr-3 h-5 w-5 text-muted-foreground" />
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

      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};
