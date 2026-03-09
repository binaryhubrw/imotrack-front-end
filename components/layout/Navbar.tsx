"use client";

import {
  faBars,
  faCogs,
  faEnvelope,
  faHome,
  faStar,
  faListUl,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const navLinks = [
  { href: "#home", label: "Home", icon: faHome },
  { href: "#features", label: "Features", icon: faCogs },
  { href: "#how-it-works", label: "How It Works", icon: faListUl },
  { href: "#benefits", label: "Benefits", icon: faStar },
  { href: "#about", label: "About", icon: faInfoCircle },
  { href: "#contact", label: "Contact", icon: faEnvelope },
];

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div>
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 fixed w-full top-0 z-50 bg-black/25 backdrop-blur-md">
        <div className="flex items-center gap-3 md:w-1/4 shrink-0">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Imotrak Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30 bg-white/10 shadow-md"
            />
          </Link>
          <span className="text-xl font-bold text-white drop-shadow-md">
            Imotrak
          </span>
        </div>
        <ul
          className={`md:flex gap-6  list-none transition-all md:absolute md:left-1/2 md:-translate-x-1/2 md:justify-center ${
            mobileMenu
              ? "flex flex-col absolute right-6 top-16 bg-black/90 backdrop-blur-md text-white p-4 rounded-lg border border-white/20 shadow-xl"
              : "hidden md:flex"
          }`}
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="flex p-4 text-lg items-center gap-2 jump-on-hover font-medium text-white drop-shadow-md hover:text-white/90"
                onClick={() => setMobileMenu(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden md:block md:w-1/4 shrink-0" aria-hidden="true">
          {/* Spacer for balanced layout when menu is centered */}
        </div>

        <button
          className="md:hidden text-2xl p-2 text-white drop-shadow-md"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </nav>
    </div>
  );
}
