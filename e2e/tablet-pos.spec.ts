import { test, expect } from "@playwright/test";

test.describe("Pruebas E2E de Interfaz Táctil POS — El Huarique de Catacaos", () => {
  test("Verifica ausencia de llamadas a Google Fonts (Fuentes 100% locales WOFF2)", async ({
    page,
  }) => {
    const externalFontRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (
        url.includes("fonts.googleapis.com") ||
        url.includes("fonts.gstatic.com")
      ) {
        externalFontRequests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Debe ser estrictamente 0 llamadas externas
    expect(externalFontRequests).toHaveLength(0);
  });

  test("Verifica cabecera, logo transparente y ausencia de scroll global", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Logo oficial visible
    const logo = page.locator('img[alt="Huarique de Catacaos"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute(
      "src",
      "/brand/huarique-logo-transparente.png",
    );

    // 2. Comprobar que no hay scroll global horizontal ni vertical en el documento
    const scrollDimensions = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollDimensions.scrollHeight).toBeLessThanOrEqual(
      scrollDimensions.clientHeight + 1,
    );
    expect(scrollDimensions.scrollWidth).toBeLessThanOrEqual(
      scrollDimensions.clientWidth + 1,
    );
  });

  test("Verifica que todos los controles interactivos tienen dimensiones táctiles >= 48x48 px", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Pestañas de navegación
    const navButtons = page.locator("header nav button");
    const navCount = await navButtons.count();
    expect(navCount).toBeGreaterThan(0);

    for (let i = 0; i < navCount; i++) {
      const btn = navButtons.nth(i);
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48);
        expect(box.width).toBeGreaterThanOrEqual(48);
      }
    }

    // Botones de selección de salón
    const salonTabs = page.locator('div[role="tablist"] button[role="tab"]');
    const salonCount = await salonTabs.count();
    expect(salonCount).toBe(3);

    for (let i = 0; i < salonCount; i++) {
      const tab = salonTabs.nth(i);
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48);
        expect(box.width).toBeGreaterThanOrEqual(48);
      }
    }
  });

  test("Verifica navegación entre salones y apertura/cierre accesible de modal de mesa", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Salón Familiar (Mesa 31 en adelante)
    const salonFamiliar = page.getByRole("tab", { name: /Salón Familiar/i });
    await salonFamiliar.click();
    await expect(salonFamiliar).toHaveAttribute("aria-selected", "true");

    // Hacer clic en Mesa 35
    const table35 = page.getByRole("button", { name: /Mesa 35,/i });
    await expect(table35).toBeVisible();
    await table35.click();

    // Modal debe aparecer
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Detalle de Mesa 35/i)).toBeVisible();

    // Cerrar modal presionando Escape
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("Verifica funcionamiento táctil del teclado numérico para PIN de mozo", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Cambiar a pestaña Toma de Pedidos
    await page.locator("header nav button", { hasText: /Pedidos/i }).click();

    // Teclear 4 dígitos: 1, 2, 3, 4
    await page.getByRole("button", { name: "1", exact: true }).click();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "4", exact: true }).click();

    const pinDisplay = page.getByTestId("pin-display");
    await expect(pinDisplay).toHaveText("••••");
  });
});
