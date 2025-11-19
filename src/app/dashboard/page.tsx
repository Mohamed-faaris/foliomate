"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { data: session, isPending, error } = authClient.useSession();
    const router = useRouter();

    const signOut = async () => {
        await authClient.signOut();
        router.push("/sign-in");
    };

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!session) {
        router.push("/sign-in");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <button
                        onClick={signOut}
                        className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Sign Out
                    </button>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
                    <p className="text-gray-600">Email: {session.user.email}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-bold">Portfolio Summary</h3>
                        <p className="text-gray-500">Coming soon...</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-bold">Recent Transactions</h3>
                        <p className="text-gray-500">Coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
