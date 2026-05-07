"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Scanner", icon: "📡" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/advertise", label: "Ads", icon: "📢" },
  { href: "/pricing", label: "Pro", icon: "⚡" },
  { href: "/login", label: "Account", icon: "👤" },
];

export default function MobileNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(({ href, label, icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                active ? "text-accent-cyan" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
