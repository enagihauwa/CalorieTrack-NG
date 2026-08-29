"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { loginSchema, signUpFormSchema } from "@/lib/validation/auth";

export type AuthActionState = { error?: string } | undefined;

// TICKET-006: sign-up. Creates the User row, then signs the new user in
// immediately and redirects to /dashboard — the (app) layout/pages
// redirect on to /profile on their own if no Profile exists yet
// (TICKET-008), so this doesn't need to know that itself.
export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed — try logging in." };
    }
    throw error; // rethrow the redirect() Next.js uses internally on success
  }
}

// TICKET-007: login. redirectTo sends a completed profile straight to
// the Dashboard and an incomplete one to onboarding, both via the
// (app) route pages' own server-side checks — this action only needs
// to know "go into the app."
export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Same message for "no such user" and "wrong password" — no user
      // enumeration, per TICKET-007's acceptance criterion.
      return { error: "Incorrect email or password." };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
