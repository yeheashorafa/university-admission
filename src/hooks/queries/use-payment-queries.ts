"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  createPayment,
  getMyInvoice,
  uploadBankTransferReceipt,
  type CreatePaymentPayload,
} from "@/services/payment.service";

// PENDING_BACKEND_API: Disabled until backend payment endpoints are confirmed.
export function useMyInvoiceQuery() {
  return useQuery({
    queryKey: queryKeys.payment.invoice,
    queryFn: getMyInvoice,
    enabled: false,
    retry: false,
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payment.invoice,
      });
    },
  });
}

export function useUploadBankTransferReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadBankTransferReceipt(file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payment.invoice,
      });
    },
  });
}