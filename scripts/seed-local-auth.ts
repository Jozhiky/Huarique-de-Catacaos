/**
 * Script de Semilla de Autenticación Local para Desarrollo y Tests
 * Proyecto: El Huarique de Catacaos — Sistema POS
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Validación estricta de seguridad: Únicamente entornos locales
const url = new URL(supabaseUrl);
const allowedHostnames = ["localhost", "127.0.0.1", "::1"];

if (!allowedHostnames.includes(url.hostname)) {
  console.error(
    `[SEGURIDAD] Prohibido ejecutar seed-local-auth en hosts remotos: ${url.hostname}`,
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_USERS = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    email: "admin@huarique.pe",
    password: "Password123!",
    firstName: "Rosa",
    lastName: "Morales",
    staffCode: "1001",
    role: "admin" as const,
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    email: "waiter@huarique.pe",
    password: "Password123!",
    firstName: "Carlos",
    lastName: "Sánchez",
    staffCode: "2001",
    role: "waiter" as const,
  },
  {
    id: "00000000-0000-0000-0000-000000000030",
    email: "cashier@huarique.pe",
    password: "Password123!",
    firstName: "Elena",
    lastName: "Flores",
    staffCode: "3001",
    role: "cashier" as const,
  },
  {
    id: "00000000-0000-0000-0000-000000000040",
    email: "printer@huarique.pe",
    password: "Password123!",
    firstName: "Agente",
    lastName: "Impresión",
    staffCode: "4001",
    role: "printer_agent" as const,
  },
];

const RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function seed() {
  console.log("Iniciando carga de cuentas de prueba locales en:", supabaseUrl);

  for (const user of DEMO_USERS) {
    const { data: existingUser } = await supabase.auth.admin.getUserById(
      user.id,
    );

    if (!existingUser?.user) {
      const { error: createError } = await supabase.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          restaurant_id: RESTAURANT_ID,
          staff_role: user.role,
        },
      });

      if (createError) {
        console.error(
          `Error creando usuario auth ${user.email}:`,
          createError.message,
        );
      } else {
        console.log(`Usuario auth creado: ${user.email}`);
      }
    } else {
      console.log(`Usuario auth ya existente: ${user.email}`);
    }

    // Insertar o actualizar profile en public.profiles
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        restaurant_id: RESTAURANT_ID,
        first_name: user.firstName,
        last_name: user.lastName,
        staff_code: user.staffCode,
        staff_role: user.role,
        active: true,
      },
      { onConflict: "user_id" },
    );

    if (profileError) {
      console.error(`Error en perfil ${user.email}:`, profileError.message);
    } else {
      console.log(
        `Perfil sincronizado: ${user.firstName} ${user.lastName} (${user.role})`,
      );
    }
  }

  console.log("Semilla local completada con éxito.");
}

seed().catch((err) => {
  console.error("Error fatal durante la semilla:", err);
  process.exit(1);
});
