"use strict";

(function installContentIntegration() {
  const REMOVED_PATHS = new Set(["/launcher"]);
  const INTEGRATED_PATHS = new Set(["/predictions"]);

  function normalizedPath(path) {
    try {
      const url = new URL(path || location.href, location.href);
      return url.pathname.replace(/\/+$/, "") || "/";
    } catch (_error) {
      return String(path || location.pathname).replace(/\/+$/, "") || "/";
    }
  }

  function isIntegratedPredictionPath(path) {
    return path === "/predictions" || path.startsWith("/predictions/");
  }

  function targetPath(path) {
    const normalized = normalizedPath(path);
    if (REMOVED_PATHS.has(normalized)) return "/sports";
    if (INTEGRATED_PATHS.has(normalized) || isIntegratedPredictionPath(normalized)) return "/sports";
    return normalized;
  }

  function cleanupNav() {
    document.querySelectorAll('a[href="/launcher"]').forEach((link) => link.remove());
    document.querySelectorAll('a[href="/predictions"]').forEach((link) => link.remove());
    document.querySelectorAll('a[href^="/predictions/"]').forEach((link) => {
      link.setAttribute("href", "/sports");
      link.textContent = link.textContent || "體育預測";
    });
  }

  function redirectIfNeeded() {
    const path = normalizedPath(location.pathname);
    const target = targetPath(path);
    if (target !== path) {
      history.replaceState({}, "", target);
      return true;
    }
    return false;
  }

  function patchRender() {
    if (typeof render !== "function" || render.__contentIntegrationPatched) return false;
    const originalRender = render;
    render = function contentIntegratedRender() {
      cleanupNav();
      redirectIfNeeded();
      return originalRender.apply(this, arguments);
    };
    render.__contentIntegrationPatched = true;
    render();
    return true;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const path = normalizedPath(link.getAttribute("href"));
    const target = targetPath(path);
    if (target === path) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    history.pushState({}, "", target);
    if (typeof render === "function") render();
  }, true);

  cleanupNav();
  redirectIfNeeded();
  if (!patchRender()) {
    const timer = window.setInterval(() => {
      cleanupNav();
      if (patchRender()) window.clearInterval(timer);
    }, 30);
    window.setTimeout(() => window.clearInterval(timer), 10000);
  }
})();
