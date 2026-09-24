function json(body, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function secureEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function validSignature(raw, header, secret) {
  let ts = "";
  const hashes = [];
  for (const part of header.split(";")) {
    const bits = part.split("=");
    if (bits[0] === "ts") ts = bits[1] || "";
    if (bits[0] === "h1" && bits[1]) hashes.push(bits[1]);
  }
  if (!ts || !hashes.length) return false;
  const seconds = Number(ts);
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) return false;
  const expected = await hmacHex(secret, ts + ":" + raw);
  return hashes.some((hash) => secureEqual(expected, hash));
}

function supabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    secret: process.env.SUPABASE_SECRET_KEY || ""
  };
}

async function adminFetch(path, init = {}) {
  const cfg = supabaseConfig();
  if (!cfg.url || !cfg.secret) throw new Error("supabase_not_configured");
  const headers = new Headers(init.headers || {});
  headers.set("apikey", cfg.secret);
  if (init.body) headers.set("content-type", "application/json");
  return fetch(cfg.url + "/rest/v1/" + path, { ...init, headers });
}

async function alreadyProcessed(eventId) {
  const response = await adminFetch(
    "billing_webhook_events?event_id=eq." + encodeURIComponent(eventId) + "&select=event_id&limit=1"
  );
  if (!response.ok) throw new Error("event_lookup_failed");
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function patchProfile(userId, patch) {
  const response = await adminFetch("profiles?id=eq." + encodeURIComponent(userId), {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch)
  });
  if (!response.ok) throw new Error("profile_update_failed");
}

async function rememberEvent(eventId, eventType) {
  const response = await adminFetch("billing_webhook_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ event_id: eventId, event_type: eventType })
  });
  if (!response.ok && response.status !== 409) throw new Error("event_insert_failed");
}

export async function POST(request) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) return json({ error: "not_configured" }, 503);

  const raw = await request.text();
  const signature = request.headers.get("paddle-signature") || "";
  if (!(await validSignature(raw, signature, webhookSecret))) {
    return json({ error: "invalid_signature" }, 401);
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_event" }, 400);
  }

  const eventId = String(event.event_id || "");
  const eventType = String(event.event_type || "unknown");
  if (!eventId) return json({ error: "invalid_event" }, 400);

  try {
    if (await alreadyProcessed(eventId)) return json({ ok: true, duplicate: true });

    const d = event.data || {};
    const userId = d.custom_data && d.custom_data.user_id;
    const subscriptionId =
      (typeof d.id === "string" && d.id.startsWith("sub_") ? d.id : null) ||
      d.subscription_id ||
      null;
    const firstItem = d.items && d.items[0];
    const priceId =
      (firstItem && firstItem.price && firstItem.price.id) ||
      (firstItem && firstItem.price_id) ||
      null;

    if (userId && ["subscription.created","subscription.activated","subscription.updated","transaction.completed"].includes(eventType)) {
      const patch = {
        billing_provider: "paddle",
        paddle_customer_id: d.customer_id || null,
        paddle_subscription_id: subscriptionId,
        paddle_price_id: priceId,
        subscription_status: d.status || "active",
        access_status: "active",
        activated_at: new Date().toISOString(),
        access_until: d.current_billing_period && d.current_billing_period.ends_at
          ? d.current_billing_period.ends_at
          : null
      };
      if (d.custom_data && d.custom_data.plan) patch.subscription_period = d.custom_data.plan;
      await patchProfile(String(userId), patch);
    }

    if (userId && ["subscription.canceled","subscription.paused"].includes(eventType)) {
      await patchProfile(String(userId), {
        billing_provider: "paddle",
        paddle_subscription_id: subscriptionId,
        subscription_status: d.status || "canceled",
        access_until:
          (d.current_billing_period && d.current_billing_period.ends_at) ||
          d.canceled_at ||
          new Date().toISOString()
      });
    }

    await rememberEvent(eventId, eventType);
    return json({ ok: true });
  } catch (error) {
    console.error("Paddle webhook processing failed", error);
    return json({ error: "webhook_processing_failed" }, 500);
  }
}
