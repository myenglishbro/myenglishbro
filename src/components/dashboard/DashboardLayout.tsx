import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, BookOpen,
  Users, HelpCircle, LogOut, Shield, Menu, School, Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { NavUser } from "./NavUser";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ACCENT = "#4C6FFF";

const MebLogoMark = () => (
  <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: 11,
      background: ACCENT, color: "#fff",
      fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20,
      flexShrink: 0,
    }}>m</span>
    <div>
      <span style={{
        display: "block",
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: "#1E2128",
      }}>
        myenglish<span style={{ color: ACCENT }}>bro</span>
      </span>
      <span style={{ display: "block", fontSize: 11, color: "#9296A0", fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
        Learn English
      </span>
    </div>
  </Link>
);

const navigation = [
  { name: "Dashboard",  href: "/dashboard",           icon: LayoutDashboard, activeColor: ACCENT, activeBg: "rgba(76,111,255,0.08)" },
  { name: "Cursos",     href: "/dashboard/courses",   icon: BookOpen,        activeColor: "#10B981", activeBg: "rgba(16,185,129,0.08)" },
  { name: "Community",  href: "/dashboard/community", icon: Users,           activeColor: "#0EA5E9", activeBg: "rgba(14,165,233,0.08)" },
  { name: "Horario",    href: "/dashboard/horario",   icon: Clock,           activeColor: "#F59E0B", activeBg: "rgba(245,158,11,0.08)" },
  { name: "Soporte",    href: "/dashboard/support",   icon: HelpCircle,      activeColor: "#A855F7", activeBg: "rgba(168,85,247,0.08)" },
];

const navLinkStyle = (isActive: boolean, activeColor: string, activeBg: string): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 12,
  padding: "10px 16px", borderRadius: 12, textDecoration: "none",
  fontSize: 14.5, fontWeight: isActive ? 700 : 500,
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  color: isActive ? activeColor : "#52565E",
  background: isActive ? activeBg : "transparent",
  transition: "all 0.15s",
});

export const DashboardLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isAnyAdmin } = useAdminRole();
  const { isTeacher } = useTeacherRole();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      <nav style={{ padding: "24px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{
          padding: "0 16px", fontSize: 11, fontWeight: 700, color: "#B0B4BD",
          letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif", marginBottom: 8,
        }}>Menu</p>

        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setOpen(false)}
              style={navLinkStyle(isActive, item.activeColor, item.activeBg)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#1E2128";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#52565E";
                }
              }}
            >
              <item.icon size={19} style={{ color: isActive ? item.activeColor : "#9296A0", flexShrink: 0 }} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Admin */}
        {isAnyAdmin && (
          <div style={{ paddingTop: 16, marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
            <p style={{
              padding: "0 16px", fontSize: 11, fontWeight: 700, color: "#B0B4BD",
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif", marginBottom: 8,
            }}>Admin</p>
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", borderRadius: 12, textDecoration: "none",
                fontSize: 14.5, fontWeight: location.pathname.startsWith("/admin") ? 700 : 500,
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                color: location.pathname.startsWith("/admin") ? "#EF4444" : "#52565E",
                background: location.pathname.startsWith("/admin") ? "rgba(239,68,68,0.08)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <Shield size={19} style={{ color: "#EF4444", flexShrink: 0 }} />
              <span>Panel Admin</span>
            </Link>
          </div>
        )}

        {/* Teacher */}
        {isTeacher && (
          <div style={{ paddingTop: 16, marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
            <p style={{
              padding: "0 16px", fontSize: 11, fontWeight: 700, color: "#B0B4BD",
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif", marginBottom: 8,
            }}>Docente</p>
            <Link
              to="/teacher"
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", borderRadius: 12, textDecoration: "none",
                fontSize: 14.5, fontWeight: location.pathname.startsWith("/teacher") ? 700 : 500,
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                color: location.pathname.startsWith("/teacher") ? "#F59E0B" : "#52565E",
                background: location.pathname.startsWith("/teacher") ? "rgba(245,158,11,0.08)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <School size={19} style={{ color: "#F59E0B", flexShrink: 0 }} />
              <span>Panel Docente</span>
            </Link>
          </div>
        )}
      </nav>

      <NavUser />

      <div style={{ padding: "0 16px 24px" }}>
        <button
          onClick={() => { logout(); setOpen(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "10px 16px", borderRadius: 12,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
            fontSize: 14.5, fontWeight: 500, color: "#9296A0",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)";
            (e.currentTarget as HTMLElement).style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
            (e.currentTarget as HTMLElement).style.color = "#9296A0";
          }}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F5F4F0" }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          display: "flex", alignItems: "center", gap: 12,
          background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "12px 16px",
          boxShadow: "0 2px 12px -4px rgba(0,0,0,0.08)",
        }}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" style={{ width: 280, padding: 0, display: "flex", flexDirection: "column" }}>
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <div style={{ padding: "24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                <MebLogoMark />
              </div>
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <MebLogoMark />
        </header>
        <main style={{ flex: 1, overflow: "auto", background: "#F5F4F0" }}>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F5F4F0" }}>
      <aside style={{
        width: 260, background: "#fff", flexShrink: 0,
        display: "flex", flexDirection: "column",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "2px 0 16px -8px rgba(0,0,0,0.08)",
      }}>
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <MebLogoMark />
        </div>
        {sidebarContent}
      </aside>
      <main style={{ flex: 1, overflow: "auto", background: "#F5F4F0" }}>
        <Outlet />
      </main>
    </div>
  );
};
