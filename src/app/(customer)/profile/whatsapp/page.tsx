import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resolveSessionUser, updateUser } from "@/db/queries/users";
import { revalidatePath } from "next/cache";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "WhatsApp Business Link" };

export default async function WhatsAppSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await resolveSessionUser(session.user);
  if (!user) redirect("/auth/login");

  async function saveWhatsApp(formData: FormData) {
    "use server";
    const session2 = await auth();
    if (!session2?.user) return;
    const whatsapp = (formData.get("whatsapp") as string)?.trim();
    await updateUser(session2.user.id, { whatsapp: whatsapp || undefined });
    revalidatePath("/profile");
    revalidatePath("/profile/whatsapp");
  }

  const waNumber = user.whatsapp ?? "";
  const previewLink = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g, "")}`
    : null;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/profile" className="text-neutral-400"><ArrowLeft size={20} /></Link>
        <h1 className="text-white font-bold text-lg">WhatsApp Business Link</h1>
      </header>

      <div className="px-4 space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-amber-400 font-semibold text-sm mb-1">💬 Direct Booking Gateway</p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            When customers send an inquiry, they&apos;ll be connected to this WhatsApp number directly. Make sure this is your active business number.
          </p>
        </div>

        <form action={saveWhatsApp} className="space-y-4">
          <div>
            <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
              WHATSAPP NUMBER (with country code)
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
              <span className="text-neutral-400 text-sm font-mono">+91</span>
              <input
                name="whatsapp"
                defaultValue={waNumber.replace("+91", "").trim()}
                placeholder="98765 43210"
                type="tel"
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600"
              />
            </div>
          </div>

          {previewLink && (
            <a
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-400 text-sm"
            >
              <span>✓</span>
              <span>Test your link: {previewLink}</span>
            </a>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-2xl transition-colors"
          >
            Save WhatsApp Number
          </button>
        </form>
      </div>
    </div>
  );
}
