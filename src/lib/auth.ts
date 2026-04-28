import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getUserByEmail, createUser, getUserById } from "@/db/queries/users";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await getUserByEmail(parsed.data.email);
        if (!user) return null;

        // If user has a hashed password, verify it
        if (user.passwordHash) {
          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;
        }
        // Dev-only: seed users have no hash — allow any password in development
        else if (process.env.NODE_ENV === "production") {
          return null; // No hash in production = reject
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await getUserByEmail(user.email);
          if (!existingUser) {
            let role: "customer" | "owner" = "customer";
            try {
              const cookieStore = await cookies();
              const intendedRole = cookieStore.get("intended_role")?.value;
              if (intendedRole === "owner") {
                role = "owner";
              }
            } catch (e) {
              // cookies() might throw if called outside of request scope, though NextAuth callbacks are usually within request scope
            }

            await createUser({
              email: user.email,
              name: user.name ?? "Unknown",
              avatarUrl: user.image ?? undefined,
              role,
            });
          }
        } catch (err) {
          // Log but don't block sign-in — user can still authenticate
          console.error("[auth][signIn] DB error (non-fatal):", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, user object is populated
      if (user) {
        token.role = (user as { role?: string }).role ?? "customer";
      }

      // For Google sign-in: user.id is the Google provider ID, not our DB UUID.
      // Always resolve the real DB UUID via email.
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role ?? "customer";
          }
        } catch {
          // non-fatal
        }
      }

      // For credentials sign-in: user.id is already the DB UUID
      if (!token.id && user?.id) {
        token.id = user.id;
      }

      // Refresh role from DB if missing (e.g. after token rotation)
      if (token.id && !token.role) {
        const dbUser = await getUserById(token.id as string);
        token.role = dbUser?.role ?? "customer";
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
});

// ── NextAuth v5 type augmentation ──────────────────────────────────────────────
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
