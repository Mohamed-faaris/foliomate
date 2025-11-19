"use client";

import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const signIn = async () => {
    const { error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      setError(error.message ?? "An error occurred");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
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
          onClick={signIn}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Sign In
        </button>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
