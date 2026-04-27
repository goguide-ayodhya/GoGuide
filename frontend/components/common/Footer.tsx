import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 bg-gradient-to-t from-slate-50 to-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-indigo-600 mb-3">GoGuide</h3>
            <p className="text-sm text-slate-600">
              Your trusted companion for exploring Ayodhya. Book cabs, tour
              packages, and local guides with ease. Experience the sacred city
              seamlessly.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  href="/tourist/cabs"
                  className="hover:text-slate-900 transition-colors"
                >
                  Cabs
                </Link>
              </li>
              <li>
                <Link
                  href="/tourist/packages"
                  className="hover:text-slate-900 transition-colors"
                >
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/tourist/guides"
                  className="hover:text-slate-900 transition-colors"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">About</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  href="/home/about-us"
                  className="hover:text-slate-900 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-slate-900 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="hover:text-slate-900 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  href="/home/privacy-policy"
                  className="hover:text-slate-900 transition-colors"
                >
                  Privacy & Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/home/terms-and-conditions"
                  className="hover:text-slate-900 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/home/cookies"
                  className="hover:text-slate-900 transition-colors"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col mt-8 border-t border-slate-100 pt-6">
          <h3 className="font-semibold text-slate-900 mb-3">Follow Us</h3>
          <ul className="flex gap-4">
            <li>
              <a
                href="https://facebook.com/goguideofficial"
                target="_blank"
                className="hover:text-slate-900 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </li>

            <li>
              <a
                href="https://instagram.com/goguideofficial"
                target="_blank"
                className="hover:text-slate-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </li>

            <li>
              <a
                href="https://wa.me/918881993735?text=Hello%20GoGuide%20Team!"
                target="_blank"
                className="hover:text-green-600 transition-colors"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>&copy; 2026 GoGuide | Ayodhya | All rights reserved.</p>
          <div className="mt-3 md:mt-0">
            Crafted with care •{" "}
            <span className="font-medium text-slate-700">GoGuide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
