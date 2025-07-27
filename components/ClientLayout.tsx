// app/ClientLayout.tsx
'use client';

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const hideLayoutOn = ["/login", "/dashboard", "/forgot-password"];
  const shouldHideLayout = hideLayoutOn.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
}
