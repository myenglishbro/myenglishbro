# 📒 Autenticación y Registro – Flujo + Componentes + Rutas (sin gallery)

Este archivo define **todo el flujo de autenticación y registro** de usuarios para la plataforma, incluyendo:

- Flujo funcional (qué pasa en cada paso).
- Componentes de React (skeleton, sin backend real).
- Rutas de la app (públicas y protegidas) para acceder al **dashboard** y sus secciones:  
  **Dashboard, Cursos, Recursos, Community, Perfil, Reseñas, Soporte, Settings.**

Tecnologías pensadas: **Vite + React + TypeScript + React Router + shadcn/ui + Tailwind CSS**, preparada para conectarse a **Lovable Cloud** como backend y almacenamiento en el futuro.

---

## 0. Objetivos

Permitir a los usuarios:

1. **Registrarse** con email y contraseña.
2. **Iniciar sesión** de manera fluida y razonablemente segura (a nivel de frontend).
3. **Mantener la sesión activa** al recargar la app (simulada en frontend, luego delegada a backend).
4. **Acceder a su dashboard privado** tras iniciar sesión, incluyendo:
   - `/dashboard` (bienvenida, CTA para continuar curso).
   - `/dashboard/courses` (lista de cursos B2/C1/C2).
   - `/dashboard/resources` (recursos: Grammar, Speaking, Writing, Vocabulary, Exams, etc.).
   - `/dashboard/community` (listado de alumnos/miembros).
   - `/dashboard/profile` (datos del alumno).
   - `/dashboard/reviews` (reseñas del curso).
   - `/dashboard/support` (soporte).
   - `/dashboard/settings` (placeholder).

---

## 1. Arquitectura General

### 1.1. Rutas principales de autenticación

**Rutas públicas:**

- `/`  
  - Landing page de marketing y venta.
- `/auth`  
  - Vista combinada de **login** y **registro** usando tabs.
- `/login`  
  - Alias opcional → redirige a `/auth?tab=login`.
- `/register`  
  - Alias opcional → redirige a `/auth?tab=register`.

**Rutas privadas (protegidas, requieren sesión):**

- `/dashboard` → Dashboard principal del usuario (bienvenida + CTA continuar curso).
- `/dashboard/courses` → Cursos comprados (B2, C1, C2).
- `/dashboard/resources` → Recursos (Grammar, Speaking, Writing, Vocabulary, Exams…).
- `/dashboard/community` → Comunidad de alumnos.
- `/dashboard/profile` → Perfil del alumno.
- `/dashboard/reviews` → Reseñas del curso.
- `/dashboard/support` → Soporte.
- `/dashboard/settings` → Settings (placeholder “próximamente”).

**Ruta pública adicional (opcional):**

- `/logout` → dispara flujo de logout y redirige a `/` o `/auth`.

---

### 1.2. Componentes clave (resumen)

**Contexto y providers**

- `AuthProvider`  
  - Maneja el estado global de autenticación y usuario.
- `useAuth` (hook)  
  - Expone `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`.

**Protección de rutas**

- `ProtectedRoute`  
  - Envuelve rutas privadas y redirige a `/auth?tab=login` si el usuario no está autenticado.

**Layout de autenticación**

- `AuthLayout`  
  - Layout para `/auth` con contenedor centrado.
- `AuthTabs`  
  - Tabs “Iniciar sesión” / “Crear cuenta”.

**Formularios**

- `LoginForm`
- `RegisterForm`

**Dashboard y secciones internas**

- `DashboardLayout`  
  - Layout con sidebar + contenido principal.
- `DashboardHome` → `/dashboard`
- `DashboardCourses` → `/dashboard/courses`
- `DashboardResources` → `/dashboard/resources`
- `DashboardCommunity` → `/dashboard/community`
- `DashboardProfile` → `/dashboard/profile`
- `DashboardReviews` → `/dashboard/reviews`
- `DashboardSupport` → `/dashboard/support`
- `DashboardSettings` → `/dashboard/settings`

---

## 2. Rutas en Detalle

### 2.1. Tabla de rutas

