// PENDING_BACKEND_API: Backend payment endpoints are not exposed yet.
// Keeping mock fallback mode for payment features until backend endpoints are integrated.

import { apiClient, extractResource } from "@/lib/api/client";

export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentInvoice = {
  id: string;
  invoiceNo: string;
  applicationNo: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
};

export type CreatePaymentPayload = {
  method: "card" | "bank_transfer" | "cash_office";
};

export type CreatePaymentResponse = {
  paymentUrl?: string;
  invoice: PaymentInvoice;
};

export async function getMyInvoice(): Promise<PaymentInvoice> {
  const response = await apiClient.get<PaymentInvoice | { data: PaymentInvoice }>(
    "/student/payment/invoice"
  );
  return extractResource<PaymentInvoice>(response.data);
}

export async function createPayment(payload: CreatePaymentPayload): Promise<CreatePaymentResponse> {
  const response = await apiClient.post<CreatePaymentResponse | { data: CreatePaymentResponse }>(
    "/student/payment",
    payload
  );
  return extractResource<CreatePaymentResponse>(response.data);
}

export async function uploadBankTransferReceipt(file: File): Promise<PaymentInvoice> {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await apiClient.post<PaymentInvoice | { data: PaymentInvoice }>(
    "/student/payment/bank-transfer-receipt",
    formData
  );
  return extractResource<PaymentInvoice>(response.data);
}