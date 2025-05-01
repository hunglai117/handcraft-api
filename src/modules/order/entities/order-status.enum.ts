export enum OrderStatus {
  PENDING = "pending", // Order confirmed but waiting for payment
  PAID = "paid", // Payment confirmed but order not yet processed
  PROCESSING = "processing", // Order is being prepared/fulfilled
  READY_TO_SHIP = "ready_to_ship", // Order is packed and waiting for shipping
  ON_HOLD = "on_hold", // Order placed on hold (inventory/fraud check issues)
  SHIPPED = "shipped", // Order handed to shipping provider
  OUT_FOR_DELIVERY = "out_for_delivery", // Order is with delivery agent
  COMPLETED = "completed", // Order fully completed including post-delivery processes
  CANCELLED = "cancelled", // Order cancelled
  REFUND_REQUESTED = "refund_requested", // Customer requested a refund
  REFUNDED = "refunded", // Order refunded
  PARTIALLY_REFUNDED = "partially_refunded", // Partial refund issued
}
