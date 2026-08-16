import Link from "next/link";

function Navbar(){
    const navLink ="transition-colors duration-300 hover:text-orange-500 cursor-pointer"
    "transition-colors duration-300 hover:text-orange-500 cursor-pointer";
    return(
    <nav className="flex items-center justify-between px-10 py-4">
      {/* Logo */}
      <img
        src="https://png.pngtree.com/png-vector/20220705/ourmid/pngtree-food-logo-png-image_5687686.png"
        alt="Logo"
        className="w-16"
      />

      {/* Menu */}
      <div className="flex items-center gap-8">
        <Link href={"/Home"} className={navLink}>Home</Link>
        <Link href={"/Favourites"} className={navLink}>Favourites</Link>
        <Link href={"/Recipes"} className={navLink}>Recipes</Link>
        <Link href={"/Contact"} className={navLink}>Contact</Link>

        <button className="bg-orange-400 text-white px-4 py-2 rounded-lg
                hover:bg-orange-500 transition-colors duration-300">
          Login
        </button>
      </div>
    </nav>
    )
}


export default Navbar;