-- ==============================================================================
-- Migración 4: Esquema de Inventario, Insumos, Recetas, Compras y Balances
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- 1. Insumos e Ingredientes Base
CREATE TABLE IF NOT EXISTS public.ingredients (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    name text NOT NULL,
    base_unit public.unit_measure_enum NOT NULL,
    min_stock_alert numeric(12,3) NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_ingredients_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_ingredients_restaurant_name UNIQUE (restaurant_id, name),
    CONSTRAINT chk_ingredients_min_stock CHECK (min_stock_alert >= 0)
);

-- 2. Recetas (Consumo de Insumo por Variante de Plato)
CREATE TABLE IF NOT EXISTS public.recipe_items (
    variant_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    quantity numeric(12,3) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (variant_id, ingredient_id),
    CONSTRAINT fk_recipe_items_variant FOREIGN KEY (restaurant_id, variant_id)
        REFERENCES public.product_variants(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_items_ingredient FOREIGN KEY (restaurant_id, ingredient_id)
        REFERENCES public.ingredients(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_recipe_items_quantity CHECK (quantity > 0)
);

-- 3. Proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    name text NOT NULL,
    ruc text,
    phone text,
    email text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_suppliers_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_suppliers_restaurant_ruc UNIQUE (restaurant_id, ruc)
);

-- 4. Cabecera de Compras
CREATE TABLE IF NOT EXISTS public.purchases (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    supplier_id uuid,
    invoice_number text,
    purchase_date timestamptz NOT NULL DEFAULT now(),
    total numeric(12,2) NOT NULL DEFAULT 0.00,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_purchases_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_purchases_supplier FOREIGN KEY (restaurant_id, supplier_id)
        REFERENCES public.suppliers(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_purchases_total CHECK (total >= 0)
);

-- 5. Detalle de Compra (Líneas de Insumos Comprados)
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    purchase_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_purchase_items_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_purchase_items_purchase FOREIGN KEY (restaurant_id, purchase_id)
        REFERENCES public.purchases(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_items_ingredient FOREIGN KEY (restaurant_id, ingredient_id)
        REFERENCES public.ingredients(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_purchase_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_purchase_items_unit_cost CHECK (unit_cost >= 0)
);

-- 6. Movimientos de Inventario (Diario Inmutable Append-Only)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    ingredient_id uuid NOT NULL,
    movement_type public.inventory_movement_type_enum NOT NULL,
    quantity numeric(12,3) NOT NULL,
    reclassification_group_id uuid,
    reference_id uuid,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_inventory_movements_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_inventory_movements_ingredient FOREIGN KEY (restaurant_id, ingredient_id)
        REFERENCES public.ingredients(restaurant_id, id) ON DELETE RESTRICT
);

-- 7. Balances de Inventario Materializados
CREATE TABLE IF NOT EXISTS public.inventory_balances (
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    ingredient_id uuid NOT NULL,
    current_balance numeric(12,3) NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (restaurant_id, ingredient_id),
    CONSTRAINT fk_inventory_balances_ingredient FOREIGN KEY (restaurant_id, ingredient_id)
        REFERENCES public.ingredients(restaurant_id, id) ON DELETE RESTRICT
);

-- 8. Índices para claves foráneas y consultas de inventario
CREATE INDEX IF NOT EXISTS idx_recipe_items_ingredient ON public.recipe_items (restaurant_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON public.purchases (restaurant_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_ingredient ON public.purchase_items (restaurant_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_ingredient ON public.inventory_movements (restaurant_id, ingredient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reclass ON public.inventory_movements (reclassification_group_id) WHERE reclassification_group_id IS NOT NULL;
