"use strict";

(function applySportsPredictionHotfix() {
  const guestMessage = "請先登入，才能進入黑曜智流 AI。";

  function sanitizeAuthMessage() {
    if (typeof state === "undefined") return;
    if (!state.authUser && state.authMessage === "身份驗證已連線。") {
      state.authMessage = guestMessage;
    }
  }

  function sportsText(html) {
    return String(html)
      .replace(/ATG觀測/g, "體育預測")
      .replace(/ATG 即時房間監控/g, "體育預測即時看板")
      .replace(/ATG Bridge/g, "Sports Bridge")
      .replace(/ATG 即時/g, "體育預測即時")
      .replace(/ATG 房間/g, "體育賽事")
      .replace(/監控房間/g, "追蹤賽事")
      .replace(/房間資料/g, "賽事資料")
      .replace(/房間狀態/g, "賽事狀態")
      .replace(/房間/g, "賽事");
  }

  function registerSportsRoute() {
    if (typeof routes !== "undefined" && typeof renderAtgMonitor === "function") {
      routes["/sports"] = renderAtgMonitor;
    }

    if (typeof seoPages !== "undefined" && Array.isArray(seoPages) && !seoPages.some((page) => page.slug === "/sports")) {
      seoPages.push({
        slug: "/sports",
        title: "體育預測分析｜黑曜智流 AI",
        description: "黑曜智流 AI 體育預測看板，整合賽事資料、會員權限與即時資料推送。",
        h1: "體育預測即時看板",
        h2: ["賽事狀態", "即時資料", "風險提醒"],
        faq: ["體育預測內容是否保證結果？", "如何查看賽事資料？"],
        links: ["/predictions", "/wallet", "/account"]
      });
    }
  }

  function patchRenderPipeline() {
    if (typeof render === "function" && !render.__sportsHotfixPatched) {
      const originalRender = render;
      render = function patchedRender() {
        sanitizeAuthMessage();
        return originalRender.apply(this, arguments);
      };
      render.__sportsHotfixPatched = true;
    }

    if (typeof brandText === "function" && !brandText.__sportsHotfixPatched) {
      const originalBrandText = brandText;
      brandText = function patchedBrandText(html) {
        return sportsText(originalBrandText.call(this, html));
      };
      brandText.__sportsHotfixPatched = true;
    }
  }

  sanitizeAuthMessage();
  registerSportsRoute();
  patchRenderPipeline();

  if (typeof render === "function") {
    render();
  }
})();
