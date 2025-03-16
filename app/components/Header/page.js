"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Check if the user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    checkUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      {/* Left Side - Logo & Title */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Logo" className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">TODO</h1>
      </div>

      {/* Right Side - Show Logout if logged in, otherwise show Login */}
      {user ? (
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Logout
        </button>
      ) : (
        <Link href="/login">
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-neutral-900">
            Login
          </button>
        </Link>
      )}
    </header>
  );
}
