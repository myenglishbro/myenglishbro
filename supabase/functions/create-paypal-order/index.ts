import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function getPayPalAccessToken(apiBase: string, clientId: string, clientSecret: string) {
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("No se pudo autenticar con PayPal");
  }

  const data = await response.json();
  return data.access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const paypalApiBase = Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Se requiere autenticación" }, 401);
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: "Token inválido" }, 401);
    }

    const { product_type, curso_id } = await req.json();
    if (product_type !== "curso" && product_type !== "suscripcion") {
      return jsonResponse({ error: "product_type debe ser 'curso' o 'suscripcion'" }, 400);
    }
    if (product_type === "curso" && !curso_id) {
      return jsonResponse({ error: "curso_id es requerido" }, 400);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    let amountUsd: number;
    let descripcion: string;

    if (product_type === "curso") {
      const { data: curso, error: cursoError } = await serviceClient
        .from("cursos")
        .select("id, titulo, precio_usd")
        .eq("id", curso_id)
        .eq("activo", true)
        .single();

      if (cursoError || !curso) {
        return jsonResponse({ error: "Curso no encontrado" }, 404);
      }
      if (!curso.precio_usd) {
        return jsonResponse({ error: "Este curso no tiene precio en USD configurado" }, 400);
      }

      amountUsd = Number(curso.precio_usd);
      descripcion = `Acceso de por vida: ${curso.titulo}`;
    } else {
      const { data: config, error: configError } = await serviceClient
        .from("suscripcion_config")
        .select("precio_usd")
        .single();

      if (configError || !config) {
        return jsonResponse({ error: "No se pudo obtener el precio de la suscripción" }, 500);
      }

      amountUsd = Number(config.precio_usd);
      descripcion = "Suscripción mensual - Acceso a todos los cursos";
    }

    // Asegurar que exista registro en la tabla usuarios
    const { data: usuarioRecord } = await serviceClient
      .from("usuarios")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!usuarioRecord) {
      await serviceClient.from("usuarios").insert({ id: user.id, email: user.email });
    }

    const origin = req.headers.get("origin") ?? "https://myenglishbro.dev";
    const accessToken = await getPayPalAccessToken(paypalApiBase, paypalClientId, paypalClientSecret);

    const orderResponse = await fetch(`${paypalApiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: descripcion,
            amount: {
              currency_code: "USD",
              value: amountUsd.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "MyEnglishBro",
          user_action: "PAY_NOW",
          return_url: `${origin}/payment/success`,
          cancel_url: `${origin}/payment/pending`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errText = await orderResponse.text();
      console.error("Error creando orden PayPal:", errText);
      return jsonResponse({ error: "Error al crear la orden en PayPal" }, 502);
    }

    const order = await orderResponse.json();
    const approveUrl = order.links?.find((l: { rel: string; href: string }) => l.rel === "approve")?.href;

    if (!approveUrl) {
      return jsonResponse({ error: "PayPal no devolvió un link de aprobación" }, 502);
    }

    const { error: pagoError } = await serviceClient.from("pagos").insert({
      usuario_id: user.id,
      curso_id: product_type === "curso" ? curso_id : null,
      paypal_order_id: order.id,
      monto: Math.round(amountUsd),
      moneda: "usd",
      estado: "pending",
    });

    if (pagoError) {
      console.error("Error registrando pago:", pagoError);
      return jsonResponse({ error: "Error al registrar el pago" }, 500);
    }

    return jsonResponse({ success: true, approveUrl }, 200);
  } catch (error: any) {
    console.error("Error:", error);
    return jsonResponse({ error: error.message || "Error desconocido" }, 500);
  }
});
