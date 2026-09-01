"use client";
import Navbar from "@/components/navbar/page";
import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/user/me")
      .then((response) => setUser(response.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="mx-auto max-w-xl pt-28 px-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !user ? (
          <p className="text-gray-500">User not found.</p>
        ) : (
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                className="mb-4 h-24 w-24 rounded-full object-cover"
              />
            )}
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-gray-600">{user.email}</p>
            <p className="mt-2 text-sm uppercase tracking-wide text-gray-400">
              {user.role}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;