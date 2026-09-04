"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors backend CreateUserSchema exactly (memory.md §2.7):
// name 2-50 chars, valid email, password 8-100 chars.
function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FieldErrors {
  const errors: FieldErrors = {};

  if (name.trim().length < 2 || name.trim().length > 50) {
    errors.name = "Name must be between 2 and 50 characters.";
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (password.length < 8 || password.length > 100) {
    errors.password = "Password must be between 8 and 100 characters.";
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const errors = validate(name, email, password, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post<ApiResponse<AuthResponse>>("/signup", {
        name: name.trim(),
        email,
        password,
      });
      login(res.data.data);
      router.push("/");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerError(axiosErr.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <AuthLayout
        title="Create an account"
        subtitle="Join our community of home cooks to save and share handcrafted recipes."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Your name"
            type="text"
            placeholder="Mohamed Ali"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="mohamed@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            required
          />
          {serverError && <ErrorMessage message={serverError} />}
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="mt-2 w-full">
            Create Account
          </Button>
        </form>
        <p className="mt-6 text-center font-body text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    </main>
  );
}

export default Register;
