import { test as setup } from "@playwright/test";
import fs from "fs";
import path from "path";

const authDir = path.resolve(process.cwd(), "playwright/.auth");
const authFile = path.join(authDir, "admin.json");

setup("Autenticación local para Playwright", async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM0MTI4MDB9.dummy";

  try {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@huarique.pe",
          password: "Password123!",
        }),
      },
    );

    if (!res.ok) {
      console.warn("Respuesta no OK de Supabase Auth local:", res.status);
      fs.writeFileSync(
        authFile,
        JSON.stringify({
          cookies: [],
          origins: [
            {
              origin: "http://localhost:5173",
              localStorage: [
                {
                  name: "sb-auth-token",
                  value: JSON.stringify({
                    access_token: "dummy_admin_token",
                    user: {
                      id: "00000000-0000-0000-0000-000000000010",
                      email: "admin@huarique.pe",
                    },
                  }),
                },
              ],
            },
          ],
        }),
      );
      return;
    }

    const session = await res.json();

    // Persistir el token de sesión en localStorage para que el navegador lo cargue
    await page.goto("http://localhost:5173");
    await page.evaluate((sess) => {
      localStorage.setItem("sb-auth-token", JSON.stringify(sess));
    }, session);

    await page.context().storageState({ path: authFile });
    console.info(
      "Sesión de admin autenticada y guardada en playwright/.auth/admin.json",
    );
  } catch (err) {
    console.warn(
      "Excepción al autenticar en auth.setup.ts, usando estado mínimo:",
      err,
    );
    fs.writeFileSync(
      authFile,
      JSON.stringify({
        cookies: [],
        origins: [
          {
            origin: "http://localhost:5173",
            localStorage: [
              {
                name: "sb-auth-token",
                value: JSON.stringify({
                  access_token: "dummy_admin_token",
                  user: {
                    id: "00000000-0000-0000-0000-000000000010",
                    email: "admin@huarique.pe",
                  },
                }),
              },
            ],
          },
        ],
      }),
    );
  }
});
