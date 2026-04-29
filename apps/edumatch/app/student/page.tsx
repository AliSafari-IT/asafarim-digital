"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Inquiry = {
  id: string;
  subject: string;
  gradeLevel: string;
  description: string;
  status: string;
  createdAt: string;
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/inquiries")
        .then((r) => r.json())
        .then((data) => {
          setInquiries(data.items ?? []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">EduMatch</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session?.user?.name}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-red-600 hover:underline"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">My Inquiries</h2>
          <Link
            href="/student/inquiry/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Ask a Question
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No inquiries yet</p>
            <Link
              href="/student/inquiry/new"
              className="text-blue-600 hover:underline"
            >
              Ask your first question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/student/inquiry/${inquiry.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {inquiry.subject} · {inquiry.gradeLevel}
                    </h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {inquiry.description}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inquiry.status === "NEW"
                        ? "bg-gray-100 text-gray-800"
                        : inquiry.status === "AI_RESPONDED"
                        ? "bg-blue-100 text-blue-800"
                        : inquiry.status === "TUTOR_REQUESTED"
                        ? "bg-yellow-100 text-yellow-800"
                        : inquiry.status === "BOOKED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {inquiry.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
