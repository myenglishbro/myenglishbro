import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Se requiere autenticación" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { curso_id } = await req.json();
    if (!curso_id) {
      return new Response(JSON.stringify({ error: "curso_id es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar que el curso existe y está activo
    const { data: curso, error: cursoError } = await serviceClient
      .from("cursos")
      .select("id, titulo")
      .eq("id", curso_id)
      .eq("activo", true)
      .single();

    if (cursoError || !curso) {
      return new Response(JSON.stringify({ error: "Curso no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar si ya tiene matrícula en este curso
    const { data: existing } = await serviceClient
      .from("matriculas")
      .select("id, tipo_pago, estado, fecha_fin")
      .eq("usuario_id", user.id)
      .eq("curso_id", curso_id)
      .maybeSingle();

    if (existing) {
      const now = new Date();
      if (existing.tipo_pago !== "prueba") {
        return new Response(
          JSON.stringify({ error: "Ya tienes una matrícula en este curso" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (existing.fecha_fin && new Date(existing.fecha_fin) > now) {
        return new Response(
          JSON.stringify({ error: "Ya tienes una prueba gratuita activa para este curso" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Tu prueba gratuita ya finalizó. Contáctanos por WhatsApp para activar tu acceso completo." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Asegurar que exista registro en la tabla usuarios
    const { data: usuarioRecord } = await serviceClient
      .from("usuarios")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!usuarioRecord) {
      await serviceClient
        .from("usuarios")
        .insert({ id: user.id, email: user.email });
    }

    // Crear matrícula de prueba - 24 horas
    const now = new Date();
    const fechaFin = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: matricula, error: matriculaError } = await serviceClient
      .from("matriculas")
      .insert({
        usuario_id: user.id,
        curso_id: curso_id,
        estado: "activa",
        tipo_pago: "prueba",
        metodo_pago: "prueba_gratuita",
        fecha_inicio: now.toISOString(),
        fecha_fin: fechaFin.toISOString(),
      })
      .select()
      .single();

    if (matriculaError) {
      console.error("Error creating matricula:", matriculaError);
      return new Response(
        JSON.stringify({ error: "Error al crear la matrícula de prueba" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, matricula }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
