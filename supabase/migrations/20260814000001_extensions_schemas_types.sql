-- ==============================================================================
-- Migración 1: Extensiones, Esquemas y Tipos Enumerados del Dominio
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. Esquema privado para funciones de autorización no expuestas a PostgREST
CREATE SCHEMA IF NOT EXISTS app_private;
ALTER SCHEMA app_private OWNER TO postgres;

-- 3. Tipos enumerados de negocio
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role_enum') THEN
        CREATE TYPE public.staff_role_enum AS ENUM (
            'admin',
            'cashier',
            'waiter',
            'printer_agent'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status_enum') THEN
        CREATE TYPE public.table_status_enum AS ENUM (
            'free',
            'occupied',
            'waiting_kitchen',
            'served',
            'waiting_payment'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE public.order_status_enum AS ENUM (
            'draft',
            'open',
            'closed',
            'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_stage_enum') THEN
        CREATE TYPE public.order_stage_enum AS ENUM (
            'before_prep',
            'after_prep'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'print_job_status_enum') THEN
        CREATE TYPE public.print_job_status_enum AS ENUM (
            'pending',
            'claimed',
            'sent_unconfirmed',
            'printed_assumed',
            'printed_confirmed',
            'failed',
            'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_movement_type_enum') THEN
        CREATE TYPE public.inventory_movement_type_enum AS ENUM (
            'initial_load',
            'purchase_entry',
            'recipe_consumption',
            'cancellation_reversal',
            'spoilage_waste',
            'physical_count_adjustment'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_measure_enum') THEN
        CREATE TYPE public.unit_measure_enum AS ENUM (
            'kg',
            'g',
            'l',
            'ml',
            'unit'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE public.payment_method_enum AS ENUM (
            'cash',
            'yape',
            'plin',
            'card'
        );
    END IF;
END $$;
