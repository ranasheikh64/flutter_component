import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-8768a732/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth: Sign up
app.post("/make-server-8768a732/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ error: "Failed to sign up" }, 500);
  }
});

// Get all code snippets
app.get("/make-server-8768a732/snippets", async (c) => {
  try {
    const snippets = await kv.getByPrefix("snippet:");
    return c.json({ snippets: snippets || [] });
  } catch (error) {
    console.log("Error fetching snippets:", error);
    return c.json({ error: "Failed to fetch snippets" }, 500);
  }
});

// Get single snippet by ID
app.get("/make-server-8768a732/snippets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const snippet = await kv.get(`snippet:${id}`);
    if (!snippet) {
      return c.json({ error: "Snippet not found" }, 404);
    }
    return c.json({ snippet });
  } catch (error) {
    console.log("Error fetching snippet:", error);
    return c.json({ error: "Failed to fetch snippet" }, 500);
  }
});

// Create new snippet
app.post("/make-server-8768a732/snippets", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, code, category, tags, useCase, userId, userName } = body;
    
    if (!title || !code || !category) {
      return c.json({ error: "Title, code, and category are required" }, 400);
    }
    
    const id = crypto.randomUUID();
    const snippet = {
      id,
      title,
      description: description || "",
      code,
      category,
      tags: tags || [],
      useCase: useCase || "",
      userId: userId || null,
      userName: userName || "Anonymous",
      userAvatar: userName ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`snippet:${id}`, snippet);
    return c.json({ snippet });
  } catch (error) {
    console.log("Error creating snippet:", error);
    return c.json({ error: "Failed to create snippet" }, 500);
  }
});

// Update snippet
app.put("/make-server-8768a732/snippets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, description, code, category, tags, useCase } = body;
    
    const existing = await kv.get(`snippet:${id}`);
    if (!existing) {
      return c.json({ error: "Snippet not found" }, 404);
    }
    
    const snippet = {
      ...(existing as object),
      title: title || (existing as any).title,
      description: description !== undefined ? description : (existing as any).description,
      code: code || (existing as any).code,
      category: category || (existing as any).category,
      tags: tags !== undefined ? tags : (existing as any).tags,
      useCase: useCase !== undefined ? useCase : (existing as any).useCase,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`snippet:${id}`, snippet);
    return c.json({ snippet });
  } catch (error) {
    console.log("Error updating snippet:", error);
    return c.json({ error: "Failed to update snippet" }, 500);
  }
});

// Delete snippet
app.delete("/make-server-8768a732/snippets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`snippet:${id}`);
    if (!existing) {
      return c.json({ error: "Snippet not found" }, 404);
    }
    
    await kv.del(`snippet:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting snippet:", error);
    return c.json({ error: "Failed to delete snippet" }, 500);
  }
});

Deno.serve(app.fetch);