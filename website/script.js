const menuBtn = document.querySelector(".menu-btn");
const mobileNav = document.querySelector(".mobile-nav");

function wireApkDownloads() {
  const config = window.ONETUNE_SITE ?? {};
  const apkUrl = config.apkUrl ?? "./downloads/OneTune-1.0.0.apk";
  const apkFileName = config.apkFileName ?? "OneTune-1.0.0.apk";

  document.querySelectorAll("[data-apk-download]").forEach((link) => {
    link.setAttribute("href", apkUrl);
    link.setAttribute("download", apkFileName);
    link.setAttribute("rel", "noopener");
  });

  const pathNote = document.getElementById("apk-path-note");
  if (pathNote) {
    pathNote.textContent = `Download link: ${apkUrl}`;
  }
}

wireApkDownloads();

menuBtn?.addEventListener("click", () => {
  const isOpen = mobileNav?.toggleAttribute("hidden") === false;
  menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.setAttribute("hidden", "");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  if (anchor.hasAttribute("data-apk-download")) return;

  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
