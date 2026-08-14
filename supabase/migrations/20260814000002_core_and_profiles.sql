-- ==============================================================================
-- Migración 2: Núcleo, Perfiles, Salones, Mesas y Turnos
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- 1. Tabla de Restaurantes (Tenants)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    name text NOT NULL,
    legal_name text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabla de Perfiles de Personal
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
    first_name text NOT NULL,
    last_name text NOT NULL,
    staff_code text,
    staff_role public.staff_role_enum NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_profiles_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_profiles_restaurant_staff_code UNIQUE (restaurant_id, staff_code),
    CONSTRAINT chk_staff_code_format CHECK (staff_code IS NULL OR staff_code ~ '^[0-9]{2,4}$')
);

-- 3. Tabla de Salones
CREATE TABLE IF NOT EXISTS public.dining_rooms (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    name text NOT NULL,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_dining_rooms_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_dining_rooms_restaurant_name UNIQUE (restaurant_id, name)
);

-- 4. Tabla de Mesas de Restaurante
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    dining_room_id uuid NOT NULL,
    table_number integer NOT NULL,
    capacity integer NOT NULL DEFAULT 4,
    status public.table_status_enum NOT NULL DEFAULT 'free',
    pos_x integer NOT NULL DEFAULT 0,
    pos_y integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_restaurant_tables_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_restaurant_tables_room_number UNIQUE (dining_room_id, table_number),
    CONSTRAINT fk_restaurant_tables_dining_room FOREIGN KEY (restaurant_id, dining_room_id)
        REFERENCES public.dining_rooms(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_table_number_positive CHECK (table_number > 0),
    CONSTRAINT chk_capacity_positive CHECK (capacity > 0)
);

-- 5. Tabla de Turnos Operativos
CREATE TABLE IF NOT EXISTS public.shifts (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    opened_by uuid NOT NULL,
    closed_by uuid,
    opened_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_shifts_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT fk_shifts_opened_by FOREIGN KEY (restaurant_id, opened_by)
        REFERENCES public.profiles(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_shifts_closed_by FOREIGN KEY (restaurant_id, closed_by)
        REFERENCES public.profiles(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_shift_closed_at CHECK (closed_at IS NULL OR closed_at >= opened_at)
);

-- 6. Índices para rendimiento y soporte a Claves Foráneas
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON public.profiles (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dining_rooms_restaurant_id ON public.dining_rooms (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_dining_room ON public.restaurant_tables (restaurant_id, dining_room_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_status ON public.restaurant_tables (restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant_id ON public.shifts (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_opened_by ON public.shifts (restaurant_id, opened_by);
CREATE INDEX IF NOT EXISTS idx_shifts_closed_by ON public.shifts (restaurant_id, closed_by);
