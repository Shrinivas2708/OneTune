import type { MouseEvent, ReactNode } from "react";

export function scrollToSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;

  const id = href.slice(1);
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function NavAnchor({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        scrollToSection(event, href);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
