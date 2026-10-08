import apiFetch from "@/lib/apiClient";
import type {
  CheckoutSessionApiResponse,
  CheckoutSessionData,
  InvoicesApiResponse,
  PaymentsApiResponse,
  StudentInvoice,
  StudentPayment,
  VerifyPaymentApiResponse,
  VerifyPaymentResult,
} from "@/types/student-payment";
import { extractErrorMessage } from "./student-profile.service";

export const initialMockInvoices: StudentInvoice[] = [
  {
    id: "inv-2026-001",
    invoiceNo: "INV-2026-001",
    title: "Semester 6 Tuition & Course Registration",
    amount: 15000,
    dueDate: "2026-10-31",
    status: "PENDING",
    createdAt: "2026-09-15T08:00:00.000Z",
  },
  {
    id: "inv-2026-002",
    invoiceNo: "INV-2026-002",
    title: "Computer Systems Lab & Facilities Fee",
    amount: 3500,
    dueDate: "2026-11-15",
    status: "PENDING",
    createdAt: "2026-09-18T10:00:00.000Z",
  },
  {
    id: "inv-2026-003",
    invoiceNo: "INV-2026-003",
    title: "Semester 5 Final Tuition Fee",
    amount: 15000,
    dueDate: "2026-05-30",
    status: "PAID",
    createdAt: "2026-04-10T08:00:00.000Z",
  },
  {
    id: "inv-2026-004",
    invoiceNo: "INV-2026-004",
    title: "Library & Student Activities Development",
    amount: 2000,
    dueDate: "2026-05-15",
    status: "PAID",
    createdAt: "2026-04-12T09:00:00.000Z",
  },
];

export const initialMockPayments: StudentPayment[] = [
  {
    id: "pay-101",
    invoiceId: "inv-2026-003",
    invoiceNo: "INV-2026-003",
    amount: 15000,
    method: "ONLINE (Stripe)",
    transactionId: "cs_test_live_a18849bcf",
    status: "SUCCESS",
    createdAt: "2026-05-20T14:30:00.000Z",
    date: "20 May 2026",
  },
  {
    id: "pay-102",
    invoiceId: "inv-2026-004",
    invoiceNo: "INV-2026-004",
    amount: 2000,
    method: "ONLINE (Stripe)",
    transactionId: "cs_test_live_e7721a990",
    status: "SUCCESS",
    createdAt: "2026-05-14T11:15:00.000Z",
    date: "14 May 2026",
  },
];

/**
 * GET /api/v1/student/me/invoices
 * Returns all fee invoices created for the student.
 */
export async function fetchStudentInvoices(): Promise<StudentInvoice[]> {
  const response = await apiFetch<InvoicesApiResponse>(
    "/api/v1/student/me/invoices",
  );
  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to load invoices");
}

/**
 * GET /api/v1/student/me/payments
 * Returns all payment history records for the student.
 */
export async function fetchStudentPayments(): Promise<StudentPayment[]> {
  const response = await apiFetch<PaymentsApiResponse>(
    "/api/v1/student/me/payments",
  );
  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to load payments history");
}

/**
 * POST /api/v1/student/me/payments/checkout
 * Creates a Stripe hosted checkout session for paying an invoice.
 */
export async function createStripeCheckoutSession(
  invoiceId: string,
): Promise<CheckoutSessionData> {
  const response = await apiFetch<CheckoutSessionApiResponse>(
    "/api/v1/student/me/payments/checkout",
    {
      method: "POST",
      body: { invoiceId },
    },
  );

  if (response?.data) {
    return response.data;
  }
  throw new Error(
    response?.message || "Failed to create Stripe checkout session",
  );
}

/**
 * POST /api/v1/student/me/invoices/:id/pay
 * Shortcut to create a Stripe checkout session directly from the invoice URL.
 */
export async function createDirectInvoiceCheckout(
  invoiceId: string,
): Promise<CheckoutSessionData> {
  const response = await apiFetch<CheckoutSessionApiResponse>(
    `/api/v1/student/me/invoices/${encodeURIComponent(invoiceId)}/pay`,
    {
      method: "POST",
    },
  );

  if (response?.data) {
    return response.data;
  }
  throw new Error(
    response?.message || "Failed to create invoice checkout session",
  );
}

/**
 * POST /api/v1/student/me/payments/verify
 * Manually verify a Stripe payment after checkout.
 */
export async function verifyStripePayment(
  sessionId: string,
): Promise<VerifyPaymentResult> {
  const response = await apiFetch<VerifyPaymentApiResponse>(
    "/api/v1/student/me/payments/verify",
    {
      method: "POST",
      body: { sessionId },
    },
  );

  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Payment verification failed");
}

export { extractErrorMessage };
