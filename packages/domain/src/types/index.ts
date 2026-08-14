/**
 * @huarique/domain
 * Entidades y tipos de dominio estrictos para El Huarique de Catacaos
 */

export * from "./database";

export type StaffRole = "admin" | "cashier" | "waiter" | "printer_agent";

export type TableStatus =
  | "free"
  | "occupied"
  | "waiting_kitchen"
  | "served"
  | "waiting_payment"
  | "blocked";

export type OrderStatus = "draft" | "open" | "closed" | "cancelled";

export type PrintJobStatus =
  | "pending"
  | "claimed"
  | "sent_unconfirmed"
  | "printed_assumed"
  | "printed_confirmed"
  | "failed"
  | "cancelled";

export type PrintJobType = "order" | "additional" | "bill" | "cancel";

export type PaymentMethod = "cash" | "yape" | "plin" | "card";

export interface UserProfile {
  id: string;
  restaurantId: string;
  userId: string;
  firstName: string;
  lastName: string;
  staffCode?: string;
  staffRole: StaffRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiningRoom {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  diningRoomId: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  posX: number;
  posY: number;
}

export interface MenuItemVariant {
  id: string;
  restaurantId: string;
  productId: string;
  variantName: string;
  price: number;
  priceNeedsValidation: boolean;
  isOrderable: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
  variants: MenuItemVariant[];
  availableDays?: number[]; // 0=Domingo, 1=Lunes, ...
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  itemsCount?: number;
}

export interface PrintJob {
  id: string;
  restaurantId: string;
  orderRevisionId: string;
  jobType: string;
  destinationPrinterId: string;
  claimedBy?: string | null;
  claimToken?: string | null;
  claimExpiresAt?: string | null;
  status: PrintJobStatus;
  attemptCount: number;
  nextAttemptAt?: string | null;
  lastError?: string | null;
  sentAt?: string | null;
  printedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
}
