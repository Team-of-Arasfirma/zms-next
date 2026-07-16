"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Products", href: "/product" },
  { name: "Projects", href: "/project" },
  { name: "Blog", href: "/blog" },
  { name: "Career", href: "/career" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => {
    setOpen(false);
  };

  const isActiveLink = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center"
          aria-label="Go to ZMS home page"
        >
          <Image
            src="/logo/zms.png"
            alt="ZMS Logo"
            width={200}
            height={100}
            priority
            className="h-10 w-auto object-contain sm:h-12 md:h-14"
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-7 md:flex lg:gap-10">
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);

            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`font-['Poppins'] text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "text-orange-500"
                      : "text-black hover:text-orange-500"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setOpen((previousValue) => !previousValue)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-black transition-colors hover:text-orange-500 md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <span
            className={
              open
                ? "text-[34px] leading-none"
                : "text-[30px] leading-none"
            }
          >
            {open ? "�" : "?"}
          </span>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t border-black/5 bg-white px-4 py-4 shadow-md md:hidden">
          <ul className="flex flex-col gap-5">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`block font-['Poppins'] text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "text-orange-500"
                        : "text-black hover:text-orange-500"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}