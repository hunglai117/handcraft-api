import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger, UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { OrderDto } from "../dto/order.dto";
import { WsJwtGuard } from "../guards/ws-jwt.guard";

@WebSocketGateway({
  cors: {
    origin: "*", // In production, you should restrict this to your frontend domain
  },
  namespace: "orders",
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("OrderGateway");

  afterInit() {
    this.logger.log("Order WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Optional: Authenticate client here using token from handshake
    const token = client.handshake.auth?.token;
    if (token) {
      // You could verify the JWT token here or in a guard
      // and store user information in the client object
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up any resources associated with this client
  }

  /**
   * Allow clients to join a room for a specific order
   */
  @SubscribeMessage("joinOrderRoom")
  handleJoinOrderRoom(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order-${data.orderId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true, room };
  }

  /**
   * Allow clients to join a room for a specific user's orders
   */
  @SubscribeMessage("joinUserRoom")
  @UseGuards(WsJwtGuard)
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `user-${data.userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true, room };
  }

  /**
   * Notify clients about order status updates
   * @param order Updated order data
   */
  notifyOrderStatusUpdate(order: OrderDto) {
    this.logger.log(`Broadcasting order update for order ID: ${order.id}`);

    // Broadcast to all clients
    this.server.emit("orderStatusUpdated", order);

    // Also emit to a specific room for this order
    // Clients can join this room if they're only interested in updates for a specific order
    this.server.to(`order-${order.id}`).emit("orderStatusUpdated", order);
  }

  /**
   * Notify a specific user about their order status updates
   * @param userId User ID to notify
   * @param order Updated order data
   */
  notifyUserOrderUpdate(userId: string, order: OrderDto) {
    this.logger.log(
      `Notifying user ${userId} about order update for order ID: ${order.id}`,
    );

    // Emit to a specific room for this user
    // Client should join this room after authentication
    this.server.to(`user-${userId}`).emit("orderStatusUpdated", order);
  }
}
