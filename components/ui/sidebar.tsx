"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu as IconMenu2, X as IconX } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
  defaultOpen = true,
  className,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  defaultOpen?: boolean;
  className?: string;
}) => {
  const parentContext = useContext(SidebarContext);
  const [openState, setOpenState] = useState(defaultOpen);

  if (parentContext && openProp === undefined && setOpenProp === undefined) {
    return <>{children}</>;
  }

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      <div className={cn("group/sidebar-wrapper flex min-h-screen w-full", className)}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  defaultOpen = true,
  className,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  defaultOpen?: boolean;
  className?: string;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate} defaultOpen={defaultOpen} className={cn("min-h-0 w-auto", className)}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen h-[100dvh] min-h-screen sticky top-0 px-3 py-4 hidden md:flex md:flex-col justify-between bg-[#08080c] border-r border-[#1e1e2f] shrink-0 overflow-hidden z-30 transition-[width] duration-200 ease-in-out",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : (open ? "260px" : "68px"),
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-12 px-4 py-3 flex flex-row md:hidden items-center justify-between bg-[#08080c] border-b border-[#1e1e2f] w-full"
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
          className="p-1 rounded-md text-[#9ca3af] hover:text-white hover:bg-[#14142b] transition-colors"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-[#08080c] p-6 z-[100] flex flex-col justify-between overflow-y-auto border-r border-[#1e1e2f]",
              className
            )}
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-6 top-6 z-50 text-[#9ca3af] hover:text-white p-1 rounded-md hover:bg-[#14142b] transition-colors"
              onClick={() => setOpen(!open)}
            >
              <IconX className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-colors",
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block p-0 m-0 truncate"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

/* Compatibility sub-components for existing dashboard layouts */

export const SidebarTrigger = ({
  className,
  ...props
}: React.ComponentProps<"button">) => {
  const { open, setOpen } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={() => setOpen(!open)}
      className={cn(
        "p-1.5 rounded-md text-[#9ca3af] hover:text-[#818cf8] hover:bg-[#14142b] transition-colors focus:outline-none",
        className
      )}
      {...props}
    >
      <IconMenu2 className="h-4 w-4" />
    </button>
  );
};

export const SidebarInset = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-1 flex-col min-w-0", className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarHeader = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col shrink-0", className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto min-h-0", className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarFooter = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col shrink-0 mt-auto", className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarGroup = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarGroupContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
};

export const SidebarMenu = ({
  className,
  children,
  ...props
}: React.ComponentProps<"ul">) => {
  return (
    <ul className={cn("flex flex-col list-none m-0 p-0", className)} {...props}>
      {children}
    </ul>
  );
};

export const SidebarMenuItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) => {
  return (
    <li className={cn("list-none m-0 p-0", className)} {...props}>
      {children}
    </li>
  );
};

export const SidebarMenuButton = ({
  className,
  children,
  asChild,
  isActive,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean; isActive?: boolean }) => {
  return (
    <div
      data-active={isActive}
      className={cn("flex items-center w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
};
