import type { AnchorHTMLAttributes, ReactNode } from "react";
import { siteConfig } from "../config";

type ApkLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function ApkLink({ children, href, download, rel, ...props }: ApkLinkProps) {
  return (
    <a
      href={href ?? siteConfig.apkUrl}
      download={download ?? siteConfig.apkFileName}
      rel={rel ?? "noopener"}
      {...props}
    >
      {children}
    </a>
  );
}
