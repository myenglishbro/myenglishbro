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
import { ArrowLeft, Eye, EyeOff, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validations";
import logoAce from "@/assets/logo-ace.png";

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

  const fadeUp = (ms = 0) => ({
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

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden">
      {/* ── Left panel — brand image ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden bg-[#054A91] shrink-0 flex-col">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(38,183,199,.26),transparent_30%),radial-gradient(circle_at_76%_28%,rgba(10,114,201,.55),transparent_34%),linear-gradient(135deg,#054A91_0%,#0A26F4_52%,#054A91_100%)]" />
        </div>

        {/* Logo top-left */}
        <div className="relative z-20 px-10 pt-9" style={fadeUp(0)}>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logoAce} alt="Acelingua" className="h-9 w-9" />
            <span className="text-lg font-black text-white tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Acelingua
            </span>
          </Link>
        </div>

        {/* Hero illustration + headline, centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 min-h-0 pb-10">
          <div style={fadeUp(80)}>
            <img
              src="/logologin.png"
              alt="Acelingua login"
              className="w-full max-w-[280px] xl:max-w-[320px] drop-shadow-2xl animate-float"
            />
          </div>
          <div className="mt-8 text-center max-w-sm" style={fadeUp(160)}>
            <h2 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Aprende inglés a tu ritmo
            </h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Clases en vivo, recursos descargables y un equipo que te acompaña en cada paso.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — forms ── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center bg-[#F8FAFC] px-4 sm:px-6 py-8 sm:py-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8" style={fadeUp(0)}>
          <img src={logoAce} alt="Acelingua" className="h-8 w-8" />
          <span className="text-lg font-black text-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Acelingua
          </span>
        </div>

        <div className="w-full max-w-sm sm:max-w-[400px]" style={fadeUp(60)}>
          {showForgotPassword ? (
            /* ── Forgot password ── */
            <div className="space-y-6">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </button>
              <div>
                <h1 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Recuperar contraseña
                </h1>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un enlace a tu email para restablecer tu contraseña.
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#054A91] hover:bg-[#054A91]/90 text-white rounded-xl font-semibold shadow-lg shadow-[#054A91]/20 transition-all hover:-translate-y-0.5"
                >
                  {isLoading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {activeTab === "login" ? "¡Bienvenido de nuevo!" : "Crea tu cuenta"}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {activeTab === "login"
                    ? "Ingresa tus datos para continuar"
                    : "Únete a +1,500 estudiantes de Acelingua"}
                </p>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "login" | "register")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-5 bg-white border border-border rounded-xl p-1 h-auto">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg text-sm font-semibold py-2.5 data-[state=active]:bg-[#054A91] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                  >
                    Iniciar sesión
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-lg text-sm font-semibold py-2.5 data-[state=active]:bg-[#054A91] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                  >
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                {/* ── Login ── */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        autoComplete="email"
                        className="h-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">
                          Contraseña
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-[#054A91] font-semibold hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="h-11 pr-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-[#054A91] hover:bg-[#054A91]/90 text-white rounded-xl font-semibold shadow-lg shadow-[#054A91]/20 transition-all hover:-translate-y-0.5 mt-1"
                    >
                      {isLoading ? "Ingresando..." : "Iniciar sesión"}
                    </Button>
                  </form>
                </TabsContent>

                {/* ── Register ── */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="register-name" className="text-sm font-semibold text-foreground">
                        Nombre completo
                      </Label>
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre"
                        required
                        className="h-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="register-email" className="text-sm font-semibold text-foreground">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        className="h-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground">Celular</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[120px] shrink-0 h-11 bg-white border-border text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {COUNTRY_CODES.map((c, i) => (
                              <SelectItem key={`${c.code}-${i}`} value={c.code} className="text-sm">
                                {c.flag} {c.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="987654321"
                          required
                          inputMode="numeric"
                          className="flex-1 h-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="register-password" className="text-sm font-semibold text-foreground">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          required
                          minLength={6}
                          className="h-11 pr-11 bg-white border-border focus-visible:ring-[#054A91]/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-[#054A91] hover:bg-[#054A91]/90 text-white rounded-xl font-semibold shadow-lg shadow-[#054A91]/20 transition-all hover:-translate-y-0.5 mt-1"
                    >
                      {isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground pt-1">
                      Al registrarte aceptas nuestros{" "}
                      <a href="#" className="text-[#054A91] font-semibold hover:underline">
                        términos y condiciones
                      </a>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Divider with trust badge */}
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-[#054A91]" />
                <span>Plataforma educativa verificada</span>
                <span className="text-[#F59E0B] font-bold">⭐ 4.9</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
