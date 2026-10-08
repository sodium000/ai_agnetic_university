import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccessCard } from "@/components/student/payments/payment-success-card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payment Successful | Student Portal",
  description: "Your tuition fee payment was processed successfully.",
};

export default function StudentPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <Skeleton className="h-96 w-full max-w-lg rounded-2xl" />
        </div>
      }
    >
      <PaymentSuccessCard />
    </Suspense>
  );
}
