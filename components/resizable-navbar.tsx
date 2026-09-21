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

export default function ResizableNavbar() {
  const navItems = [
    {
      name: "Capabilities",
      link: "#features",
    },
    {
      name: "Workflow",
      link: "#how-it-works",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo href="/">
          <div className="flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
            <span className="font-mono text-[13px] font-bold text-[#f8fafc] uppercase tracking-[0.1em]">
              InterviewAI
            </span>
            <span className="font-mono text-[9px] text-[#818cf8] border border-[#3730a3] bg-[#14142b]/60 rounded-[3px] px-1.5 py-0.5 tracking-[0.08em]">
              v2.0
            </span>
          </div>
        </NavbarLogo>

        <NavItems items={navItems} />

        <div className="flex items-center gap-3">
          <NavbarButton
            href="/auth/login"
            variant="secondary"
            className="font-mono text-[11px] text-[#9ca3af] uppercase tracking-[0.06em] hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </NavbarButton>
          <NavbarButton
            href="/auth/sign-up"
            variant="primary"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] bg-[#4f46e5] text-white hover:bg-[#5865f2] border border-[#6366f1]/40 px-4 py-2 rounded-md shadow-[0_0_18px_rgba(79,70,229,0.35)] transition-colors"
          >
            Get Started
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="/">
            <div className="flex items-center gap-2.5">
              <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
              <span className="font-mono text-[13px] font-bold text-[#f8fafc] uppercase tracking-[0.1em]">
                InterviewAI
              </span>
              <span className="font-mono text-[9px] text-[#818cf8] border border-[#3730a3] bg-[#14142b]/60 rounded-[3px] px-1.5 py-0.5 tracking-[0.08em]">
                v2.0
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
          <div className="flex flex-col gap-3 w-full py-2">
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-mono text-[12px] uppercase tracking-[0.06em] text-[#9ca3af] hover:text-white transition-colors py-1.5 px-2 rounded-md hover:bg-[#14142b]"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 pt-4 border-t border-[#1e1e2f]">
            <NavbarButton
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              variant="secondary"
              className="w-full font-mono text-[12px] uppercase tracking-[0.06em] text-[#9ca3af] hover:text-white py-2 text-center"
            >
              Sign In
            </NavbarButton>
            <NavbarButton
              href="/auth/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
              variant="primary"
              className="w-full font-mono text-[12px] font-bold uppercase tracking-[0.06em] bg-[#4f46e5] text-white hover:bg-[#5865f2] border border-[#6366f1]/40 py-2 rounded-md text-center shadow-[0_0_18px_rgba(79,70,229,0.35)]"
            >
              Get Started
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
