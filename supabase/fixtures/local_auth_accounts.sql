-- ==============================================================================
-- Fixtures de Cuentas Locales de Autenticación para Entornos de Prueba / pgTAP
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

BEGIN;

-- 1. Usuarios en auth.users (Hash bcrypt precalculado para 'Password123!')
-- Hash: $2a$10$e8w...
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000010',
        'authenticated',
        'authenticated',
        'admin@huarique.pe',
        extensions.crypt('Password123!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Rosa","last_name":"Morales","restaurant_id":"00000000-0000-0000-0000-000000000001","staff_role":"admin"}',
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000020',
        'authenticated',
        'authenticated',
        'waiter@huarique.pe',
        extensions.crypt('Password123!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Carlos","last_name":"Sánchez","restaurant_id":"00000000-0000-0000-0000-000000000001","staff_role":"waiter"}',
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000030',
        'authenticated',
        'authenticated',
        'cashier@huarique.pe',
        extensions.crypt('Password123!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Elena","last_name":"Flores","restaurant_id":"00000000-0000-0000-0000-000000000001","staff_role":"cashier"}',
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000040',
        'authenticated',
        'authenticated',
        'printer@huarique.pe',
        extensions.crypt('Password123!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Agente","last_name":"Impresión","restaurant_id":"00000000-0000-0000-0000-000000000001","staff_role":"printer_agent"}',
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Perfiles en public.profiles
INSERT INTO public.profiles (
    id,
    restaurant_id,
    user_id,
    first_name,
    last_name,
    staff_code,
    staff_role,
    active
) VALUES
    (
        '00000000-0000-0000-0000-000000000110',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000010',
        'Rosa',
        'Morales',
        '1001',
        'admin',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000120',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000020',
        'Carlos',
        'Sánchez',
        '2001',
        'waiter',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000130',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000030',
        'Elena',
        'Flores',
        '3001',
        'cashier',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000140',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000040',
        'Agente',
        'Impresión',
        '4001',
        'printer_agent',
        true
    )
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
