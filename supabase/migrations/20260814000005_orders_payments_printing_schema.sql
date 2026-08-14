-- ==============================================================================
-- Migración 5: Esquema de Pedidos, Revisiones, Ítems, Pagos e Impresión
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- 1. Cabecera de Pedidos (Órdenes de Comanda)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    table_id uuid NOT NULL,
    waiter_id uuid NOT NULL,
    client_submission_id text NOT NULL,
    status public.order_status_enum NOT NULL DEFAULT 'open',
    subtotal numeric(12,2) NOT NULL DEFAULT 0.00,
    discount numeric(12,2) NOT NULL DEFAULT 0.00,
    tax numeric(12,2) NOT NULL DEFAULT 0.00,
    total numeric(12,2) NOT NULL DEFAULT 0.00,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_orders_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_orders_submission_id UNIQUE (restaurant_id, client_submission_id),
    CONSTRAINT fk_orders_table FOREIGN KEY (restaurant_id, table_id)
        REFERENCES public.restaurant_tables(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_waiter FOREIGN KEY (restaurant_id, waiter_id)
        REFERENCES public.profiles(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_orders_total_positive CHECK (total >= 0)
);

-- 2. Revisiones de Pedido (Envío Inicial 1..N Adicionales)
CREATE TABLE IF NOT EXISTS public.order_revisions (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL,
    revision_number integer NOT NULL DEFAULT 1,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_order_revisions_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_order_revisions_order_number UNIQUE (order_id, revision_number),
    CONSTRAINT fk_order_revisions_order FOREIGN KEY (restaurant_id, order_id)
        REFERENCES public.orders(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_order_revisions_creator FOREIGN KEY (restaurant_id, created_by)
        REFERENCES public.profiles(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_revision_number_positive CHECK (revision_number > 0)
);

-- 3. Detalle de Ítems de la Comanda (Snapshots Inmutables)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_revision_id uuid NOT NULL,
    variant_id uuid NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    product_name_snapshot text NOT NULL,
    variant_name_snapshot text NOT NULL,
    unit_price_snapshot numeric(12,2) NOT NULL,
    stage public.order_stage_enum,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_order_items_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_order_items_revision FOREIGN KEY (restaurant_id, order_revision_id)
        REFERENCES public.order_revisions(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (restaurant_id, variant_id)
        REFERENCES public.product_variants(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_price CHECK (unit_price_snapshot >= 0)
);

-- 4. Modificadores Aplicados al Ítem de Comanda
CREATE TABLE IF NOT EXISTS public.order_item_modifiers (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_item_id uuid NOT NULL,
    modifier_id uuid NOT NULL,
    modifier_name_snapshot text NOT NULL,
    price_delta_snapshot numeric(12,2) NOT NULL DEFAULT 0.00,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_order_item_modifiers_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_order_item_modifiers_item FOREIGN KEY (restaurant_id, order_item_id)
        REFERENCES public.order_items(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_modifiers_modifier FOREIGN KEY (restaurant_id, modifier_id)
        REFERENCES public.modifiers(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_item_modifier_price CHECK (price_delta_snapshot >= 0)
);

-- 5. Pagos y Cobros
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL,
    cashier_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method public.payment_method_enum NOT NULL,
    reference_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_payments_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_payments_order FOREIGN KEY (restaurant_id, order_id)
        REFERENCES public.orders(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_cashier FOREIGN KEY (restaurant_id, cashier_id)
        REFERENCES public.profiles(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_payments_amount_positive CHECK (amount > 0)
);

-- 6. Impresoras Físicas Configuradas
CREATE TABLE IF NOT EXISTS public.printers (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    name text NOT NULL,
    ip_address text NOT NULL,
    port integer NOT NULL DEFAULT 9100,
    paper_width_mm integer NOT NULL DEFAULT 80,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_printers_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT chk_printers_port CHECK (port > 0 AND port < 65536)
);

-- 7. Agentes de Software Locales de Impresión
CREATE TABLE IF NOT EXISTS public.printer_agents (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    agent_code text NOT NULL,
    name text NOT NULL,
    last_heartbeat_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_printer_agents_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_printer_agents_agent_code UNIQUE (restaurant_id, agent_code)
);

-- 8. Cola Idempotente de Trabajos de Impresión
CREATE TABLE IF NOT EXISTS public.print_jobs (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_revision_id uuid NOT NULL,
    job_type text NOT NULL DEFAULT 'order',
    destination_printer_id uuid NOT NULL,
    claimed_by uuid,
    claim_token uuid,
    claim_expires_at timestamptz,
    status public.print_job_status_enum NOT NULL DEFAULT 'pending',
    attempt_count integer NOT NULL DEFAULT 0,
    next_attempt_at timestamptz,
    last_error text,
    sent_at timestamptz,
    printed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_print_jobs_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_print_jobs_revision_job_printer UNIQUE (order_revision_id, job_type, destination_printer_id),
    CONSTRAINT fk_print_jobs_revision FOREIGN KEY (restaurant_id, order_revision_id)
        REFERENCES public.order_revisions(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_print_jobs_printer FOREIGN KEY (restaurant_id, destination_printer_id)
        REFERENCES public.printers(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_print_jobs_claimed_by FOREIGN KEY (restaurant_id, claimed_by)
        REFERENCES public.printer_agents(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_print_jobs_attempts CHECK (attempt_count BETWEEN 0 AND 3),
    CONSTRAINT chk_claimed_state CHECK (
        (status = 'claimed' AND claimed_by IS NOT NULL AND claim_token IS NOT NULL AND claim_expires_at IS NOT NULL)
        OR (status != 'claimed')
    )
);

-- 9. Registro de Idempotencia por Operación
CREATE TABLE IF NOT EXISTS public.idempotency_records (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    idempotency_key text NOT NULL,
    request_hash text NOT NULL,
    response_payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_idempotency_restaurant_key UNIQUE (restaurant_id, idempotency_key)
);

-- 10. Índices Clave y soporte a FKs
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_open_order_per_table ON public.orders (restaurant_id, table_id)
    WHERE status NOT IN ('closed', 'cancelled');
CREATE UNIQUE INDEX IF NOT EXISTS idx_print_jobs_claim_token ON public.print_jobs (claim_token)
    WHERE claim_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_table ON public.orders (restaurant_id, table_id);
CREATE INDEX IF NOT EXISTS idx_orders_waiter ON public.orders (restaurant_id, waiter_id);
CREATE INDEX IF NOT EXISTS idx_order_revisions_order ON public.order_revisions (restaurant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_order_revisions_creator ON public.order_revisions (restaurant_id, created_by);
CREATE INDEX IF NOT EXISTS idx_order_items_revision ON public.order_items (restaurant_id, order_revision_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON public.order_items (restaurant_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_item ON public.order_item_modifiers (restaurant_id, order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_modifier ON public.order_item_modifiers (restaurant_id, modifier_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (restaurant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_payments_cashier ON public.payments (restaurant_id, cashier_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_printer ON public.print_jobs (restaurant_id, destination_printer_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_claimed_by ON public.print_jobs (restaurant_id, claimed_by);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status_pending ON public.print_jobs (restaurant_id, status)
    WHERE status IN ('pending', 'claimed');
