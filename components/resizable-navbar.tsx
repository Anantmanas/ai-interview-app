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
      name: "How It Works",
      link: "#how-it-works",
    },
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Practice & Feedback",
      link: "#architecture",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo href="/">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF]" />
            <span className="font-display text-[15px] font-bold text-[#F4F2EC] tracking-[-0.02em]">
              InterviewAI
            </span>
            <span className="font-mono text-[9px] text-[#8C8C88] border border-white/10 bg-white/[0.04] rounded px-1.5 py-0.5 tracking-[0.1em] uppercase">
              AI MOCK INTERVIEWS
            </span>
          </div>
        </NavbarLogo>

        <NavItems items={navItems} />

        <div className="flex items-center gap-3">
          <NavbarButton
            href="/auth/login"
            variant="secondary"
            className="font-mono text-[11px] text-[#8C8C88] uppercase tracking-[0.08em] hover:text-[#F4F2EC] px-3.5 py-1.5 transition-colors"
          >
            Sign In
          </NavbarButton>
          <NavbarButton
            href="/auth/sign-up"
            variant="primary"
            className="bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-4 py-2 rounded-lg transition-colors"
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF]" />
              <span className="font-display text-[15px] font-bold text-[#F4F2EC] tracking-[-0.02em]">
                InterviewAI
              </span>
              <span className="font-mono text-[9px] text-[#8C8C88] border border-white/10 bg-white/[0.04] rounded px-1.5 py-0.5 tracking-[0.08em]">
                MOCK INTERVIEWS
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
                className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#94a3b8] hover:text-[#f8fafc] transition-colors py-2 px-3 rounded-md hover:bg-white/[0.05]"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 pt-4 border-t border-white/10">
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full font-mono text-[12px] uppercase tracking-[0.08em] text-[#94a3b8] hover:text-[#f8fafc] py-2 text-center rounded-md border border-white/10 bg-white/[0.02]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-[#2447FF] hover:bg-[#1A3AE8] text-white w-full font-mono text-[12px] font-semibold uppercase tracking-[0.08em] py-2.5 rounded-md text-center"
            >
              Start Free Mock Interview
            </Link>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