| Ruta                    | Tipo       | Componente principal       | Descripción breve                                             |
|-------------------------|-----------|----------------------------|---------------------------------------------------------------|
| `/`                     | Pública   | `LandingPage`              | Landing de marketing.                                         |
| `/auth`                 | Pública   | `AuthPage`                 | Tabs de login/register.                                      |
| `/login`                | Pública   | `Navigate → /auth?tab=login`    | Alias de login.                                           |
| `/register`             | Pública   | `Navigate → /auth?tab=register` | Alias de registro.                                       |
| `/dashboard`            | Protegida | `DashboardHome`            | Dashboard principal (bienvenida + CTA continuar curso).      |
| `/dashboard/courses`    | Protegida | `DashboardCourses`         | Lista de cursos B2/C1/C2 del alumno.                         |
| `/dashboard/resources`  | Protegida | `DashboardResources`       | Recursos: Grammar, Speaking, Writing, Vocabulary, Exams.     |
| `/dashboard/community`  | Protegida | `DashboardCommunity`       | Comunidad de alumnos/miembros.                               |
| `/dashboard/profile`    | Protegida | `DashboardProfile`         | Perfil del alumno (foto, nombre, bio, enlaces).              |
| `/dashboard/reviews`    | Protegida | `DashboardReviews`         | Formulario y listado de reseñas.                             |
| `/dashboard/support`    | Protegida | `DashboardSupport`         | Soporte, email de contacto.                                  |
| `/dashboard/settings`   | Protegida | `DashboardSettings`        | Placeholder: “Próximamente”.                                 |
| `/logout` (opcional)    | Pública   | `LogoutPage`               | Ejecuta logout y redirige a landing o `/auth`.               |

---

### 2.2. Definición conceptual de rutas (pseudo-código)

> Nota: esto es **estructura conceptual**, no implementación final.

