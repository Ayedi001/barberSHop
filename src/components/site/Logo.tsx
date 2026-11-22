import { Scissors } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <div
      className={`relative grid place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-soft ${className}`}
    >
      <Scissors className="size-5 -rotate-45" />
    </div>
  );
}

export function Logo({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark" | "sidebar";
  className?: string;
}) {
  const isDarkOrSidebar = variant === "dark" || variant === "sidebar";

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}>
      <LogoMark />
      <div className="flex flex-col">
        <span
          className={`font-display text-lg font-extrabold tracking-tight ${
            isDarkOrSidebar ? "text-white" : "text-foreground"
          }`}
        >
          Barber<span className="text-amber-500">Craft</span>
        </span>
        <span
          className={`-mt-1 text-[10px] font-semibold uppercase tracking-widest ${
            isDarkOrSidebar ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          Barbershop & Coiffure
        </span>
      </div>
    </Link>
  );
}
