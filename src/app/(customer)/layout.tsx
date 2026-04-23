import { BottomNav } from "@/components/shared/BottomNav";
import { BottomNavSpacer } from "@/components/shared/BottomNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#121416]">
      <main>{children}</main>
      <BottomNavSpacer />
      <BottomNav />
    </div>
  );
}
