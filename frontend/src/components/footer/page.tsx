import Link from "next/link";

function Footer() {
    const navLink =
        "transition-colors duration-300 hover:text-orange-400 cursor-pointer";

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-6xl mx-auto px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Brand */}
                <div className="flex items-center gap-4">
                    <img
                        src="https://png.pngtree.com/png-vector/20220705/ourmid/pngtree-food-logo-png-image_5687686.png"
                        alt="Logo"
                        className="w-14"
                    />
                    <h3 className="text-2xl font-bold text-white tracking-wide">
                        Recipe
                    </h3>
                </div>

                {/* Links (same as navbar)
                <nav className="flex items-center gap-8">
                    <Link href={"/Home"} className={navLink}>Home</Link>
                    <Link href={"/Favourites"} className={navLink}>Favourites</Link>
                    <Link href={"/Recipes"} className={navLink}>Recipes</Link>
                    <Link href={"/Contact"} className={navLink}>Contact</Link>
                </nav> */}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <p className="text-center text-sm text-gray-500 py-4">
                    © {new Date().getFullYear()} Recipe. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;