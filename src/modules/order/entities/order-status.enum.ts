export enum OrderStatus {
  PENDING = "pending", // Order confirmed but waiting for payment
  PAID = "paid", // Payment confirmed but order not yet processed
  PROCESSING = "processing", // Order is being prepared/fulfilled
  READY_TO_SHIP = "ready_to_ship", // Order is packed and waiting for shipping
  SHIPPED = "shipped", // Order handed to shipping provider
  COMPLETED = "completed", // Order completed (delivered and confirmed)
  CANCELLED = "cancelled", // Order cancelled
  REFUND_REQUESTED = "refund_requested", // Customer requested a refund
  REFUNDED = "refunded", // Order refunded
  PARTIALLY_REFUNDED = "partially_refunded", // Partial refund issued
}
