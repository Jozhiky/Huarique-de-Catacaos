/**
 * @huarique/domain
 * Entidades y tipos de dominio estrictos para El Huarique de Catacaos
 */

export type StaffRole = 'admin' | 'cashier' | 'waiter' | 'printer_agent';

export type TableStatus =
  | 'free'
  | 'occupied'
  | 'waiting_kitchen'
  | 'served'
  | 'waiting_payment'
  | 'blocked';

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'in_preparation'
  | 'served'
  | 'payment_pending'
  | 'paid'
  | 'cancelled';

export type PrintJobStatus =
  | 'pending'
  | 'claimed'
  | 'sent_unconfirmed'
  | 'printed_assumed'
  | 'printed_confirmed'
  | 'failed'
  | 'cancelled';

export type PrintJobType = 'new_order' | 'additional_items' | 'cancellation';

export type PaymentMethod = 'cash' | 'yape' | 'plin' | 'card' | 'mixed';

export interface UserProfile {
  userId: string;
  restaurantId: string;
  staffCode?: string;
  staffRole: StaffRole;
  fullName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiningRoom {
  id: string;
  restaurantId: string;
  name: string;
  orderIndex: number;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  diningRoomId: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  assignedWaiterId?: string;
  assignedWaiterName?: string;
  occupiedSince?: string;
  currentTotalPen?: number;
}

export interface MenuItemVariant {
  id: string;
  name: string; // 'Personal', 'Media fuente', 'Fuente'
  pricePen: number;
  isAvailable: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  variants: MenuItemVariant[];
  isAvailable: boolean;
  availableDays?: number[]; // 0=Domingo, 1=Lunes, ...
  needsValidation?: boolean; // Para platos marcados con VALIDAR
}

export interface MenuCategory {
  id: string;
  name: string;
  orderIndex: number;
  itemsCount?: number;
}

export interface OrderItemModifier {
  modifierId: string;
  nameSnapshot: string;
  priceDeltaSnapshot: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  orderRevisionId: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  observations?: string;
  modifiers: OrderItemModifier[];
  status: 'pending' | 'in_kitchen' | 'served' | 'cancelled';
  subtotalPen: number;
}

export interface OrderRevision {
  id: string;
  orderId: string;
  revisionNumber: number;
  createdAt: string;
  submittedByUserId: string;
  itemsCount: number;
  subtotalPen: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  diningRoomId: string;
  tableNumber: number;
  diningRoomName: string;
  waiterId: string;
  waiterName: string;
  status: OrderStatus;
  revisionsCount: number;
  totalPen: number;
  clientSubmissionId: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface PrintJob {
  id: string;
  restaurantId: string;
  orderId: string;
  orderRevisionId: string;
  jobType: PrintJobType;
  destinationPrinterId: string;
  status: PrintJobStatus;
  clientSubmissionId: string;
  claimToken?: string;
  claimedBy?: string;
  claimedAt?: string;
  claimExpiresAt?: string;
  attemptCount: number;
  nextAttemptAt?: string;
  lastError?: string;
  printedAt?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
