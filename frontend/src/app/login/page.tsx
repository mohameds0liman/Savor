"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import apiClient from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import AuthLayout from "@/components/auth/AuthLayout";
import type { AuthResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const infoMessage = searchParams.get("message");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await apiClient.post<ApiResponse<AuthResponse>>("/login", {
        email,
        password,
      });
      login(res.data.data);
      router.push("/");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your saved recipe box and personal kitchen."
    >
      {infoMessage && (
        <p className="mb-6 rounded-lg border border-primary-container/40 bg-primary-fixed/40 px-4 py-3 font-body text-sm text-on-primary-fixed-variant">
          {infoMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="mt-2 w-full">
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center font-body text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

function Login() {
  return (
    <main className="min-h-screen bg-surface">
      {/* useSearchParams requires a Suspense boundary during static export
          (Next.js App Router constraint) — see the ?message= redirect from
          Profile's change-password flow (memory.md M4). */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

export default Login;
