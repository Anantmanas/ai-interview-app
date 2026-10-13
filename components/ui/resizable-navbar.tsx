"use client";
import { cn } from "@/lib/utils";
import { Menu as IconMenu2, X as IconX } from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface NavbarLogoProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  // Intersection Observer — zero scroll listener overhead
  useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      // Set to fixed/sticky at top with high z-index
      className={cn("fixed inset-x-0 top-0 z-50 w-full pt-4 px-4 pointer-events-none", className)}
    >
      <div className="pointer-events-auto">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as React.ReactElement<{ visible?: boolean }>,
                { visible },
              )
            : child,
        )}
      </div>
    </motion.div>
  );
};


export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(14px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 68px rgba(0, 0, 0, 0.4)"
          : "none",
        width: visible ? "max(70%, 920px)" : "100%",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 30,
      }}
      style={{
        maxWidth: "min(100%, 1280px)",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-transparent px-6 py-2.5 transition-all duration-300 lg:flex",
        visible && "bg-black/90 border border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(128,82,255,0.15)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium transition duration-200 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300 hover:text-[#ffffff] transition-colors duration-150"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-white/[0.06] border border-[#8052ff]/40 shadow-[0_0_12px_rgba(128,82,255,0.2)]"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "none",
        boxShadow: visible
          ? "0 0 30px rgba(0, 0, 0, 0.7), 0 0 16px rgba(128, 82, 255, 0.15)"
          : "none",
        width: visible ? "95%" : "100%",
        paddingRight: visible ? "16px" : "8px",
        paddingLeft: visible ? "16px" : "8px",
        borderRadius: visible ? "14px" : "2rem",
        y: visible ? 8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 30,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-2 py-2 lg:hidden",
        visible && "bg-black/95 border border-white/10",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};


export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-xl bg-[#000000]/95 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      aria-label="Toggle navigation menu"
      onClick={onClick}
      className="p-2 rounded-md hover:bg-white/[0.08] transition-colors focus:outline-none"
    >
      {isOpen ? (
        <IconX className="h-5 w-5 text-neutral-100" />
      ) : (
        <IconMenu2 className="h-5 w-5 text-neutral-100" />
      )}
    </button>
  );
};

export const NavbarLogo = ({
  href = "/",
  children,
  className,
}: NavbarLogoProps = {}) => {
  return (
    <a
      href={href}
      className={cn(
        "relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-white",
        className,
      )}
    >
      {children ?? (
        <>
          <img
            src="https://assets.aceternity.com/logo-dark.png"
            alt="logo"
            width={30}
            height={30}
          />
          <span className="font-medium text-white">Startup</span>
        </>
      )}
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "bg-[#8052ff] text-white hover:bg-[#926aff] border border-[#8052ff]/40 shadow-[0_0_20px_rgba(128,82,255,0.35)]",
    secondary: "bg-transparent text-[#9a9a9a] hover:text-white shadow-none",
    dark: "bg-[#0a0a0a] text-white border border-white/10 hover:bg-[#141414] shadow-[0_0_20px_rgba(0,0,0,0.6)]",
    gradient:
      "bg-gradient-to-r from-[#8052ff] to-[#a855f7] text-white shadow-[0_0_20px_rgba(128,82,255,0.35)] hover:brightness-110",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
