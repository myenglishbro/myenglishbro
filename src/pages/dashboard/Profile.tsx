import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, User, Mail, Link as LinkIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil actualizado correctamente");
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 font-display mb-2">Perfil</h1>
        <p className="text-slate-500">
          Administra tu información personal
        </p>
      </div>

      <div className="dashboard-card p-8 max-w-2xl animate-fade-in-up">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white font-bold text-3xl shadow-primary">
                {initials}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-2.5 rounded-xl bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Foto de perfil</h3>
              <p className="text-sm text-slate-500">
                JPG, PNG o GIF (máx. 2MB)
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Nombre completo
            </Label>
            <Input
              id="name"
              type="text"
              defaultValue={userName}
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl h-12 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="bg-slate-100 border-slate-200 text-slate-500 rounded-xl h-12"
            />
            <p className="text-xs text-slate-400">El email no se puede cambiar</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-700 font-medium">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Cuéntanos un poco sobre ti y tus objetivos con el inglés..."
              rows={4}
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl resize-none focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Links */}
          <div className="space-y-4">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-slate-400" />
              Enlaces (opcional)
            </Label>
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <Input
                  type="url"
                  placeholder="linkedin.com/in/tu-perfil"
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl h-12 pl-12 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="url"
                  placeholder="tu-sitio-web.com"
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl h-12 pl-12 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 shadow-primary"
          >
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;