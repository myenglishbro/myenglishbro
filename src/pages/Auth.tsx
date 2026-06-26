import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validations";

const ACCENT = "#4C6FFF";

const COUNTRY_CODES = [
  { code: "+51",  flag: "🇵🇪", name: "Perú" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "+52",  flag: "🇲🇽", name: "México" },
  { code: "+54",  flag: "🇦🇷", name: "Argentina" },
  { code: "+56",  flag: "🇨🇱", name: "Chile" },
  { code: "+58",  flag: "🇻🇪", name: "Venezuela" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+55",  flag: "🇧🇷", name: "Brasil" },
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+1",   flag: "🇺🇸", name: "Estados Unidos" },
  { code: "+1",   flag: "🇨🇦", name: "Canadá" },
  { code: "+34",  flag: "🇪🇸", name: "España" },
  { code: "+44",  flag: "🇬🇧", name: "Reino Unido" },
  { code: "+49",  flag: "🇩🇪", name: "Alemania" },
  { code: "+33",  flag: "🇫🇷", name: "Francia" },
  { code: "+39",  flag: "🇮🇹", name: "Italia" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
];

const MebLogo = ({ size = 32 }: { size?: number }) => (
  <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: size * 0.31,
      background: ACCENT, color: "#fff",
      fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800,
      fontSize: size * 0.56, lineHeight: 1, flexShrink: 0,
    }}>m</span>
    <span style={{
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontWeight: 700, fontSize: size * 0.56, letterSpacing: "-0.02em", color: "#1E2128",
    }}>
      myenglish<span style={{ color: ACCENT }}>bro</span>
    </span>
  </Link>
);

