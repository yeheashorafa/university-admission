export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "card" | "bank_transfer" | "cash_office";

export const paymentMock = {
  applicationNo: "APP-2026-8932",
  studentName: "Ahmed Mohammad Hassan",
  program: "Software Engineering",
  faculty: "Faculty of Information Technology",
  status: "pending" as PaymentStatus,

  invoice: {
    invoiceNo: "INV-2026-4418",
    issueDate: "October 18, 2026",
    dueDate: "October 25, 2026",
    currency: "USD",
    subtotal: 45,
    serviceFee: 2,
    total: 47,
  },

  items: [
    {
      id: "admission-fee",
      title: "Admission Application Fee",
      description: "Required fee to complete the admission process.",
      amount: 45,
    },
    {
      id: "service-fee",
      title: "Online Payment Service Fee",
      description: "Processing fee for digital payment methods.",
      amount: 2,
    },
  ],
};

export const paymentMethodsMock = [
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Pay securely using Visa or MasterCard.",
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    description: "Transfer the fee and upload the transfer receipt.",
  },
  {
    id: "cash_office",
    title: "University Finance Office",
    description: "Pay directly at the university finance office.",
  },
] satisfies {
  id: PaymentMethod;
  title: string;
  description: string;
}[];