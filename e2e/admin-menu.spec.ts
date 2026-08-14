import { test, expect } from "@playwright/test";

test.describe("Administración de Carta y Precios — Pruebas E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar llamadas a Supabase si no está corriendo el servidor local completo
    await page.route("**/rest/v1/menu_categories*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0010-000000000001",
            restaurant_id: "00000000-0000-0000-0000-000000000001",
            name: "Entradas",
            display_order: 1,
            is_active: true,
          },
          {
            id: "00000000-0000-0000-0010-000000000002",
            restaurant_id: "00000000-0000-0000-0000-000000000001",
            name: "Ceviches",
            display_order: 2,
            is_active: true,
          },
        ]),
      });
    });

    await page.route("**/rest/v1/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0100-000000000001",
            restaurant_id: "00000000-0000-0000-0000-000000000001",
            category_id: "00000000-0000-0000-0010-000000000001",
            name: "Tamalito verde",
            description: "Humita con chifles y zarza",
            is_active: true,
            is_available: true,
            display_order: 1,
          },
          {
            id: "00000000-0000-0000-0100-000000000012",
            restaurant_id: "00000000-0000-0000-0000-000000000001",
            category_id: "00000000-0000-0000-0010-000000000002",
            name: "Caballa saltpresa",
            description: "Típico norteño",
            is_active: true,
            is_available: true,
            display_order: 2,
          },
        ]),
      });
    });

    await page.route("**/rest/v1/product_variants*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0200-000000000001",
            restaurant_id: "00000000-0000-0000-0000-000000000001",
            product_id: "00000000-0000-0000-0100-000000000001",
            variant_name: "Porción",
            price: 3.0,
            price_needs_validation: false,
            is_orderable: true,
            is_active: true,
            display_order: 1,
          },
          {
            id: "00000000-0000-0000-0200-000000000018",
            restaurant_id: "00000000-0000-0000-0000-000000000001",
            product_id: "00000000-0000-0000-0100-000000000012",
            variant_name: "Fuente",
            price: 100.0,
            price_needs_validation: true,
            is_orderable: false,
            is_active: true,
            display_order: 2,
          },
        ]),
      });
    });

    await page.route(
      "**/rest/v1/product_availability_rules*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto("/");
  });

  test("navega a la pestaña Carta y visualiza los platos y variantes", async ({
    page,
  }) => {
    // Clic en la pestaña Carta
    const cartaTab = page.getByRole("button", { name: "Carta" });
    await expect(cartaTab).toBeVisible();
    await cartaTab.click();

    // Comprobar título de la sección
    await expect(
      page.getByText(/Administración de Carta y Precios/i),
    ).toBeVisible();

    // Comprobar platos
    await expect(page.getByText("Tamalito verde")).toBeVisible();
    await expect(page.getByText("Caballa saltpresa")).toBeVisible();

    // Comprobar badge de VALIDAR exacto
    await expect(page.getByText("VALIDAR", { exact: true })).toBeVisible();

    // Captura de pantalla para evidencia
    const viewport = page.viewportSize();
    const width = viewport ? viewport.width : 1280;
    const height = viewport ? viewport.height : 800;
    await page.screenshot({
      path: `playwright-report/menu-admin-${width}x${height}.png`,
      fullPage: true,
    });
  });

  test("filtra la lista de platos con el buscador de texto", async ({
    page,
  }) => {
    const cartaTab = page.getByRole("button", { name: "Carta" });
    await cartaTab.click();

    const searchInput = page.getByPlaceholder(
      /Buscar plato por nombre o descripción/i,
    );
    await searchInput.fill("saltpresa");

    await expect(page.getByText("Caballa saltpresa")).toBeVisible();
    await expect(page.getByText("Tamalito verde")).not.toBeVisible();
  });

  test("abre modal de Nuevo Plato al hacer clic en el botón", async ({
    page,
  }) => {
    const cartaTab = page.getByRole("button", { name: "Carta" });
    await cartaTab.click();

    const newProductBtn = page.getByRole("button", { name: "Nuevo Plato" });
    await newProductBtn.click();

    await expect(
      page.getByRole("heading", { name: /Nuevo Plato/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/Ej. Seco de chavelo/i)).toBeVisible();
  });

  test("abre modal de Confirmar Precio al pulsar 'Confirmar' en plato VALIDAR", async ({
    page,
  }) => {
    const cartaTab = page.getByRole("button", { name: "Carta" });
    await cartaTab.click();

    const confirmBtn = page.getByRole("button", { name: "Confirmar" });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    await expect(page.getByText(/Confirmar Precio Oficial/i)).toBeVisible();
    await expect(
      page.getByText(/Este plato estaba registrado como/i),
    ).toBeVisible();
  });
});
