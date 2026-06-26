import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userExists: boolean;
  login: (email: string, password: string) => Promise<{ error: any; user: import("@supabase/supabase-js").User | null }>;
  register: (email: string, password: string, fullName?: string, telefono?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userExists, setUserExists] = useState(true);

  // Check if user exists in usuarios table
  const checkUserExists = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
     // Si hay error de RLS o red, no cerrar sesión (asumir que existe)
     if (error) {
       console.warn("Error verificando usuario:", error.message);
       setUserExists(true);
       return true;
     }
     
     // Solo cerrar sesión si la consulta fue exitosa pero no hay datos
     if (!data) {
        setUserExists(false);
        await supabase.auth.signOut();
        toast.error("Tu cuenta ha sido desactivada. Contacta al administrador.");
        return false;
      }
     
      setUserExists(true);
      return true;
    } catch (err) {
      console.error("Error checking user exists:", err);
     setUserExists(true);
     return true;
    }
  };

  // Clear invalid session from localStorage
  const clearInvalidSession = () => {
    try {
      localStorage.removeItem('sb-zjobnxbzdtqsgbfdxzqo-auth-token');
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          clearInvalidSession();
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserExists(true);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user exists in usuarios table when session changes
        if (session?.user) {
          setTimeout(() => {
            checkUserExists(session.user.id);
          }, 0);
        } else {
          setUserExists(true);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // If there's an error getting session (invalid token), clear it
      if (error) {
        console.error("Session error:", error);
        clearInvalidSession();
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserExists(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error("Error getting session:", err);
      clearInvalidSession();
      setSession(null);
      setUser(null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error, user: data?.user ?? null };
  };

  const register = async (email: string, password: string, fullName?: string, telefono?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          telefono: telefono ?? null,
        },
      },
    });
    return { error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada");
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && userExists,
    isLoading,
    userExists,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
