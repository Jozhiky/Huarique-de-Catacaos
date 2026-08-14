import { describe, it, expect, vi, beforeEach } from "vitest";
import { menuService } from "./menuService";
import { supabase } from "./supabaseClient";

vi.mock("./supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("menuService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("llama a getFullMenu y mapea categorías, productos, variantes y reglas", async () => {
    const mockCategories = [
      {
        id: "cat-1",
        restaurant_id: "rest-1",
        name: "Ceviches",
        display_order: 1,
        is_active: true,
      },
    ];
    const mockProducts = [
      {
        id: "prod-1",
        restaurant_id: "rest-1",
        category_id: "cat-1",
        name: "Ceviche Simple",
        description: "Clásico",
        is_active: true,
        is_available: true,
        display_order: 1,
      },
    ];
    const mockVariants = [
      {
        id: "var-1",
        restaurant_id: "rest-1",
        product_id: "prod-1",
        variant_name: "Personal",
        price: 30,
        price_needs_validation: false,
        is_orderable: true,
        is_active: true,
        display_order: 1,
      },
    ];
    const mockRules = [
      { product_id: "prod-1", day_of_week: 1, restaurant_id: "rest-1" },
    ];

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "menu_categories") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockResolvedValue({ data: mockCategories, error: null }),
          }),
        };
      }
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockResolvedValue({ data: mockProducts, error: null }),
          }),
        };
      }
      if (table === "product_variants") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockResolvedValue({ data: mockVariants, error: null }),
          }),
        };
      }
      if (table === "product_availability_rules") {
        return {
          select: vi.fn().mockResolvedValue({ data: mockRules, error: null }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    }) as unknown as typeof supabase.from);

    const result = await menuService.getFullMenu();
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]?.name).toBe("Ceviches");
    expect(result.categories[0]?.itemsCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Ceviche Simple");
    expect(result.items[0]?.variants).toHaveLength(1);
    expect(result.items[0]?.availableDays).toEqual([1]);
  });

  it("ejecuta admin_confirm_validated_price correctamente", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    } as never);

    await expect(
      menuService.confirmValidatedPrice("var-123", 45.0),
    ).resolves.toBeUndefined();

    expect(supabase.rpc).toHaveBeenCalledWith("admin_confirm_validated_price", {
      p_variant_id: "var-123",
      p_confirmed_price: 45.0,
    });
  });

  it("ejecuta admin_toggle_product_availability correctamente", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    } as never);

    await expect(
      menuService.toggleProductAvailability("prod-1", false),
    ).resolves.toBeUndefined();

    expect(supabase.rpc).toHaveBeenCalledWith(
      "admin_toggle_product_availability",
      {
        p_product_id: "prod-1",
        p_is_available: false,
      },
    );
  });
});
