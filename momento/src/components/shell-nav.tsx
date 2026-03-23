import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/programs", label: "Programs" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/team", label: "Team" },
  { href: "/sign-in", label: "Access" },
];

export function ShellNav() {
  return (
    <header className="shell-header">
      <div className="shell-header__inner">
        <BrandMark />
        <nav className="shell-nav" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shell-nav__link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
