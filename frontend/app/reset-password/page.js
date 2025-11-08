"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "../../context/AppContext";
import Link from "next/link";

function ResetPasswordInner() {
  const { resetPassword, requestPasswordReset } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState("request"); // 'request' or 'reset'
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Detect token and email from query params (client-side only)
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
      setStep("reset");
    }
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await requestPasswordReset(email);
      setSuccess(
        "If an account exists, a password reset email has been sent."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, token, newPassword);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-semibold">
        {step === "request" ? "Request Password Reset" : "Reset Password"}
      </h1>

      {step === "request" ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <p className="text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
          <input
            className="w-full px-3 py-2 rounded border border-white/10 bg-white text-black"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-red-400">{error}</p>}
          {success && <p className="text-green-400">{success}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-emerald-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            className="w-full px-3 py-2 rounded border border-white/10 bg-white text-black"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-3 py-2 rounded border border-white/10 bg-white text-black"
            type="text"
            placeholder="Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <input
            className="w-full px-3 py-2 rounded border border-white/10 bg-white text-black"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            className="w-full px-3 py-2 rounded border border-white/10 bg-white text-black"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-400">{error}</p>}
          {success && <p className="text-green-400">{success}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-sm text-emerald-400 hover:underline"
            >
              Request New Link
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading password reset form...</p>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
