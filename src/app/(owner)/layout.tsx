import { OwnerBottomNav } from "@/components/shared/OwnerBottomNav";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#121416]">
      <main className="pb-20">{children}</main>
      <OwnerBottomNav />
    </div>
  );
}