```tsx
// App.tsx o AppRoutes.tsx (ejemplo conceptual)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";

import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { DashboardHome } from "./dashboard/DashboardHome";
import { DashboardCourses } from "./dashboard/DashboardCourses";
import { DashboardResources } from "./dashboard/DashboardResources";
import { DashboardCommunity } from "./dashboard/DashboardCommunity";
import { DashboardProfile } from "./dashboard/DashboardProfile";
import { DashboardReviews } from "./dashboard/DashboardReviews";
import { DashboardSupport } from "./dashboard/DashboardSupport";
import { DashboardSettings } from "./dashboard/DashboardSettings";
import { LogoutPage } from "./pages/LogoutPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />

          {/* Bloque de rutas protegidas bajo DashboardLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="courses" element={<DashboardCourses />} />
            <Route path="resources" element={<DashboardResources />} />
            <Route path="community" element={<DashboardCommunity />} />
            <Route path="profile" element={<DashboardProfile />} />
            <Route path="reviews" element={<DashboardReviews />} />
            <Route path="support" element={<DashboardSupport />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          {/* Logout opcional */}
          <Route path="/logout" element={<LogoutPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
3. Componentes en Detalle
3.1. AuthProvider y useAuth
Objetivo: Mantener el estado de usuario y sesión; simular persistencia en el frontend para este MVP. Luego se reemplaza por llamadas reales a Lovable Cloud.

Responsabilidades:

Estado:

user (objeto usuario o null).

isAuthenticated (boolean).

isLoading (boolean; mientras se verifica sesión al inicio).

Métodos:

login(email, password) → simula login (más adelante llamará a API).

register(email, password) → simula registro.

logout() → limpia sesión.

Modelo conceptual de usuario:

ts
Copiar código
type User = {
  id: string;
  email: string;
  name?: string;
};
Persistencia (solo demo):

Leer/escribir usuario en localStorage (ej. localStorage.setItem("rea_user", JSON.stringify(user))).

En el futuro, reemplazar por:

GET /auth/me

Tokens/cookies manejados por backend.

3.2. ProtectedRoute
Objetivo: Impedir acceso a rutas privadas si el usuario no está autenticado.

Responsabilidades:

Leer isAuthenticated e isLoading desde useAuth.

Si isLoading === true:

Mostrar loader / pantalla de carga.

Si isAuthenticated === false:

Redirigir a /auth?tab=login.

Si isAuthenticated === true:

Renderizar children o la ruta hija.

3.3. AuthPage (/auth)
Objetivo: Pantalla central de autenticación, con login y registro.

Componentes internos:

AuthLayout

Fondo suave, card centrada.

Logo / nombre de la academia.

Subtítulo: “Tu inglés real empieza aquí”.

AuthTabs

Usa Tabs de shadcn/ui:

Tab login → <LoginForm />.

Tab register → <RegisterForm />.

Detalles UX:

Leer el query param ?tab=login o ?tab=register para seleccionar tab inicial.

Mostrar enlaces cruzados:

En login: “¿No tienes cuenta? Regístrate”.

En registro: “¿Ya tienes cuenta? Inicia sesión”.

3.4. LoginForm
Objetivo: Permitir que el usuario inicie sesión con email y contraseña.

Campos:

email: Input controlado.

password: Input tipo password.

Botón Iniciar sesión.

Validaciones básicas:

Email con formato correcto.

Password no vacío.

Flujo:

Usuario rellena email y contraseña.

Presiona “Iniciar sesión”.

Form llama a auth.login(email, password).

Si éxito:

AuthProvider marca isAuthenticated = true y setea user.

Navegación a /dashboard.

Si error:

Mostrar mensaje: “Email o contraseña incorrectos” (dummy por ahora).

3.5. RegisterForm
Objetivo: Permitir que el usuario cree una cuenta con email y contraseña.

Campos:

email.

password.

confirmPassword.

(Opcional) checkbox de términos y condiciones.

Validaciones:

Email formato válido.

Password longitud mínima (ej. 8 caracteres).

password === confirmPassword.

Flujo:

Usuario completa el formulario.

Presiona “Crear cuenta”.

Form llama a auth.register(email, password).

Si éxito:

Se crea un user dummy.

isAuthenticated = true.

Redirigir a /dashboard.

Si error (ej. email ya en uso en futuro backend):

Mostrar mensaje apropiado.

3.6. DashboardLayout
Objetivo: Layout base para todas las secciones /dashboard/*.

Elementos:

Sidebar izquierda:

Logo / nombre “Myenglishbro  Academy”.

Navegación con links a:

“Dashboard” → /dashboard

“Cursos” → /dashboard/courses

“Recursos” → /dashboard/resources

“Community” → /dashboard/community

“Perfil” → /dashboard/profile

“Reseñas” → /dashboard/reviews

“Soporte” → /dashboard/support

“Settings” → /dashboard/settings

Link o botón “Cerrar sesión” → llama logout() y redirige.

Contenido principal:

Outlet de React Router para renderizar la vista hija:

Home, Courses, Resources, etc.

3.7. DashboardHome (/dashboard)
Objetivo: Primera pantalla tras login/registro.

Contenido sugerido:

Título: “Bienvenido/a, [email]”.

Subtítulo: “Tu camino hacia el inglés avanzado empieza aquí.”

CTA principal: “Continuar mi curso” (placeholder, puede llevar a /courses/:id o /dashboard/courses).

Sección con:

Próxima lección (dummy).

Progreso general (barra de progreso dummy).

3.8. DashboardCourses (/dashboard/courses)
Objetivo: Mostrar los cursos disponibles/comprados (B2, C1, C2).

Contenido:

Título: “Mis cursos”.

Grid o lista de tarjetas:

Curso B2

Curso C1

Curso C2

Cada tarjeta:

Nivel (badge).

Número de lecciones (dummy).

Estado (no iniciado / en progreso / completado, dummy).

Botón “Ver curso” → nav a /courses/:courseId (otra parte de la app).

3.9. DashboardResources (/dashboard/resources)
Objetivo: Acceso rápido a recursos organizados por categoría.

Contenido:

Título: “Recursos”.

Grid de tarjetas de categoría:

Grammar

Speaking

Writing

Vocabulary

Exams

Cada tarjeta:

Icono.

Breve descripción dummy.

Botón o click completo → /resources/:categoryId (página de recursos detalle).

3.10. DashboardCommunity (/dashboard/community)
Objetivo: Vista de comunidad de alumnos.

Contenido:

Título: “Community”.

Lista o grid de tarjetas de alumno:

Avatar.

Nombre.

Bio corta.

Enlaces (ej. LinkedIn, web – dummy).

Pensado para futura integración con Discord u otra comunidad externa.

3.11. DashboardProfile (/dashboard/profile)
Objetivo: Permitir que el usuario edite su perfil.

Contenido:

Foto/avatar (upload dummy).

Nombre.

Bio corta.

Enlaces opcionales (redes sociales, portafolio).

Botón “Guardar cambios” (sin lógica real todavía; solo UI).

3.12. DashboardReviews (/dashboard/reviews)
Objetivo: Formulario para dejar reseñas del curso.

Contenido:

Selector de curso: B2 / C1 / C2.

Campo de texto para comentario.

Rating (estrellas dummy).

Botón “Enviar reseña”.

Debajo, lista de reseñas dummy (contenido simulado).

3.13. DashboardSupport (/dashboard/support)
Objetivo: Página simple de soporte.

Contenido:

Tarjeta con:

Texto: “¿Necesitas ayuda? Escríbenos.”

Email de contacto en texto (“soporte@…”, dummy).

Botón “Escribir email” (mailto: opcional).

3.14. DashboardSettings (/dashboard/settings)
Objetivo: Placeholder para configuraciones futuras.

Contenido:

Título: “Configuración de cuenta”.

Texto grande: “Próximamente”.

Lista de posibles ajustes futuros (dummy): idioma, notificaciones, etc.

3.15. LogoutPage (/logout) – opcional
Objetivo: Ejecutar logout de manera declarativa.

Flujo:

Al montarse el componente:

Llamar auth.logout().

Mostrar mensaje: “Cerrando sesión…”.

Redirigir a / o /auth tras un pequeño delay (o directamente sin delay).

4. Flujos Funcionales
4.1. Flujo de Registro (Sign Up)
Usuario llega a /auth?tab=register (o /register).

Ve AuthPage con RegisterForm activo.

Completa email, password, confirmación.

Pulsa “Crear cuenta”.

RegisterForm:

Valida campos.

Llama auth.register(email, password).

AuthProvider:

Crea un user dummy (más adelante llamará a API real).

isAuthenticated = true.

Persiste usuario en localStorage (o mecanismo temporal).

Navegación:

Redirigir a /dashboard.

DashboardHome muestra bienvenida y CTA para continuar curso.

4.2. Flujo de Inicio de Sesión (Login)
Usuario llega a /auth?tab=login (o /login).

Completa email y password en LoginForm.

Pulsa “Iniciar sesión”.

LoginForm:

Valida campos.

Llama auth.login(email, password).

AuthProvider:

Simula verificación; si ok, setea user y isAuthenticated = true.

Navegación:

Redirigir a /dashboard.

Usuario puede navegar a:

/dashboard/courses

/dashboard/resources

/dashboard/community

/dashboard/profile

/dashboard/reviews

/dashboard/support

/dashboard/settings

4.3. Flujo de Persistencia de Sesión al Recargar
App se monta, incluyendo AuthProvider.

AuthProvider:

Lee localStorage (o fuente de sesión) para ver si hay usuario guardado.

Mientras revisa: isLoading = true.

Si hay usuario válido:

Setea user y isAuthenticated = true.

Si no:

user = null y isAuthenticated = false.

Al terminar: isLoading = false.

ProtectedRoute:

Si isLoading → muestra loader.

Si !isAuthenticated → redirige a /auth?tab=login.

Si isAuthenticated → permite acceso a rutas /dashboard/*.

4.4. Flujo de Acceso a Rutas Protegidas
Escenario A – usuario autenticado:

Navega a /dashboard/resources.

ProtectedRoute:

isAuthenticated = true → renderiza DashboardLayout.

Dentro, Outlet muestra DashboardResources.

Escenario B – usuario no autenticado:

Intenta ir directo a /dashboard o /dashboard/profile.

ProtectedRoute:

isAuthenticated = false → redirige a /auth?tab=login.

4.5. Flujo de Logout
Usuario hace clic en “Cerrar sesión” en el sidebar (DashboardLayout).

Se ejecuta auth.logout():

Limpia user en contexto.

Limpia persistencia local (ej. localStorage.removeItem("rea_user")).

isAuthenticated = false.

Navegación:

Redirigir a / o /auth?tab=login.

A partir de ese punto:

Cualquier acceso a /dashboard/* redirigirá de nuevo a /auth?tab=login.

5. Resumen
Este archivo .md define:

✅ Flujo completo de autenticación (registro, login, persistencia, logout).

✅ Componentes necesarios:

AuthProvider, useAuth, ProtectedRoute, AuthPage, LoginForm, RegisterForm.

DashboardLayout y todas las vistas internas de /dashboard/*.

✅ Rutas públicas y privadas, alineadas con tu producto real:

Sin “gallery”.

Con Dashboard, Courses, Resources, Community, Profile, Reviews, Support, Settings.

✅ Todo preparado como skeleton sin backend, listo para conectar más adelante con Lovable Cloud sin tener que cambiar la estructura.


