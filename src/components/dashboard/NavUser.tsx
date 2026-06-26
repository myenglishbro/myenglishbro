import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";
import { Calendar, Infinity as InfinityIcon, Sparkles, Gift } from "lucide-react";

export const NavUser = () => {
  const { user } = useAuth();

  // Fetch earliest expiration date from active enrollments
  const { data: subscriptionInfo } = useQuery({
    queryKey: ["subscription-info", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("matriculas")
        .select("fecha_fin, tipo_pago")
        .eq("usuario_id", user.id)
        .eq("estado", "activa");

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Check if any enrollment is lifetime
      const hasLifetime = data.some(m => m.tipo_pago === "unico" || !m.fecha_fin);
      if (hasLifetime) {
        return { type: "lifetime" as const, days: null };
      }

      // Check if all enrollments are trials
      const hasOnlyTrials = data.every(m => m.tipo_pago === "prueba");
      const hasSomeTrial = data.some(m => m.tipo_pago === "prueba");

      // Find the earliest expiration
      const today = new Date();
      let minDays = Number.POSITIVE_INFINITY;
      
      for (const enrollment of data) {
        if (enrollment.fecha_fin) {
          const fechaFin = parseISO(enrollment.fecha_fin);
          const days = differenceInDays(fechaFin, today);
          if (days < minDays) minDays = days;
        }
      }

      // Determine type based on enrollments
      const isTrial = hasOnlyTrials || (hasSomeTrial && minDays !== Number.POSITIVE_INFINITY);
      
      return { 
        type: isTrial ? "trial" as const : "monthly" as const, 
        days: minDays === Number.POSITIVE_INFINITY ? null : Math.max(0, minDays)
      };
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.user_metadata?.nombre || user.email?.split("@")[0] || "Usuario";
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/80">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 ring-2 ring-white shadow-soft">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-400 text-white font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
      </div>

      {/* Subscription Badge */}
      {subscriptionInfo && (
        <div className="mt-3">
          {subscriptionInfo.type === "lifetime" ? (
            <Badge className="w-full justify-center gap-1.5 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs py-1.5">
              <InfinityIcon className="h-3.5 w-3.5" />
              Acceso Lifetime
            </Badge>
          ) : subscriptionInfo.type === "trial" && subscriptionInfo.days !== null ? (
            <Badge 
              className={`w-full justify-center gap-1.5 text-xs py-1.5 ${
                subscriptionInfo.days <= 3 
                  ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" 
                  : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Gift className="h-3.5 w-3.5" />
              Prueba: {subscriptionInfo.days} días
            </Badge>
          ) : subscriptionInfo.days !== null ? (
            <Badge 
              className={`w-full justify-center gap-1.5 text-xs py-1.5 ${
                subscriptionInfo.days <= 7 
                  ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" 
                  : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              {subscriptionInfo.days} días restantes
            </Badge>
          ) : (
            <Badge className="w-full justify-center gap-1.5 bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 text-xs py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Sin suscripción activa
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};