// import {
//   Controller,
//   Post,
//   Body,
//   Param,
//   Get,
//   UseGuards,
//   Req,
//   BadRequestException,
// } from "@nestjs/common";
// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from "@nestjs/swagger";
// import { PaymentService } from "../services/payment.service";
// import { ProcessPaymentDto } from "../dto/process-payment.dto";
// import { JwtAuthGuard } from "../../auth/jwt-auth.guard";

// @ApiTags("Payments")
// @Controller("payments")
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
// export class PaymentController {
//   constructor(private readonly paymentService: PaymentService) {}

//   @Post("orders/:orderId")
//   @ApiOperation({ summary: "Process a payment for an order" })
//   @ApiResponse({ status: 201, description: "Payment processed successfully" })
//   async processPayment(
//     @Param("orderId") orderId: string,
//     @Body() processPaymentDto: ProcessPaymentDto,
//     @Req() req,
//   ) {
//     // In a real application, we would verify that the user owns the order
//     // For simplicity, we're skipping that check in this example

//     try {
//       const result = await this.paymentService.processPayment(
//         orderId,
//         processPaymentDto,
//       );
//       return result;
//     } catch (error) {
//       throw new BadRequestException(
//         `Payment processing failed: ${error.message}`,
//       );
//     }
//   }

//   @Get("orders/:orderId/transactions")
//   @ApiOperation({ summary: "Get payment transactions for an order" })
//   @ApiResponse({ status: 200, description: "Returns payment transactions" })
//   async getOrderTransactions(@Param("orderId") orderId: string) {
//     return this.paymentService.getTransactionsByOrderId(orderId);
//   }

//   @Get("transactions/:id")
//   @ApiOperation({ summary: "Get a payment transaction by ID" })
//   @ApiResponse({ status: 200, description: "Returns the transaction details" })
//   async getTransaction(@Param("id") id: string) {
//     return this.paymentService.getTransaction(id);
//   }
// }