const Auth = () => {
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+51");
  const [showPassword, setShowPassword] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register" || tab === "login") setActiveTab(tab);
  }, [searchParams]);

  const fadeUp = (ms = 0): React.CSSProperties => ({
    opacity: show ? 1 : 0,
    transform: show ? "none" : "translateY(14px)",
    transition: `opacity .6s ease ${ms}ms, transform .6s ease ${ms}ms`,
  });

  const getHomeUrl = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "teacher")
      .maybeSingle();
    return data ? "/teacher" : "/dashboard";
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
      });
      if (!parsed.success) {
        toast.error(parsed.error.errors[0]?.message || "Datos inválidos");
        setIsLoading(false);
        return;
      }
      const { error, user: loggedUser } = await login(parsed.data.email, parsed.data.password);
      if (error) {
        let msg = "Error al iniciar sesión";
        if (error.message?.includes("Invalid login credentials") || error.message?.includes("email_not_confirmed")) {
          msg = "Credenciales incorrectas. Verifica tu email y contraseña.";
        } else if (error.message?.includes("fetch")) {
          msg = "Error de conexión. Verifica tu internet e intenta de nuevo.";
        } else if (error.message) {
          msg = error.message;
        }
        toast.error(msg);
        setIsLoading(false);
      } else {
        toast.success("¡Bienvenido de nuevo!");
        const url = await getHomeUrl(loggedUser!.id);
        window.location.href = url;
      }
    } catch {
      toast.error("Error inesperado. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      countryCode,
      phone: formData.get("phone"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Datos inválidos");
      setIsLoading(false);
      return;
    }
    const { error } = await register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
      `${parsed.data.countryCode}${parsed.data.phone}`
    );
    if (error) {
      const msg =
        error.message?.includes("already registered")
          ? "Este email ya está registrado. Intenta iniciar sesión."
          : error.message || "Error al crear la cuenta";
      toast.error(msg);
      setIsLoading(false);
    } else {
      toast.success("¡Cuenta creada! Bienvenido.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const parsed = forgotPasswordSchema.safeParse({ email: resetEmail });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Email inválido");
      setIsLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast.error(error.message || "Error al enviar el correo");
    } else {
      toast.success("¡Correo enviado! Revisa tu bandeja de entrada.");
      setShowForgotPassword(false);
      setResetEmail("");
    }
    setIsLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    height: "44px",
    background: "#fff",
    border: "1.5px solid rgba(0,0,0,0.12)",
    borderRadius: "12px",
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    fontSize: "14.5px",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* Left panel */}
      <div style={{
        display: "none",
        width: "48%",
        background: `linear-gradient(135deg, ${ACCENT} 0%, #3954E0 100%)`,
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }} className="lg:flex">
        {/* Soft circles */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.08) 0%, transparent 35%)",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 20, padding: "36px 40px 0", ...fadeUp(0) }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(255,255,255,0.20)", color: "#fff",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20,
            }}>m</span>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "#fff",
            }}>myenglishbro</span>
          </Link>
        </div>

        {/* Center content */}
        <div style={{
          position: "relative", zIndex: 10, flex: 1,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "0 48px 48px",
        }}>
          {/* Big decorative quote */}
          <div style={{ ...fadeUp(80), textAlign: "center", maxWidth: 360 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, marginBottom: 32, marginLeft: "auto", marginRight: "auto",
            }}>🎓</div>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: "clamp(26px,2.8vw,34px)",
              lineHeight: 1.1, color: "#fff", margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}>
              Tu inglés al siguiente nivel
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
              Cursos A1–C2, clases en vivo con tu bro, exámenes Cambridge y una plataforma que aprende contigo.
            </p>
          </div>

          {/* Trust badges */}
          <div style={{
            ...fadeUp(160),
            display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap", justifyContent: "center",
          }}>
            {[
              { icon: "⭐", text: "4.9 rating" },
              { icon: "👥", text: "+500 students" },
              { icon: "🏆", text: "Cambridge focused" },
            ].map((b) => (
              <span key={b.text} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 999,
                background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.90)",
                fontSize: 13, fontWeight: 600,
              }}>
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, overflowY: "auto",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "#FBFAF7", padding: "32px 16px",
      }}>
        {/* Mobile logo */}
        <div style={{ marginBottom: 32, ...fadeUp(0) }} className="lg:hidden">
          <MebLogo size={32} />
        </div>

        <div style={{ width: "100%", maxWidth: 400, ...fadeUp(60) }}>
          {showForgotPassword ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 14, color: "#6E7178", background: "none", border: "none",
                  cursor: "pointer", fontFamily: "inherit", padding: 0,
                }}
              >
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </button>
              <div>
                <h1 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800, fontSize: 26, margin: "0 0 8px", color: "#1E2128",
                }}>
                  Recuperar contraseña
                </h1>
                <p style={{ fontSize: 14, color: "#6E7178", margin: 0 }}>
                  Te enviaremos un enlace a tu email para restablecer tu contraseña.
                </p>
              </div>
              <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    height: 44, borderRadius: 12, background: ACCENT, color: "#fff",
                    fontWeight: 700, fontSize: 14.5, border: "none", cursor: "pointer",
                    fontFamily: "inherit", boxShadow: "0 8px 20px rgba(76,111,255,0.28)",
                  }}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800, fontSize: "clamp(24px,4vw,30px)",
                  margin: "0 0 8px", color: "#1E2128", lineHeight: 1.1,
                }}>
                  {activeTab === "login" ? "¡Bienvenido de nuevo!" : "Crea tu cuenta"}
                </h1>
                <p style={{ fontSize: 14, color: "#6E7178", margin: 0 }}>
                  {activeTab === "login"
                    ? "Ingresa tus datos para continuar"
                    : "Únete a +500 estudiantes de myenglishbro"}
                </p>
              </div>

              {/* Tab selector */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 4, marginBottom: 24,
                background: "#fff", borderRadius: 14,
                padding: 4, border: "1.5px solid rgba(0,0,0,0.08)",
              }}>
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      height: 40, borderRadius: 11, border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontWeight: 700, fontSize: 13.5,
                      transition: "all 0.18s",
                      background: activeTab === tab ? ACCENT : "transparent",
                      color: activeTab === tab ? "#fff" : "#52565E",
                      boxShadow: activeTab === tab ? "0 4px 12px rgba(76,111,255,0.25)" : "none",
                    }}
                  >
                    {tab === "login" ? "Iniciar sesión" : "Registrarse"}
                  </button>
                ))}
              </div>

              {/* Login form */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Email</label>
                    <Input name="email" type="email" placeholder="tu@email.com" required autoComplete="email" style={inputStyle} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Contraseña</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        style={{ fontSize: 12.5, color: ACCENT, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        style={{ ...inputStyle, paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: "#9296A0",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      height: 44, borderRadius: 12, background: ACCENT, color: "#fff",
                      fontWeight: 700, fontSize: 14.5, border: "none", cursor: "pointer",
                      fontFamily: "inherit", boxShadow: "0 8px 20px rgba(76,111,255,0.28)",
                      marginTop: 4,
                    }}
                  >
                    {isLoading ? "Ingresando..." : "Iniciar sesión"}
                  </button>
                </form>
              )}

              {/* Register form */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Nombre completo</label>
                    <Input name="name" type="text" placeholder="Tu nombre" required style={inputStyle} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Email</label>
                    <Input name="email" type="email" placeholder="tu@email.com" required style={inputStyle} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Celular</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger style={{ ...inputStyle, width: 120, flexShrink: 0 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ maxHeight: 240 }}>
                          {COUNTRY_CODES.map((c, i) => (
                            <SelectItem key={`${c.code}-${i}`} value={c.code} style={{ fontSize: 13.5 }}>
                              {c.flag} {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input name="phone" type="tel" placeholder="987654321" required inputMode="numeric" style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#1E2128" }}>Contraseña</label>
                    <div style={{ position: "relative" }}>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        style={{ ...inputStyle, paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: "#9296A0",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      height: 44, borderRadius: 12, background: ACCENT, color: "#fff",
                      fontWeight: 700, fontSize: 14.5, border: "none", cursor: "pointer",
                      fontFamily: "inherit", boxShadow: "0 8px 20px rgba(76,111,255,0.28)",
                      marginTop: 4,
                    }}
                  >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
                  </button>

                  <p style={{ fontSize: 12, textAlign: "center", color: "#9296A0", margin: 0 }}>
                    Al registrarte aceptas nuestros{" "}
                    <a href="#" style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}>
                      términos y condiciones
                    </a>
                  </p>
                </form>
              )}

              {/* Footer trust */}
              <div style={{
                marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 12.5, color: "#9296A0",
              }}>
                <span>🎓</span>
                <span>Plataforma educativa verificada</span>
                <span style={{ color: "#F59E0B", fontWeight: 700 }}>⭐ 4.9</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
