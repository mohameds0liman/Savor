import Link from "next/link";
import Image from "next/image";

function Footer() {
  const navLink = "font-body text-sm text-ink-muted transition-colors hover:text-primary";

  return (
    <footer className="border-t border-linen-border bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Savor"
                width={52}
                height={23}
                className="h-10 w-auto shrink-0 object-contain"
              />
              <div className="leading-tight">
                <span className="font-display text-2xl font-bold text-ink">Savor</span>
              </div>
            </Link>
            <p className="font-body text-sm leading-relaxed text-ink-muted">
              Handcrafted recipes curated with warmth, seasonal ingredients, and culinary
              curiosity for thoughtful home kitchens.
            </p>
          </div>

          {/* Collections */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-ink">Collections</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className={navLink}>Home</Link>
              <Link href="/favourites" className={navLink}>Favourites</Link>
              <Link href="/my-recipes" className={navLink}>My Recipes</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-ink">Support</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/contact" className={navLink}>Contact</Link>
              <Link href="/create-recipe" className={navLink}>Share a Recipe</Link>
              <Link href="/profile" className={navLink}>Account</Link>
            </nav>
          </div>

          {/* Newsletter (decorative only — no backend endpoint) */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-ink">Weekend In Your Inbox</h4>
            <p className="font-body text-sm text-ink-muted">
              Curated seasonal dinner ideas, every Friday morning.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-linen-border">
        <p className="py-5 text-center font-body text-sm text-ink-muted">
          © {new Date().getFullYear()} Savor Culinary Media. Handcrafted with reverence for home cooking.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
