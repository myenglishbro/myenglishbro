import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, BookOpen,
  Users, HelpCircle, LogOut, Shield, Menu, X, School
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { NavUser } from "./NavUser";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoAce from "@/assets/logo-ace.png";
import { useState } from "react";

export const DashboardLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isAnyAdmin } = useAdminRole();
  const { isTeacher } = useTeacherRole();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-indigo-500" },
    { name: "Cursos", href: "/dashboard/courses", icon: BookOpen, color: "text-emerald-500" },
    { name: "Community", href: "/dashboard/community", icon: Users, color: "text-sky-500" },
    { name: "Soporte", href: "/dashboard/support", icon: HelpCircle, color: "text-violet-500" },
  ];

  const sidebarContent = (
    <>
      {/* Navigation */}
      <nav className="px-4 py-6 space-y-1.5 flex-1">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Menu</p>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "dashboard-nav-item",
                isActive
                  ? "dashboard-nav-item-active"
                  : "text-slate-600 dashboard-nav-item-hover"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : item.color)} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Admin Panel Link */}
        {isAnyAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Admin</p>
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "dashboard-nav-item",
                location.pathname.startsWith("/admin")
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-red-50 hover:text-red-600"
              )}
            >
              <Shield className="h-5 w-5 text-red-500" />
              <span>Panel Admin</span>
            </Link>
          </div>
        )}

        {/* Teacher Panel Link */}
        {isTeacher && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Docente</p>
            <Link
              to="/teacher"
              onClick={() => setOpen(false)}
              className={cn(
                "dashboard-nav-item",
                location.pathname.startsWith("/teacher")
                  ? "bg-amber-50 text-amber-600"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-600"
              )}
            >
              <School className="h-5 w-5 text-amber-500" />
              <span>Panel Docente</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Nav User */}
      <NavUser />

      {/* Logout button */}
      <div className="px-4 pb-6">
        <Button
          onClick={() => { logout(); setOpen(false); }}
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="dashboard min-h-screen flex flex-col w-full bg-slate-50">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center gap-3 bg-white border-b border-slate-200/80 px-4 py-3 shadow-soft">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              {/* Logo in drawer */}
              <div className="p-6 border-b border-slate-100">
                <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                  <img src={logoAce} alt="Acelingua" className="h-10 w-10 rounded-xl shadow-soft" />
                  <div>
                    <span className="text-lg font-bold text-slate-800 font-display">Acelingua</span>
                    <span className="block text-xs text-slate-400">Language Center</span>
                  </div>
                </Link>
              </div>
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAce} alt="Acelingua" className="h-8 w-8 rounded-lg shadow-soft" />
            <span className="text-base font-bold text-slate-800 font-display">Acelingua</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard min-h-screen flex w-full bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="w-[260px] bg-white border-r border-slate-200/80 flex-shrink-0 flex flex-col shadow-soft">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoAce} alt="Acelingua" className="h-10 w-10 rounded-xl shadow-soft" />
            <div>
              <span className="text-lg font-bold text-slate-800 font-display">Acelingua</span>
              <span className="block text-xs text-slate-400">Language Center</span>
            </div>
          </Link>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};