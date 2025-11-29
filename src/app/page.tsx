import Link from "next/link";
import { getCurrentUser } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-gray-900">
            Healthy <span className="text-blue-600">AI</span>
          </h1>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            href="/auth/login"
          >
            <h3 className="text-2xl font-bold text-gray-900">Login →</h3>
            <div className="text-lg text-gray-600">
              Access your healthcare management dashboard
            </div>
          </Link>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-gray-900">
                {user && <span>Logged in as {user.name} ({user.role})</span>}
              </p>
              {user && (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-blue-600 text-white px-10 py-3 font-semibold no-underline transition hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}