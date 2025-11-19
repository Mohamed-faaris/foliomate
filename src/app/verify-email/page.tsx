"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await authClient.verifyEmail(
          {
            query: {
              token,
            },
          },
          {
            onSuccess: () => {
              setStatus("success");
              toast.success("Email verified successfully!");
            },
            onError: (ctx) => {
              setStatus("error");
              toast.error(ctx.error.message);
            },
          },
        );
      } catch {
        setStatus("error");
      }
    };

    void verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Verifying your email address...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {status === "verifying" && (
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          )}
          {status === "success" && (
            <div className="text-center">
              <p className="mb-4 font-medium text-green-600">
                Your email has been verified!
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="text-center">
              <p className="mb-4 font-medium text-red-600">
                Verification failed. Invalid or expired token.
              </p>
              <Button variant="outline" onClick={() => router.push("/sign-in")}>
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
