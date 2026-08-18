"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathname = usePathname();

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
          className={selectionStyle("/favourites")}
        >
          Favourites
        </Link>

        <Link href="/recipes" className={selectionStyle("/recipes")}>
          My Recipes
        </Link>

        <Link href="/contact" className={selectionStyle("/contact")}>
          Contact
        </Link>

        <button
          className="
            rounded-lg bg-orange-400 px-4 py-2 text-white
            transition-colors duration-300
            hover:bg-orange-500
          "
        >
          Login
        </button>
      </div>
    </nav>
  );
}

export default Navbar;