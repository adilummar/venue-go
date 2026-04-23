import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "confirmed" | "processing" | "completed" | "cancelled" | "live" | "review" | "curated" | "default";
  className?: string;
}

const VARIANTS: Record<string, string> = {
  confirmed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  processing: "bg-neutral-700/50 text-neutral-300 border border-neutral-600",
  completed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  live: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  review: "bg-neutral-700 text-neutral-300 border border-neutral-600",
  curated: "bg-amber-500 text-black",
  default: "bg-neutral-700 text-neutral-300",
};

export const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
        VARIANTS[variant],
        className
      )}
    >
      {(variant === "confirmed" || variant === "completed") && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
};
