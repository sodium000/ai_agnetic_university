export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED" | "OVERDUE";
export type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface StudentInvoice {
  id: string;
  invoiceNo: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  title?: string;
  createdAt?: string;
}

export interface StudentPayment {
  id: string;
  invoiceId?: string;
  invoiceNo?: string;
  amount: number;
  method: string;
  transactionId?: string;
  status: PaymentStatus;
  createdAt?: string;
  date?: string;
}

export interface CheckoutSessionData {
  checkoutUrl: string;
  sessionId: string;
}

export interface CheckoutSessionApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: CheckoutSessionData;
}

export interface InvoicesApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: StudentInvoice[];
}

export interface PaymentsApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: StudentPayment[];
}

export interface VerifyPaymentResult {
  payment: {
    id: string;
    amount: number;
    method: string;
    status: PaymentStatus;
    transactionId?: string;
  };
  invoiceStatus: InvoiceStatus;
}

export interface VerifyPaymentApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: VerifyPaymentResult;
}
