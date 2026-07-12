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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paypalApiBase = Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET")!;

    const payload = await req.json();
    const orderId: string | undefined =
      payload?.resource?.supplementary_data?.related_ids?.order_id ?? payload?.resource?.id;

    if (!orderId) {
      return jsonResponse({ error: "No se encontró el ID de la orden" }, 400);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const accessToken = await getPayPalAccessToken(paypalApiBase, paypalClientId, paypalClientSecret);

    // Nunca confiar en el payload entrante: siempre re-consultamos el estado real a PayPal.
    const orderRes = await fetch(`${paypalApiBase}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!orderRes.ok) {
      return jsonResponse({ error: "No se pudo verificar la orden con PayPal" }, 502);
    }

    let order = await orderRes.json();

    if (order.status === "APPROVED") {
      const captureRes = await fetch(`${paypalApiBase}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!captureRes.ok) {
        const errText = await captureRes.text();
        console.error("Error capturando orden PayPal:", errText);
        return jsonResponse({ error: "Error al capturar el pago" }, 502);
      }

      order = await captureRes.json();
    }

    if (order.status !== "COMPLETED") {
      return jsonResponse({ success: false, status: order.status }, 200);
    }

    const captureId: string | undefined =
      order.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    const { data: pago, error: pagoLookupError } = await serviceClient
      .from("pagos")
      .select("id, usuario_id, curso_id, estado")
      .eq("paypal_order_id", orderId)
      .maybeSingle();

    if (pagoLookupError || !pago) {
      console.error("No se encontró el pago para la orden", orderId, pagoLookupError);
      return jsonResponse({ error: "Pago no encontrado" }, 404);
    }

    if (pago.estado === "completed") {
      return jsonResponse({ success: true, alreadyProcessed: true }, 200);
    }

    const { error: updatePagoError } = await serviceClient
      .from("pagos")
      .update({
        estado: "completed",
        paypal_capture_id: captureId,
        raw_payload: order,
      })
      .eq("id", pago.id);

    if (updatePagoError) {
      console.error("Error actualizando pago:", updatePagoError);
      return jsonResponse({ error: "Error al actualizar el pago" }, 500);
    }

    if (pago.curso_id) {
      const { data: existingMatricula, error: existingLookupError } = await serviceClient
        .from("matriculas")
        .select("id")
        .eq("usuario_id", pago.usuario_id)
        .eq("curso_id", pago.curso_id)
        .maybeSingle();

      if (existingLookupError) {
        console.error("Error buscando matricula existente:", existingLookupError);
        return jsonResponse({ error: "Error al activar el curso" }, 500);
      }

      const matriculaData = {
        usuario_id: pago.usuario_id,
        curso_id: pago.curso_id,
        pago_id: pago.id,
        estado: "activa",
        tipo_pago: "unico",
        metodo_pago: "paypal",
        fecha_inicio: new Date().toISOString(),
        fecha_fin: null,
      };

      const { error: matriculaError } = existingMatricula
        ? await serviceClient.from("matriculas").update(matriculaData).eq("id", existingMatricula.id)
        : await serviceClient.from("matriculas").insert(matriculaData);

      if (matriculaError) {
        console.error("Error creando/actualizando matricula:", matriculaError);
        return jsonResponse({ error: "Error al activar el curso" }, 500);
      }
    } else {
      const { data: existingSub } = await serviceClient
        .from("suscripciones")
        .select("id, fecha_fin")
        .eq("usuario_id", pago.usuario_id)
        .eq("estado", "activa")
        .gt("fecha_fin", new Date().toISOString())
        .maybeSingle();

      if (existingSub) {
        const nuevaFechaFin = new Date(
          new Date(existingSub.fecha_fin).getTime() + THIRTY_DAYS_MS
        ).toISOString();

        const { error: extendError } = await serviceClient
          .from("suscripciones")
          .update({ fecha_fin: nuevaFechaFin, pago_id: pago.id, metodo_pago: "paypal" })
          .eq("id", existingSub.id);

        if (extendError) {
          console.error("Error extendiendo suscripcion:", extendError);
          return jsonResponse({ error: "Error al renovar la suscripción" }, 500);
        }
      } else {
        const now = new Date();
        const { error: subError } = await serviceClient.from("suscripciones").insert({
          usuario_id: pago.usuario_id,
          pago_id: pago.id,
          estado: "activa",
          metodo_pago: "paypal",
          fecha_inicio: now.toISOString(),
          fecha_fin: new Date(now.getTime() + THIRTY_DAYS_MS).toISOString(),
        });

        if (subError) {
          console.error("Error creando suscripcion:", subError);
          return jsonResponse({ error: "Error al activar la suscripción" }, 500);
        }
      }
    }

    return jsonResponse({ success: true }, 200);
  } catch (error: any) {
    console.error("Error:", error);
    return jsonResponse({ error: error.message || "Error desconocido" }, 500);
  }
});
