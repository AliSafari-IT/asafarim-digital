"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to EduMatch</h1>
          <p className="mt-2 text-gray-600">Mobile app built with Next.js + Capacitor</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
