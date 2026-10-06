import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[92vh] overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.12)_1px,transparent_1px)] bg-size-[3.5rem_3.5rem] mask-[radial-gradient(ellipse_75%_60%_at_50%_40%,#000_60%,transparent_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/4 z-0 h-125 w-175 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 z-0 h-100 w-100 rounded-full bg-primary/10 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background via-background/40 to-transparent z-0"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
