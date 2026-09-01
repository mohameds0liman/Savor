"use client";

import Link from "next/link";
import { useState,useEffect } from "react";
import { usePathname ,useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/lib/api";

function Navbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const selectionStyle = (href: string) => {
    const isSelected = pathname === href;
    return `
      transition-all duration-300 cursor-pointer
      px-3 py-2 rounded-lg
      hover:text-orange-500
      ${
        isSelected
          ? "border border-orange-300 text-orange-500"
          : "border border-transparent"
      }
    `;
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName"));
  }, []);

  function handleLogout() {
    axios.post(`${API_URL}/api/logout`,{
      refreshToken:localStorage.getItem("refreshToken")
    }).catch(()=>{});
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    setUserName(null);
    router.push("/");
  }
  // this for Protect the route need login to redirect to login page to access them
  const PROTECTED_ROUTES = ["/favourites", "/my-recipes"];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (PROTECTED_ROUTES.includes(href) && !localStorage.getItem("token")) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white px-10 py-4 shadow-sm">
      {/* Logo */}
      <img
        src="https://png.pngtree.com/png-vector/20220705/ourmid/pngtree-food-logo-png-image_5687686.png"
        alt="Logo"
        className="w-16"
      />

      {/* Menu */}
      <div className="flex items-center gap-8">
        <Link href="/" className={selectionStyle("/")}>
          Home
        </Link>

        <Link
          href="/favourites"
          onClick={(e) => handleNavClick(e, "/favourites")}
          className={selectionStyle("/favourites")}
        >
          Favourites
        </Link>

        <Link 
          href="/my-recipes"
          onClick={(e) => handleNavClick(e, "/my-recipes")}
          className={selectionStyle("/my-recipes")}>
          My Recipes
        </Link>

        <Link href="/contact" className={selectionStyle("/contact")}>
          Contact
        </Link>

        {userName ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="font-semibold text-orange-500 hover:underline"
            >
          {userName} ▾
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-800 transition-colors hover:bg-gray-50"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-gray-800 transition-colors hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
          href="/login"
          className="rounded-lg bg-orange-400 px-4 py-2 text-white transition-colors duration-300 hover:bg-orange-500"
        >
          Login
        </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;