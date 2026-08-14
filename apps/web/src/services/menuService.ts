import { supabase } from "./supabaseClient";
import type { MenuCategory, MenuItem, MenuItemVariant } from "@huarique/domain";

export interface FullMenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

export const menuService = {
  /**
   * Obtiene la estructura completa de la carta (categorías, productos, variantes y reglas)
   */
  async getFullMenu(): Promise<FullMenuData> {
    // 1. Obtener categorías
    const { data: categoriesData, error: catError } = await supabase
      .from("menu_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (catError) {
      throw new Error(`Error al cargar categorías: ${catError.message}`);
    }

    // 2. Obtener productos
    const { data: productsData, error: prodError } = await supabase
      .from("products")
      .select("*")
      .order("display_order", { ascending: true });

    if (prodError) {
      throw new Error(`Error al cargar productos: ${prodError.message}`);
    }

    // 3. Obtener variantes
    const { data: variantsData, error: varError } = await supabase
      .from("product_variants")
      .select("*")
      .order("display_order", { ascending: true });

    if (varError) {
      throw new Error(`Error al cargar variantes: ${varError.message}`);
    }

    // 4. Obtener reglas de disponibilidad por día
    const { data: rulesData, error: rulesError } = await supabase
      .from("product_availability_rules")
      .select("*");

    if (rulesError) {
      throw new Error(
        `Error al cargar reglas de disponibilidad: ${rulesError.message}`,
      );
    }

    // Mapear reglas por producto
    const rulesMap = new Map<string, number[]>();
    for (const rule of rulesData || []) {
      const days = rulesMap.get(rule.product_id) || [];
      days.push(rule.day_of_week);
      rulesMap.set(rule.product_id, days);
    }

    // Mapear variantes por producto
    const variantsMap = new Map<string, MenuItemVariant[]>();
    for (const v of variantsData || []) {
      const itemVariants = variantsMap.get(v.product_id) || [];
      itemVariants.push({
        id: v.id,
        restaurantId: v.restaurant_id,
        productId: v.product_id,
        variantName: v.variant_name,
        price: Number(v.price),
        priceNeedsValidation: v.price_needs_validation,
        isOrderable: v.is_orderable,
        isActive: v.is_active,
        displayOrder: v.display_order,
      });
      variantsMap.set(v.product_id, itemVariants);
    }

    // Mapear productos
    const items: MenuItem[] = (productsData || []).map((p) => ({
      id: p.id,
      restaurantId: p.restaurant_id,
      categoryId: p.category_id,
      name: p.name,
      description: p.description,
      isActive: p.is_active,
      isAvailable: p.is_available,
      displayOrder: p.display_order,
      variants: variantsMap.get(p.id) || [],
      availableDays: rulesMap.get(p.id),
    }));

    // Mapear categorías con contador de productos
    const categories: MenuCategory[] = (categoriesData || []).map((c) => ({
      id: c.id,
      restaurantId: c.restaurant_id,
      name: c.name,
      description: c.description,
      displayOrder: c.display_order,
      isActive: c.is_active,
      itemsCount: items.filter((item) => item.categoryId === c.id).length,
    }));

    return { categories, items };
  },

  // --------------------------------------------------------------------------
  // Categorías
  // --------------------------------------------------------------------------
  async createCategory(name: string, displayOrder = 0): Promise<string> {
    const { data, error } = await supabase.rpc("admin_create_category", {
      p_name: name,
      p_display_order: displayOrder,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async updateCategory(
    categoryId: string,
    name: string,
    displayOrder: number,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_update_category", {
      p_category_id: categoryId,
      p_name: name,
      p_display_order: displayOrder,
    });
    if (error) throw new Error(error.message);
  },

  async reorderCategories(categoryIds: string[]): Promise<void> {
    const { error } = await supabase.rpc("admin_reorder_categories", {
      p_category_ids: categoryIds,
    });
    if (error) throw new Error(error.message);
  },

  async toggleCategoryActive(
    categoryId: string,
    isActive: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_toggle_category_active", {
      p_category_id: categoryId,
      p_is_active: isActive,
    });
    if (error) throw new Error(error.message);
  },

  // --------------------------------------------------------------------------
  // Productos
  // --------------------------------------------------------------------------
  async createProduct(
    categoryId: string,
    name: string,
    description: string | null = null,
    displayOrder = 0,
  ): Promise<string> {
    const { data, error } = await supabase.rpc("admin_create_product", {
      p_category_id: categoryId,
      p_name: name,
      p_description: description,
      p_display_order: displayOrder,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async updateProduct(
    productId: string,
    name: string,
    description: string | null,
    displayOrder: number,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_update_product", {
      p_product_id: productId,
      p_name: name,
      p_description: description,
      p_display_order: displayOrder,
    });
    if (error) throw new Error(error.message);
  },

  async changeProductCategory(
    productId: string,
    newCategoryId: string,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_change_product_category", {
      p_product_id: productId,
      p_new_category_id: newCategoryId,
    });
    if (error) throw new Error(error.message);
  },

  async reorderProducts(
    categoryId: string,
    productIds: string[],
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_reorder_products", {
      p_category_id: categoryId,
      p_product_ids: productIds,
    });
    if (error) throw new Error(error.message);
  },

  async toggleProductActive(
    productId: string,
    isActive: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_toggle_product_active", {
      p_product_id: productId,
      p_is_active: isActive,
    });
    if (error) throw new Error(error.message);
  },

  async toggleProductAvailability(
    productId: string,
    isAvailable: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_toggle_product_availability", {
      p_product_id: productId,
      p_is_available: isAvailable,
    });
    if (error) throw new Error(error.message);
  },

  // --------------------------------------------------------------------------
  // Variantes y Precios
  // --------------------------------------------------------------------------
  async createVariant(
    productId: string,
    variantName: string,
    price: number,
    displayOrder = 0,
  ): Promise<string> {
    const { data, error } = await supabase.rpc("admin_create_product_variant", {
      p_product_id: productId,
      p_variant_name: variantName,
      p_price: price,
      p_display_order: displayOrder,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async updateVariant(
    variantId: string,
    variantName: string,
    displayOrder: number,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_update_product_variant", {
      p_variant_id: variantId,
      p_variant_name: variantName,
      p_display_order: displayOrder,
    });
    if (error) throw new Error(error.message);
  },

  async reorderVariants(
    productId: string,
    variantIds: string[],
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_reorder_product_variants", {
      p_product_id: productId,
      p_variant_ids: variantIds,
    });
    if (error) throw new Error(error.message);
  },

  async toggleVariantActive(
    variantId: string,
    isActive: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_toggle_variant_active", {
      p_variant_id: variantId,
      p_is_active: isActive,
    });
    if (error) throw new Error(error.message);
  },

  async toggleVariantOrderable(
    variantId: string,
    isOrderable: boolean,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_toggle_variant_orderable", {
      p_variant_id: variantId,
      p_is_orderable: isOrderable,
    });
    if (error) throw new Error(error.message);
  },

  async updateVariantPrice(variantId: string, newPrice: number): Promise<void> {
    const { error } = await supabase.rpc("admin_update_variant_price", {
      p_variant_id: variantId,
      p_new_price: newPrice,
    });
    if (error) throw new Error(error.message);
  },

  async confirmValidatedPrice(
    variantId: string,
    confirmedPrice: number,
  ): Promise<void> {
    const { error } = await supabase.rpc("admin_confirm_validated_price", {
      p_variant_id: variantId,
      p_confirmed_price: confirmedPrice,
    });
    if (error) throw new Error(error.message);
  },

  // --------------------------------------------------------------------------
  // Reglas de Disponibilidad por Día
  // --------------------------------------------------------------------------
  async setProductAvailabilityRules(
    productId: string,
    days: number[],
  ): Promise<void> {
    const { error } = await supabase.rpc(
      "admin_set_product_availability_rules",
      {
        p_product_id: productId,
        p_days: days,
      },
    );
    if (error) throw new Error(error.message);
  },
};
