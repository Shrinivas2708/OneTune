import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { apkFileNameFromUrl, getReleaseManifest } from "../lib/release";
import { siteConfig } from "../config";

type ApkLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function ApkLink({ children, href, download, rel, ...props }: ApkLinkProps) {
  const [apkUrl, setApkUrl] = useState(href ?? siteConfig.apkUrl);
  const [apkFileName, setApkFileName] = useState(download ?? siteConfig.apkFileName);

  useEffect(() => {
    if (href) {
      return;
    }

    void getReleaseManifest().then((manifest) => {
      setApkUrl(manifest.downloadUrl);
      setApkFileName(apkFileNameFromUrl(manifest.downloadUrl));
    });
  }, [href]);

  return (
    <a
      href={href ?? apkUrl}
      download={download ?? apkFileName}
      rel={rel ?? "noopener"}
      {...props}
    >
      {children}
    </a>
  );
}
