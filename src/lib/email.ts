import { api } from "@/lib/api";

export const sendLoginAlert = (email: string, userName: string) => {
  const time = new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });
  return api.post("/email/login-alert", { email, userName, time })
    .catch((err) => console.error("Login alert email failed:", err));
};

export const sendOrderConfirm = (
  email: string,
  userName: string,
  orderId: string,
  totalAmount: number
) => {
  return api.post("/email/order-confirm", {
    email,
    userName,
    orderId,
    totalAmount,
  }).catch((err) => console.error("Order confirm email failed:", err));
};