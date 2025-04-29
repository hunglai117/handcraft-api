import { registerAs } from "@nestjs/config";

export default registerAs("vnpay", () => ({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_SECURE_SECRET,
  vnpayHost: process.env.VNP_HOST || "https://sandbox.vnpayment.vn",
  returnUrl: process.env.VNP_RETURN_URL || "http://localhost:3000/vnpay-return",
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html", // Endpoint thanh toán
    queryDrRefundEndpoint: "merchant_webapi/api/transaction", // Endpoint tra cứu & hoàn tiền
    getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list", // Endpoint lấy danh sách ngân hàng
  },
}));
