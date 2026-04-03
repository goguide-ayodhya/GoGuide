import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 bg-primary/20 border-t py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/cabs"
                  className="hover:text-foreground transition-colors"
                >
                  Cabs
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="hover:text-foreground transition-colors"
                >
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/tokens"
                  className="hover:text-foreground transition-colors"
                >
                  Passes
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="hover:text-foreground transition-colors"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Follow Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border text-center pt-6 text-sm text-muted-foreground">
          <p>&copy; 2026 Ayodhya Tourism. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
