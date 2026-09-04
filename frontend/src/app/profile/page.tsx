"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/common/Toast";
import apiClient from "@/lib/axios";
import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";
import { HiOutlineKey, HiOutlineTrash, HiOutlineUser } from "react-icons/hi2";

function Profile() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameServerError, setNameServerError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});
  const [passwordServerError, setPasswordServerError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get<ApiResponse<User>>("/user/me")
      .then((response) => setUser(response.data.data))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  function startEditingName() {
    setNameInput(user?.name ?? "");
    setNameError("");
    setNameServerError("");
    setEditingName(true);
  }

  async function handleSaveName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameServerError("");
    const trimmed = nameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      setNameError("Name must be between 2 and 50 characters.");
      return;
    }
    setNameError("");
    setIsSavingName(true);
    try {
      const res = await apiClient.patch<ApiResponse<User>>("/user", { name: trimmed });
      setUser(res.data.data);
      updateUser({ name: res.data.data.name });
      showToast("Name updated", "success");
      setEditingName(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setNameServerError(axiosErr.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordServerError("");

    const errors: typeof passwordFieldErrors = {};
    if (oldPassword.length < 8 || oldPassword.length > 100) {
      errors.oldPassword = "Enter your current password (8–100 characters).";
    }
    if (newPassword.length < 8 || newPassword.length > 100) {
      errors.newPassword = "New password must be between 8 and 100 characters.";
    }
    if (confirmNewPassword !== newPassword) {
      errors.confirmNewPassword = "Passwords do not match.";
    }
    setPasswordFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsChangingPassword(true);
    try {
      await apiClient.put("/user/password", { oldPassword, newPassword });
      // Backend invalidates ALL sessions on password change (memory.md
      // §2.6) — there is no re-issued token, so the only correct UX is a
      // forced logout + redirect to /login.
      logout();
      router.push("/login?message=Password changed. Please log in again.");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
      const raw = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message;
      const friendly = raw?.includes("Old password is incorrect")
        ? "Old password is incorrect."
        : raw ?? "Something went wrong";
      setPasswordServerError(friendly);
    } finally {
      setIsChangingPassword(false);
    }
  }

  function handleDeleteAccount() {
    setIsDeletingAccount(true);
    apiClient
      .delete("/user")
      .then(() => {
        logout();
        router.push("/");
      })
      .catch(() => {
        showToast("Failed to delete account", "error");
        setIsDeletingAccount(false);
        setDeleteModalOpen(false);
      });
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <div className="mb-8 border-b border-linen-border pb-6">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Chef Profile
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Account Settings
          </h1>
        </div>

        {authLoading || loading ? (
          <Loader label="Loading profile…" />
        ) : !user ? (
          <p className="font-body text-ink-muted">User not found.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Identity Card */}
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Avatar name={user.name} image={user.image} size={88} />
                <div className="flex-1">
                  {editingName ? (
                    <form onSubmit={handleSaveName} className="flex flex-col gap-3">
                      <Input
                        id="editName"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        error={nameError}
                        autoFocus
                      />
                      {nameServerError && <ErrorMessage message={nameServerError} />}
                      <div className="flex gap-2">
                        <Button type="submit" variant="primary" isLoading={isSavingName}>
                          Save Name
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setEditingName(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-display text-2xl font-bold text-ink">{user.name}</h2>
                        <button
                          type="button"
                          aria-label="Edit name"
                          onClick={startEditingName}
                          className="font-body text-xs font-semibold uppercase text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-1 font-body text-sm text-ink-muted">{user.email}</p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-0.5 font-body text-xs font-semibold uppercase tracking-wider text-ink">
                        <HiOutlineUser className="text-outline" /> {user.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Change Password Card */}
            <Card className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                    <HiOutlineKey className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">Security & Password</h3>
                    <p className="font-body text-xs text-ink-muted">Manage your login credentials</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                >
                  {showPasswordForm ? "Hide" : "Change Password"}
                </Button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="mt-6 border-t border-linen-border pt-6 flex flex-col gap-4">
                  <Input
                    id="oldPassword"
                    label="Current Password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    error={passwordFieldErrors.oldPassword}
                    required
                  />
                  <Input
                    id="newPassword"
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={passwordFieldErrors.newPassword}
                    required
                  />
                  <Input
                    id="confirmNewPassword"
                    label="Confirm New Password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    error={passwordFieldErrors.confirmNewPassword}
                    required
                  />
                  {passwordServerError && <ErrorMessage message={passwordServerError} />}
                  <p className="font-body text-xs text-ink-muted">
                    Note: Changing your password will log you out of all devices for security.
                  </p>
                  <Button type="submit" variant="primary" isLoading={isChangingPassword} className="self-start">
                    Update Password
                  </Button>
                </form>
              )}
            </Card>

            {/* Danger Zone */}
            <Card className="border-error/20 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-container/50 text-error">
                    <HiOutlineTrash className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">Delete Account</h3>
                    <p className="font-body text-xs text-ink-muted">Permanently remove your account and recipes</p>
                  </div>
                </div>
                <Button variant="danger" type="button" onClick={() => setDeleteModalOpen(true)}>
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete your account?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeletingAccount} onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </>
        }
      >
        This will permanently delete your profile and all recipes you have published. This action
        cannot be undone.
      </Modal>
      <Footer />
    </main>
  );
}

export default Profile;
