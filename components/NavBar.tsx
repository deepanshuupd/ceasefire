"use client";

import { useId, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/common";
import { cn } from "@/lib/utils";

type NavItem = {
  label: "Features" | "Solutions" | "Pricing";
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Pricing", href: "#" },
];

function Brand() {
  return (
    <a
      href="#"
      className="text-lg font-semibold tracking-tight text-foreground"
      aria-label="Clipforge home"
    >
      Clipforge
    </a>
  );
}

type MobileBrandProps = {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  controlsId: string;
};

function MobileBrand({ isMenuOpen, onToggleMenu, controlsId }: MobileBrandProps) {
  return (
    <div className="flex items-center gap-2 md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleMenu}
        className="text-foreground hover:text-foreground"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls={controlsId}
      >
        {isMenuOpen ? <X /> : <Menu />}
      </Button>
      <Brand />
    </div>
  );
}

function DesktopNav() {
  return (
    <nav aria-label="Primary navigation" className="hidden md:block">
      <ul className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              onClick={(event) => event.preventDefault()}
              className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TryForFreeButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      className={cn(
        "h-10 rounded-xl bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/90",
        className,
      )}
    >
      Try it for free
    </Button>
  );
}

type HeaderActionsProps = {
  showCtaOnMobile?: boolean;
};

function HeaderActions({ showCtaOnMobile = true }: HeaderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <TryForFreeButton className={cn(!showCtaOnMobile && "hidden sm:inline-flex")} />
    </div>
  );
}

type MobileMenuProps = {
  id: string;
  isOpen: boolean;
  onItemSelect: () => void;
};

function MobileMenu({ id, isOpen, onItemSelect }: MobileMenuProps) {
  return (
    <div
      id={id}
      className={cn(
        "md:hidden",
        isOpen ? "block border-t border-white/10 bg-black px-4 pb-4" : "hidden",
      )}
    >
      <nav aria-label="Mobile navigation">
        <ul className="flex flex-col gap-1 pt-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  onItemSelect();
                }}
                className="inline-flex h-10 w-full items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();

  return (
    <header className="navbar-surface sticky top-0 z-50 border-b">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-18 grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <div className="hidden md:block">
            <Brand />
          </div>
          <MobileBrand
            isMenuOpen={isMenuOpen}
            onToggleMenu={() => setIsMenuOpen((open) => !open)}
            controlsId={mobileMenuId}
          />
          <DesktopNav />
          <HeaderActions />
        </div>
      </div>

      <MobileMenu
        id={mobileMenuId}
        isOpen={isMenuOpen}
        onItemSelect={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
