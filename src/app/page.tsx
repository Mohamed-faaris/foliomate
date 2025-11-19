import Link from "next/link";
import { getSession } from "~/server/better-auth/server";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#1a1b26] to-[#15162c] text-white">
      {/* Navbar */}
      <nav className="container mx-auto flex items-center justify-between p-6">
        <div className="text-2xl font-bold tracking-tighter">
          <span className="text-blue-400">Folio</span>mate
        </div>
        <div className="flex gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-500 px-6 py-2 font-semibold text-white transition hover:bg-blue-600"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-6 py-2 font-semibold text-white transition hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-blue-500 px-6 py-2 font-semibold text-white transition hover:bg-blue-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Master Your <span className="text-blue-400">Portfolio</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl">
          Real-time stock tracking, virtual trading, and powerful portfolio
          management tools. Experience the future of personal finance with
          Foliomate.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href={session ? "/dashboard" : "/sign-up"}
            className="rounded-full bg-blue-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-600"
          >
            {session ? "Go to Dashboard" : "Start Trading Now"}
          </Link>
          <Link
            href="#features"
            className="rounded-full bg-white/10 px-8 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-black/20 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Foliomate?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-6 transition hover:bg-white/10">
              <div className="mb-4 text-4xl">📈</div>
              <h3 className="mb-2 text-xl font-bold">Real-Time Data</h3>
              <p className="text-gray-400">
                Get up-to-the-minute stock prices and market data powered by
                Alpha Vantage.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-6 transition hover:bg-white/10">
              <div className="mb-4 text-4xl">💼</div>
              <h3 className="mb-2 text-xl font-bold">Portfolio Tracking</h3>
              <p className="text-gray-400">
                Monitor your holdings, track performance, and manage your
                virtual cash.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-6 transition hover:bg-white/10">
              <div className="mb-4 text-4xl">⚡</div>
              <h3 className="mb-2 text-xl font-bold">Instant Execution</h3>
              <p className="text-gray-400">
                Buy and sell stocks instantly with our seamless trading
                interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Foliomate. All rights reserved.</p>
      </footer>
    </main>
  );
}
