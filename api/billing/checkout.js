const prices = {
  monthly: () => process.env.PADDLE_PRICE_MONTHLY,
  quarterly: () => process.env.PADDLE_PRICE_QUARTERLY,
  semiannual: () => process.env.PADDLE_PRICE_SEMIANNUAL
};

function json(body, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "private, no-store" } });
}

async function authenticatedUser(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || "";
  if (!token || !url || !key) return null;
  const response = await fetch(url + "/auth/v1/user", {
    headers: { apikey: key, authorization: "Bearer " + token }
  });
  if (!response.ok) return null;
  return response.json();
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  const currentOrigin = new URL(request.url).origin;
  if (origin && origin !== currentOrigin) return json({ error: "forbidden_origin" }, 403);

  const user = await authenticatedUser(request);
  if (!user || !user.id) return json({ error: "unauthorized" }, 401);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 5000) return json({ error: "payload_too_large" }, 413);
    body = JSON.parse(raw || "{}");
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const price = prices[body.plan] && prices[body.plan]();
  const apiKey = process.env.PADDLE_API_KEY;
  if (!price || !apiKey) return json({ error: "billing_not_configured" }, 503);

  const paddleBase = process.env.PADDLE_ENV === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
  const appUrl = (process.env.APP_URL || currentOrigin).replace(/\/+$/, "");

  const response = await fetch(paddleBase + "/transactions", {
    method: "POST",
    headers: {
      authorization: "Bearer " + apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      items: [{ price_id: price, quantity: 1 }],
      custom_data: { user_id: user.id, plan: body.plan },
      checkout: { url: appUrl + "/?billing=return" }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: "paddle_error" }, 502);
  const url = payload && payload.data && payload.data.checkout && payload.data.checkout.url;
  if (!url) return json({ error: "checkout_unavailable" }, 502);
  return json({ url });
}
