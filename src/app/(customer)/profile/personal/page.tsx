import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resolveSessionUser, updateUser } from "@/db/queries/users";
import { revalidatePath } from "next/cache";
import { User, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Personal Information" };

export default async function PersonalInfoPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await resolveSessionUser(session.user);
  if (!user) redirect("/auth/login");

  async function updateProfile(formData: FormData) {
    "use server";
    const session2 = await auth();
    if (!session2?.user) return;

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const whatsapp = formData.get("whatsapp") as string;

    if (!name?.trim()) return;

    await updateUser(session2.user.id, {
      name: name.trim(),
      phone: phone?.trim() || undefined,
      whatsapp: whatsapp?.trim() || undefined,
    });

    revalidatePath("/profile");
    revalidatePath("/profile/personal");
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/profile" className="text-neutral-400"><ArrowLeft size={20} /></Link>
        <h1 className="text-white font-bold text-lg">Personal Information</h1>
      </header>

      <form action={updateProfile} className="px-4 space-y-4">
        {/* Name */}
        <div>
          <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
            FULL NAME
          </label>
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <User size={16} className="text-[#BFC8CA]" />
            <input
              name="name"
              defaultValue={user.name}
              placeholder="Your full name"
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* Email — read only */}
        <div>
          <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
            EMAIL (cannot change)
          </label>
          <div className="flex items-center gap-3 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 opacity-60">
            <Mail size={16} className="text-[#BFC8CA]" />
            <span className="text-neutral-400 text-sm">{user.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
            PHONE NUMBER
          </label>
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <Phone size={16} className="text-[#BFC8CA]" />
            <input
              name="phone"
              defaultValue={user.phone ?? ""}
              placeholder="+91 98765 43210"
              type="tel"
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
            WHATSAPP NUMBER
          </label>
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <span className="text-[#BFC8CA] text-sm">💬</span>
            <input
              name="whatsapp"
              defaultValue={user.whatsapp ?? ""}
              placeholder="+91 98765 43210"
              type="tel"
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-2xl transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
