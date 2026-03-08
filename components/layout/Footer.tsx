"use client";

import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faChevronRight,
  faEnvelope,
  faBook,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faPhone,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Placeholder: could send to API
      setEmail("");
    }
  };

  return (
    <footer
      id="contact"
      className="bg-black text-white mt-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.9)), url('https://plus.unsplash.com/premium_photo-1681487829842-2aeff98f8b63?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
      }}
    >
      {/* Top contact bar - Vroomo style */}
      <div
        className="py-8 px-4"
        style={{ backgroundColor: "#00628B" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div>
              <p className="text-white/90 text-sm uppercase tracking-wider font-semibold mb-1">Address</p>
              <p className="text-sm">Binary Hub, Kigali, Rwanda</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <div>
              <p className="text-white/90 text-sm uppercase tracking-wider font-semibold mb-1">Contact</p>
              <p className="text-sm">Phone: +250 788 123 456</p>
              <p className="text-sm">Email: info@ur.ac.rw</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div>
              <p className="text-white/90 text-sm uppercase tracking-wider font-semibold mb-1">Hours</p>
              <p className="text-sm">Mon–Sat 08:00–18:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="max-w-6xl mx-auto py-10 px-4 border-b border-white/10">
        <h4 className="font-bold text-lg mb-2">Subscribe to our newsletter</h4>
        <p className="text-white/70 text-sm mb-4 max-w-xl">
          Get updates when we release new features or documentation.
        </p>
        <form onSubmit={handleNewsletterSubmit} className="flex flex-wrap gap-2 max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#00628B]"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-[#00628B] text-white font-medium hover:bg-[#004a6b] transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Main footer columns */}
      <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h4 className="font-bold text-lg mb-3 uppercase tracking-wider">Imotrak</h4>
          <p className="text-white/75 text-sm leading-relaxed mb-4">
            Our mission is to provide seamless fleet monitoring and vehicle tracking
            that empowers organizations to optimize operations with real-time IoT and
            GPS technology.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#00628B] transition-colors" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#00628B] transition-colors" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#00628B] transition-colors" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#00628B] transition-colors" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-3 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { href: "#home", label: "Home" },
              { href: "#problem", label: "Challenges" },
              { href: "#solution", label: "Solution" },
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#benefits", label: "Benefits" },
              { href: "#about", label: "About" },
              { href: "#contact", label: "Contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center gap-2 text-white/75 hover:text-white jump-on-hover text-sm"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-3 uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center gap-2 text-white/75 hover:text-white jump-on-hover text-sm"
              >
                <FontAwesomeIcon icon={faBook} className="text-xs" />
                Documentation
              </a>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/75 hover:text-white jump-on-hover text-sm"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-3 uppercase tracking-wider">Contact</h4>
          <p className="flex items-center gap-2 text-white/75 text-sm mb-2">
            <FontAwesomeIcon icon={faEnvelope} className="text-[#00628B]" />
            info@ur.ac.rw
          </p>
          <p className="flex items-center gap-2 text-white/75 text-sm mb-2">
            <FontAwesomeIcon icon={faPhone} className="text-[#00628B]" />
            +250 788 123 456
          </p>
          <p className="flex items-center gap-2 text-white/75 text-sm">
            <FontAwesomeIcon icon={faMapMarkedAlt} className="text-[#00628B]" />
            Binary Hub, Kigali
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-white/60 text-sm">
          <p>© 2025 University of Rwanda / Binary Hub - Imotrak. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
