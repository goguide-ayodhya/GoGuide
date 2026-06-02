"use client";

import Image from "next/image";
import { assets } from "@/public/assets/assets";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/common/Header";
import { sendSupportMessageApi } from "@/lib/api/settings";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Footer } from "@/components/common/Footer";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header showBackButton />
      <div className="flex justify-center py-8 items-center">
        <div className="w-full flex flex-col max-w-5xl bg-card border border-border rounded-2xl shadow-lg p-6 md:p-10 space-y-8">
          {/* Logo + Heading */}
          <div className="text-center">
            <div className="flex justify-center">
              <Image src={assets.logo} alt="logo" width={80} height={80} />
            </div>
            <p className="text-muted-foreground">Travel ● Feel ● Remember</p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Call */}
            <a
              href="tel:+918881993735"
              className="p-5 border border-border rounded-xl flex items-start gap-4 hover:shadow-md hover:border-primary transition"
            >
              <Phone className="text-primary" />
              <div>
                <p className="font-semibold text-foreground">Call Us</p>
                <p className="text-sm text-muted-foreground">+91 8881993735</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:support@goguide.in"
              className="p-5 border border-border rounded-xl flex items-start gap-4 hover:shadow-md hover:border-primary transition"
            >
              <Mail className="text-primary" />
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">
                  support@goguide.in
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/918881993735"
              target="_blank"
              className="p-5 border border-border rounded-xl flex items-start gap-4 hover:shadow-md hover:border-green-500 transition"
            >
              <MessageCircle className="text-green-500" />
              <div>
                <p className="font-semibold text-foreground">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Chat instantly</p>
              </div>
            </a>

            {/* Location */}
            <div className="p-5 border border-border rounded-xl flex items-start gap-4">
              <MapPin className="text-red-500" />
              <div>
                <p className="font-semibold text-foreground">We're in</p>
                <p className="text-sm text-muted-foreground">Ayodhya, India</p>
              </div>
            </div>
          </div>

          {/* Complaint / Suggestion */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Complaint / Suggestion
            </h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your issue or suggestion..."
              className="w-full h-32 p-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              disabled={loading}
              className={`flex items-center cursor-pointer gap-2 px-5 py-2 rounded-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
              onClick={async () => {
                if (!message.trim()) return;

                try {
                  setLoading(true);

                  await sendSupportMessageApi(message);

                  setSuccess(true);
                  setMessage(""); // clear input

                  setTimeout(() => setSuccess(false), 3000);
                } catch (err) {
                  alert("Failed to send message");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Send size={16} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>

          {/* Portfolio */}
          <div className="mt-10 pt-8 flex flex-col items-center text-center">
            <Image
              src={assets.abuzar}
              alt="Abuzar Hindi"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Abuzar Hindi
            </h3>

            <p className="mt-1 text-sm text-gray-500 max-w-md">
              Designed & developed with care for GoGuide. Crafting modern,
              scalable and user-focused web experiences.
            </p>

            <a
              href="https://abuzar-hindi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View Portfolio
            </a>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center mt-8 border-t border-slate-100 pt-6">
            <h3 className="font-semibold text-slate-900 mb-3">Follow Us</h3>
            <ul className="flex gap-4">
              <li>
                <a
                  href="https://facebook.com/goguideofficial"
                  target="_blank"
                  className="hover:text-slate-900 transition-colors"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
              </li>

              <li>
                <a
                  href="https://instagram.com/goguideofficial"
                  target="_blank"
                  className="hover:text-slate-900 transition-colors"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/918881993735?text=Hello%20GoGuide%20Team!"
                  target="_blank"
                  className="hover:text-green-600 transition-colors"
                >
                  <FaWhatsapp className="w-5 h-5" />
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
      </div>
      <Footer />
    </main>
  );
}
