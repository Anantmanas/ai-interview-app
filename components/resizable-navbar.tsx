"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";

export default function ResizableNavbar() {
  const navItems = [
    {
      name: "HOW IT WORKS",
      link: "#how-it-works",
    },
    {
      name: "CURRICULUM",
      link: "#architecture",
    },
    {
      name: "FEATURES",
      link: "#features",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo href="/">
          <div className="flex items-center gap-2.5">
            {/* Geometric InterviewAI brand glyph with violet gradient */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L22 20L12 16L12 2Z" fill="#8052ff" />
              <path d="M12 2L2 20L12 16L12 2Z" fill="#15846e" />
            </svg>
            <span className="font-normal text-[16px] text-white tracking-[-0.02em]">
              InterviewAI
            </span>
          </div>
        </NavbarLogo>

        <NavItems items={navItems} />

        <div className="flex items-center gap-3">
          <NavbarButton
            href="/auth/sign-up"
            variant="primary"
            className="bg-[#8052ff] hover:bg-[#9a75ff] text-white font-mono text-[11px] uppercase tracking-[0.06em] font-medium px-5 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(128,82,255,0.4)] border-none"
          >
            Start Free
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="/">
            <div className="flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L22 20L12 16L12 2Z" fill="#8052ff" />
                <path d="M12 2L2 20L12 16L12 2Z" fill="#15846e" />
              </svg>
              <span className="font-normal text-[15px] text-white tracking-[-0.02em]">
                InterviewAI
              </span>
            </div>
          </NavbarLogo>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col gap-2 w-full py-2">
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#9a9a9a] hover:text-[#ffffff] transition-colors py-2.5 px-3 rounded-lg hover:bg-white/[0.05]"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 pt-4 border-t border-white/10">
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full font-mono text-[11px] uppercase tracking-widest text-[#9a9a9a] hover:text-[#ffffff] py-2 text-center rounded-none border border-white/10 bg-white/[0.02]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-[#8052ff] hover:bg-[#9a75ff] text-white w-full font-mono text-[11px] uppercase tracking-[0.025em] font-medium py-2.5 rounded-full text-center transition-all shadow-[0_0_16px_rgba(128,82,255,0.3)] border-none"
            >
              Start Free Mock Interview
            </Link>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
