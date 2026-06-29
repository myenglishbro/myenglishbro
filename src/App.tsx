import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { SuperAdminRoute } from "./components/auth/SuperAdminRoute";
import { TeacherRoute } from "./components/auth/TeacherRoute";
import Landing from "./pages/Landing";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import LiveClasses from "./pages/LiveClasses";
import Store from "./pages/Store";
import Auth from "./pages/Auth";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { AdminLayout } from "./components/dashboard/AdminLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Courses from "./pages/dashboard/Courses";
import Community from "./pages/dashboard/Community";
import Profile from "./pages/dashboard/Profile";
import Support from "./pages/dashboard/Support";
import Settings from "./pages/dashboard/Settings";
import CourseDetail from "./pages/CourseDetail";
import AdminCursos from "./pages/admin/AdminCursos";
import AdminLecciones from "./pages/admin/AdminLecciones";
import AdminRecursos from "./pages/admin/AdminRecursos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminProgramas from "./pages/admin/AdminProgramas";
import AdminSalones from "./pages/admin/AdminSalones";
import AdminAnuncios from "./pages/admin/AdminAnuncios";
import AdminWordSurvivor from "./pages/admin/AdminWordSurvivor";
import AdminWordSurvivorTienda from "./pages/admin/AdminWordSurvivorTienda";
import AdminWordSurvivorRecargas from "./pages/admin/AdminWordSurvivorRecargas";
import { TeacherLayout } from "./components/dashboard/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSalon from "./pages/teacher/TeacherSalon";
import TeacherEstudiantes from "./pages/teacher/TeacherEstudiantes";
import TeacherActividades from "./pages/teacher/TeacherActividades";
import TeacherCalificaciones from "./pages/teacher/TeacherCalificaciones";
import SalonActividades from "./pages/salon/SalonActividades";
import SalonDetail from "./pages/SalonDetail";
import CoursePublicDetail from "./pages/CoursePublicDetail";
import Resources from "./pages/Resources";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import AdminLessonsBlog from "./pages/admin/AdminLessonsBlog";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/payment/Success";
import PaymentFailure from "./pages/payment/Failure";
import PaymentPending from "./pages/payment/Pending";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/store" element={<Store />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:slug" element={<ProgramDetail />} />
            <Route path="/live-classes" element={<LiveClasses />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:slug" element={<LessonDetail />} />
            <Route path="/courses-catalog" element={<Store />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
            <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />
            <Route path="/curso/:slug" element={<CoursePublicDetail />} />
            
            {/* Payment result routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentPending />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="community" element={<Community />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Protected course detail page */}
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/cursos" replace />} />
              <Route path="usuarios" element={<SuperAdminRoute><AdminUsuarios /></SuperAdminRoute>} />
              <Route path="cursos" element={<AdminCursos />} />
              <Route path="cursos/:cursoId/lecciones" element={<AdminLecciones />} />
              <Route path="cursos/:cursoId/recursos" element={<AdminRecursos />} />
              <Route path="salones" element={<AdminSalones />} />
              <Route path="programas" element={<AdminProgramas />} />
              <Route path="anuncios" element={<AdminAnuncios />} />
              <Route path="word-survivor" element={<AdminWordSurvivor />} />
              <Route path="word-survivor-tienda" element={<AdminWordSurvivorTienda />} />
              <Route path="word-survivor-recargas" element={<AdminWordSurvivorRecargas />} />
              <Route path="lessons" element={<AdminLessonsBlog />} />
            </Route>

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <TeacherRoute>
                  <TeacherLayout />
                </TeacherRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="salon/:salonId" element={<TeacherSalon />} />
              <Route path="estudiantes/:salonId" element={<TeacherEstudiantes />} />
              <Route path="actividades/:salonId" element={<TeacherActividades />} />
              <Route path="calificaciones/:salonId" element={<TeacherCalificaciones />} />
            </Route>

            {/* Salon detail for students */}
            <Route
              path="/salon/:salonId"
              element={
                <ProtectedRoute>
                  <SalonDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salon/:salonId/actividades"
              element={
                <ProtectedRoute>
                  <SalonActividades />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
