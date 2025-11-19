"use client";

import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const signUp = async () => {
    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onSuccess: () => {
          toast.success(
            "Account created! Please check your email to verify your account.",
          );
          router.push("/sign-in");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={signUp}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
