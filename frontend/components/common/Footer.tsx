import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 bg-gradient-to-t from-slate-50 to-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/cabs" className="hover:text-slate-900 transition-colors">
                  Cabs
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-slate-900 transition-colors">
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/tokens" className="hover:text-slate-900 transition-colors">
                  Passes
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-slate-900 transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">About</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">Cookies</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Follow Us</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">Facebook</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>&copy; 2026 Ayodhya Tourism. All rights reserved.</p>
          <div className="mt-3 md:mt-0">Crafted with care • <span className="font-medium text-slate-700">Ayodhya Tourism</span></div>
        </div>
      </div>
    </footer>
  );
}
