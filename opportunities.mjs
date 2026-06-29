import { getStore } from "@netlify/blobs";

const KEY = "list";

export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (req.method === "OPTIONS") {
    return new Response("", { headers: cors });
  }

  let store;
  try {
    store = getStore("rushd-opportunities");
  } catch (e) {
    return new Response(JSON.stringify({ error: "store_unavailable" }), { status: 500, headers: cors });
  }

  let list = [];
  try {
    list = (await store.get(KEY, { type: "json" })) || [];
  } catch (e) {
    list = [];
  }

  try {
    if (req.method === "GET") {
      return new Response(JSON.stringify(list), { headers: cors });
    }

    if (req.method === "POST") {
      const body = await req.json();
      body.id = "o_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      body.created = Date.now();
      list.unshift(body);
      await store.setJSON(KEY, list);
      return new Response(JSON.stringify({ ok: true, item: body }), { headers: cors });
    }

    if (req.method === "DELETE") {
      const id = new URL(req.url).searchParams.get("id");
      list = list.filter((o) => o.id !== id);
      await store.setJSON(KEY, list);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "bad_request", message: String(e) }), { status: 400, headers: cors });
  }

  return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: cors });
};

export const config = { path: "/api/opportunities" };
