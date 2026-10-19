"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login, type LoginState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="card relative w-full max-w-sm p-7">
      <p className="font-heading text-2xl font-extrabold">
        DC<span className="text-accent">.</span>
      </p>
      <h1 className="mt-4 text-xl font-semibold">Admin sign in</h1>
      <p className="mt-1 text-sm text-body">Edit the content of your portfolio.</p>

      <label htmlFor="password" className="mt-6 mb-2 block text-sm font-medium">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />

      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-accent px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        <Lock className="w-4 h-4" /> {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
