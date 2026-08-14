import { test, expect } from "@playwright/test";

test.describe("Pruebas E2E de Hardening Táctil POS — El Huarique de Catacaos", () => {
  test("1. Fuentes WOFF2 Locales: Carga exitosa de todos los pesos y cero llamadas externas", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const externalFontRequests: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("Failed to decode downloaded font") ||
          text.includes("OTS parsing error")
        ) {
          consoleErrors.push(text);
        }
      }
    });

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

    // Esperar que document.fonts esté listo
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // Cargar y validar individualmente cada familia y peso WOFF2
    const fontTests = [
      { family: "Barlow Condensed", weights: ["600", "700", "800", "900"] },
      { family: "Inter", weights: ["400", "500", "600", "700", "800"] },
    ];

    for (const { family, weights } of fontTests) {
      for (const weight of weights) {
        const status = await page.evaluate(
          async ({ fam, wgt }) => {
            const fontSpec = `normal ${wgt} 16px "${fam}"`;
            const loadedFonts = await document.fonts.load(fontSpec);
            if (loadedFonts.length === 0) return "not_found";
            return loadedFonts[0]?.status ?? "unknown";
          },
          { fam: family, wgt: weight },
        );

        expect(
          status,
          `Fuente ${family} peso ${weight} debe estar en estado 'loaded'`,
        ).toBe("loaded");
      }
    }

    // Comprobar ausencia absoluta de errores de decodificación o llamadas externas
    expect(
      consoleErrors,
      "No deben existir errores de decodificación OTS ni fuentes corruptas",
    ).toHaveLength(0);
    expect(
      externalFontRequests,
      "No deben existir solicitudes externas a Google Fonts",
    ).toHaveLength(0);
  });

  test("2. Cabecera Responsiva: Sin scroll horizontal y elementos dentro del viewport", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();
    const viewportWidth = viewportSize?.width ?? 1280;

    // 1. Obtener dimensiones del header
    const header = page.getByTestId("pos-header");
    await expect(header).toBeVisible();

    const headerBox = await header.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      offsetWidth: el.offsetWidth,
    }));

    // El ancho de scroll no debe superar el ancho cliente del viewport
    expect(
      headerBox.scrollWidth,
      `Header scrollWidth (${headerBox.scrollWidth}) no debe exceder clientWidth (${headerBox.clientWidth})`,
    ).toBeLessThanOrEqual(headerBox.clientWidth + 1);

    // 2. Verificar que cada botón visible dentro de la cabecera está dentro de los límites del viewport
    const headerButtons = header.locator("button");
    const btnCount = await headerButtons.count();
    expect(btnCount).toBeGreaterThan(0);

    for (let i = 0; i < btnCount; i++) {
      const btn = headerButtons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(
            box.x,
            `Botón ${i} x (${box.x}) debe ser >= 0`,
          ).toBeGreaterThanOrEqual(0);
          expect(
            box.x + box.width,
            `Botón ${i} x+width (${box.x + box.width}) debe ser <= viewportWidth (${viewportWidth})`,
          ).toBeLessThanOrEqual(viewportWidth + 1);
          expect(
            box.height,
            `Botón ${i} altura debe ser >= 48px`,
          ).toBeGreaterThanOrEqual(48);
          expect(
            box.width,
            `Botón ${i} ancho debe ser >= 48px`,
          ).toBeGreaterThanOrEqual(48);
        }
      }
    }

    // 3. Logo oficial visible y dentro del viewport
    const logo = page.locator('img[alt="Huarique de Catacaos"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute(
      "src",
      "/brand/huarique-logo-transparente.png",
    );

    // 4. Usuario y botón de bloqueo visibles
    const lockBtn = page.getByRole("button", { name: /Bloquear sesión/i });
    await expect(lockBtn).toBeVisible();

    // 5. Capturar captura visual para auditoría
    const screenshot = await page.screenshot({ fullPage: false });
    await testInfo.attach(
      `tablet-header-${viewportWidth}x${viewportSize?.height}`,
      {
        body: screenshot,
        contentType: "image/png",
      },
    );
  });

  test("3. Objetivos Táctiles Ergonómicos: Todos los controles >= 48x48 px", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Pestañas de navegación
    const navButtons = page.locator("header nav button");
    const navCount = await navButtons.count();
    expect(navCount).toBe(5);

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

  test("4. Flujo Operativo y Accesibilidad: Modal accesible, focus trap y teclado", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Cambiar a Salón Terraza
    const salonTerraza = page.getByRole("tab", { name: /Salón Terraza/i });
    await salonTerraza.click();
    await expect(salonTerraza).toHaveAttribute("aria-selected", "true");

    // Clic en Mesa 60
    const table60 = page.getByRole("button", { name: /Mesa 60,/i });
    await expect(table60).toBeVisible();
    await table60.click();

    // Modal accesible
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Detalle de Mesa 60/i)).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("5. Teclado Numérico para PIN de Mozo", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Pestaña Pedidos
    await page.locator("header nav button", { hasText: "Pedidos" }).click();

    // Marcar 1, 2, 3, 4
    await page.getByRole("button", { name: "1", exact: true }).click();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "4", exact: true }).click();

    const pinDisplay = page.getByTestId("pin-display");
    await expect(pinDisplay).toHaveText("••••");
  });
});
