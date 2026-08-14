/**
 * Tipos generados de base de datos para Supabase
 * Proyecto: El Huarique de Catacaos — Sistema POS
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          legal_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          staff_code: string | null;
          staff_role: Database["public"]["Enums"]["staff_role_enum"];
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          staff_code?: string | null;
          staff_role: Database["public"]["Enums"]["staff_role_enum"];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          staff_code?: string | null;
          staff_role?: Database["public"]["Enums"]["staff_role_enum"];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      dining_rooms: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dining_rooms_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_tables: {
        Row: {
          id: string;
          restaurant_id: string;
          dining_room_id: string;
          table_number: number;
          capacity: number;
          status: Database["public"]["Enums"]["table_status_enum"];
          pos_x: number;
          pos_y: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          dining_room_id: string;
          table_number: number;
          capacity?: number;
          status?: Database["public"]["Enums"]["table_status_enum"];
          pos_x?: number;
          pos_y?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          dining_room_id?: string;
          table_number?: number;
          capacity?: number;
          status?: Database["public"]["Enums"]["table_status_enum"];
          pos_x?: number;
          pos_y?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_restaurant_tables_dining_room";
            columns: ["restaurant_id", "dining_room_id"];
            isOneToOne: false;
            referencedRelation: "dining_rooms";
            referencedColumns: ["restaurant_id", "id"];
          },
        ];
      };
      shifts: {
        Row: {
          id: string;
          restaurant_id: string;
          opened_by: string;
          closed_by: string | null;
          opened_at: string;
          closed_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          opened_by: string;
          closed_by?: string | null;
          opened_at?: string;
          closed_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          opened_by?: string;
          closed_by?: string | null;
          opened_at?: string;
          closed_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_shifts_opened_by";
            columns: ["restaurant_id", "opened_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["restaurant_id", "id"];
          },
        ];
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          is_available: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          is_available?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          is_available?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_products_category";
            columns: ["restaurant_id", "category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["restaurant_id", "id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          restaurant_id: string;
          product_id: string;
          variant_name: string;
          price: number;
          price_needs_validation: boolean;
          is_orderable: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          product_id: string;
          variant_name: string;
          price: number;
          price_needs_validation?: boolean;
          is_orderable?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          product_id?: string;
          variant_name?: string;
          price?: number;
          price_needs_validation?: boolean;
          is_orderable?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_product_variants_product";
            columns: ["restaurant_id", "product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["restaurant_id", "id"];
          },
        ];
      };
      product_availability_rules: {
        Row: {
          product_id: string;
          day_of_week: number;
          restaurant_id: string;
          created_at: string;
        };
        Insert: {
          product_id: string;
          day_of_week: number;
          restaurant_id: string;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          day_of_week?: number;
          restaurant_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_product_avail_product";
            columns: ["restaurant_id", "product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["restaurant_id", "id"];
          },
        ];
      };
      modifier_groups: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          min_selectable: number;
          max_selectable: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          min_selectable?: number;
          max_selectable?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          min_selectable?: number;
          max_selectable?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      modifiers: {
        Row: {
          id: string;
          restaurant_id: string;
          group_id: string;
          name: string;
          price_delta: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          group_id: string;
          name: string;
          price_delta?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          group_id?: string;
          name?: string;
          price_delta?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_modifiers_group";
            columns: ["restaurant_id", "group_id"];
            isOneToOne: false;
            referencedRelation: "modifier_groups";
            referencedColumns: ["restaurant_id", "id"];
          },
        ];
      };
      product_modifier_groups: {
        Row: {
          product_id: string;
          group_id: string;
          restaurant_id: string;
          created_at: string;
        };
        Insert: {
          product_id: string;
          group_id: string;
          restaurant_id: string;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          group_id?: string;
          restaurant_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          payload_before: Json | null;
          payload_after: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          payload_before?: Json | null;
          payload_after?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          payload_before?: Json | null;
          payload_after?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_create_category: {
        Args: { p_name: string; p_display_order?: number };
        Returns: string;
      };
      admin_update_category: {
        Args: {
          p_category_id: string;
          p_name: string;
          p_display_order: number;
        };
        Returns: void;
      };
      admin_reorder_categories: {
        Args: { p_category_ids: string[] };
        Returns: void;
      };
      admin_toggle_category_active: {
        Args: { p_category_id: string; p_is_active: boolean };
        Returns: void;
      };
      admin_create_product: {
        Args: {
          p_category_id: string;
          p_name: string;
          p_description: string | null;
          p_display_order?: number;
        };
        Returns: string;
      };
      admin_update_product: {
        Args: {
          p_product_id: string;
          p_name: string;
          p_description: string | null;
          p_display_order: number;
        };
        Returns: void;
      };
      admin_change_product_category: {
        Args: { p_product_id: string; p_new_category_id: string };
        Returns: void;
      };
      admin_reorder_products: {
        Args: { p_category_id: string; p_product_ids: string[] };
        Returns: void;
      };
      admin_toggle_product_active: {
        Args: { p_product_id: string; p_is_active: boolean };
        Returns: void;
      };
      admin_toggle_product_availability: {
        Args: { p_product_id: string; p_is_available: boolean };
        Returns: void;
      };
      admin_create_product_variant: {
        Args: {
          p_product_id: string;
          p_variant_name: string;
          p_price: number;
          p_display_order?: number;
        };
        Returns: string;
      };
      admin_update_product_variant: {
        Args: {
          p_variant_id: string;
          p_variant_name: string;
          p_display_order: number;
        };
        Returns: void;
      };
      admin_reorder_product_variants: {
        Args: { p_product_id: string; p_variant_ids: string[] };
        Returns: void;
      };
      admin_toggle_variant_active: {
        Args: { p_variant_id: string; p_is_active: boolean };
        Returns: void;
      };
      admin_toggle_variant_orderable: {
        Args: { p_variant_id: string; p_is_orderable: boolean };
        Returns: void;
      };
      admin_update_variant_price: {
        Args: { p_variant_id: string; p_new_price: number };
        Returns: void;
      };
      admin_confirm_validated_price: {
        Args: { p_variant_id: string; p_confirmed_price: number };
        Returns: void;
      };
      admin_set_product_availability_rules: {
        Args: { p_product_id: string; p_days: number[] };
        Returns: void;
      };
    };
    Enums: {
      staff_role_enum: "admin" | "cashier" | "waiter" | "printer_agent";
      table_status_enum:
        | "free"
        | "occupied"
        | "waiting_kitchen"
        | "served"
        | "waiting_payment";
      order_status_enum: "draft" | "open" | "closed" | "cancelled";
      order_stage_enum: "before_prep" | "after_prep";
      print_job_status_enum:
        | "pending"
        | "claimed"
        | "sent_unconfirmed"
        | "printed_assumed"
        | "printed_confirmed"
        | "failed"
        | "cancelled";
      inventory_movement_type_enum:
        | "initial_load"
        | "purchase_entry"
        | "recipe_consumption"
        | "cancellation_reversal"
        | "spoilage_waste"
        | "physical_count_adjustment";
      unit_measure_enum: "kg" | "g" | "l" | "ml" | "unit";
      payment_method_enum: "cash" | "yape" | "plin" | "card";
    };
    CompositeTypes: Record<string, never>;
  };
};
