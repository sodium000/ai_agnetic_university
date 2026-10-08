import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancelCard } from "@/components/student/payments/payment-cancel-card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payment Cancelled | Student Portal",
  description:
    "The Stripe checkout session was cancelled. No charges were incurred.",
};

export default function StudentPaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <Skeleton className="h-96 w-full max-w-lg rounded-2xl" />
        </div>
      }
    >
      <PaymentCancelCard />
    </Suspense>
  );
}
