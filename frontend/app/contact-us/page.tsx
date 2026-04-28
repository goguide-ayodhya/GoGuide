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

          {/* Social Media */}
          <div className="text-center space-y-4">
            <p className="font-semibold text-foreground">Follow Us</p>

            <div className="flex justify-center gap-6">
              <a href="#" className="hover:text-primary transition">
                <Instagram />
              </a>
              <a href="#" className="hover:text-primary transition">
                <Facebook />
              </a>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GoGuide. All rights reserved.
          </div>
          {/* Extra Info */}
          <div className="text-center text-sm text-muted-foreground">
            Support Hours: 9:00 AM – 9:00 PM (Mon - Sun)
          </div>
        </div>
      </div>
    </main>
  );
}
