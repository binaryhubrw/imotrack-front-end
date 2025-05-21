"use client";
import {
  faBars,
  faCogs,
  faEnvelope,
  faHome,
  faSignInAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div>
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow fixed w-full top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href={"/"}>
            <Image
              src="/logo/logo.png"
              alt="Imotrack Logo"
              width={60}
              height={60}
              className="h-15 w-auto"
            />
          </Link>
          <span className="text-xl font-bold text-[#0872b3]">Imotrack</span>
        </div>
        <ul
          className={`md:flex gap-8 list-none transition-all ${
            mobileMenu
              ? "flex flex-col absolute right-8 top-16 bg-white shadow-lg p-4 rounded"
              : "hidden md:flex"
          }`}
        >
          <li>
            <a
              href="#home"
              className="flex items-center text-[#0872b3] gap-2 jump-on-hover"
            >
              <FontAwesomeIcon icon={faHome} /> Home
            </a>
          </li>
          <li>
            <a
              href="#features"
              className="flex items-center text-[#0872b3] gap-2 jump-on-hover"
            >
              <FontAwesomeIcon icon={faCogs} /> Features
            </a>
          </li>
          <li>
            <a
              href="#benefits"
              className="flex items-center text-[#0872b3] gap-2 jump-on-hover"
            >
              <FontAwesomeIcon icon={faStar} /> Benefits
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="flex items-center text-[#0872b3] gap-2 jump-on-hover"
            >
              <FontAwesomeIcon icon={faEnvelope} /> Contact
            </a>
          </li>
          <li>
            <Link
              href="/login"
              className="bg-[#0872b3] text-white px-4 py-2 -mt-2 rounded flex items-center gap-2 jump-on-hover"
            >
              <FontAwesomeIcon icon={faSignInAlt} /> Login
            </Link>
          </li>
        </ul>

        <button
          className="md:hidden text-2xl text-[#0872b3]"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </nav>
    </div>
  );
}
