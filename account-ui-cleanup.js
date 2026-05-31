"use strict";

(function installAccountUiCleanup() {
  const BANNED_TEXT = ["安全設定", "修改密碼", "登入裝置管理", "通知設定", "Security Settings"];
  let patched = false;

  function stateRef() {
    try {
      return typeof state === "undefined" ? null : state;
    } catch (_error) {
      return null;
    }
  }

  function safeEscape(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function safeFormatNumber(value) {
    if (typeof formatNumber === "function") return formatNumber(value);
    return Number(value || 0).toLocaleString("zh-TW");
  }

  function safeFormatDate(value) {
    try {
      if (typeof formatDate === "function") return formatDate(value);
      return new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch (_error) {
      return value;
    }
  }

  function panel(title, items) {
    return `
      <article class="panel">
        <h3>${safeEscape(title)}</h3>
        <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    `;
  }

  function renderCleanAccount() {
    const appState = stateRef();
    if (!appState?.authUser) return typeof renderStandaloneLogin === "function" ? renderStandaloneLogin() : "";

    const email = safeEscape(appState.authUser.email || "LINE OAuth 帳號");
    const displayName = safeEscape(appState.profile?.display_name || appState.profile?.name || String(appState.authUser.email || "會員").split("@")[0]);
    const roleValue = safeEscape(appState.profile?.role_id || appState.profile?.role || (typeof currentRole === "function" ? currentRole() : "member"));
    const memberships = Array.isArray(appState.memberships) ? appState.memberships : [];
    const activeMembership = memberships.find((item) => item.active) || memberships[0];
    const vipUntil = activeMembership?.expires_at ? safeEscape(safeFormatDate(activeMembership.expires_at)) : "未啟用";
    const unlocked = Array.from(appState.unlocked || [])
      .map((id) => {
        try {
          return predictions.find((item) => item.id === id)?.title || id;
        } catch (_error) {
          return id;
        }
      })
      .filter(Boolean)
      .map((item) => safeEscape(item));
    const hero = typeof pageHero === "function"
      ? pageHero("會員中心", "查看目前帳號資料、會員權限、VIP 狀態與站內點數。")
      : `<section class="container page-hero"><p class="eyebrow">Account</p><h1>會員中心</h1><p>查看目前帳號資料、會員權限、VIP 狀態與站內點數。</p></section>`;

    return `
      ${hero}
      <section class="container section-tight">
        <div class="grid-2">
          ${panel("帳號資料", [
            `會員名稱：${displayName}`,
            `Email：${email}`,
            `帳號權限：${roleValue}`
          ])}
          ${panel("會員狀態", [
            `會員等級：${roleValue}`,
            `VIP 到期：${vipUntil}`,
            `目前點數：${safeEscape(safeFormatNumber(appState.points))}`
          ])}
        </div>
      </section>
      <section class="container section-tight">
        ${panel("已解鎖內容", unlocked.length ? unlocked : ["目前尚未解鎖內容"])}
      </section>
      <section class="container section-tight account-actions">
        <button type="button" class="secondary" data-auth-action="signout" ${appState.dbLoading ? "disabled" : ""}>登出</button>
      </section>
    `;
  }

  function cleanMisleadingUi() {
    document.querySelectorAll("[data-security-password-panel], .security-password-panel").forEach((node) => node.remove());
    document.querySelectorAll('a[href="/account"]').forEach((node) => {
      if (BANNED_TEXT.some((word) => (node.textContent || "").includes(word))) node.textContent = "會員中心";
    });
    document.querySelectorAll("article, section").forEach((node) => {
      const text = node.textContent || "";
      const isPasswordPanel = Boolean(node.querySelector("[data-security-password-form], input[type='password']"));
      const isOldAccountMenu = ["修改密碼", "登入裝置管理", "通知設定"].some((word) => text.includes(word));
      if (isPasswordPanel || isOldAccountMenu) node.remove();
    });
  }

  function patchRender() {
    if (patched || typeof render !== "function") return patched;
    const originalRender = render;
    render = function accountCleanupRender() {
      const path = location.pathname.replace(/\/+$/, "") || "/";
      if (path === "/account") {
        const app = document.getElementById("app");
        if (app) {
          if (typeof updateSeo === "function") {
            updateSeo({
              slug: "/account",
              title: "會員中心｜黑曜智流 AI",
              description: "查看帳號資料、會員權限、VIP 狀態與站內點數。"
            });
          }
          if (typeof updateNav === "function") updateNav("/account");
          document.body.classList.toggle("auth-only", !stateRef()?.authUser);
          app.innerHTML = typeof brandText === "function" ? brandText(renderCleanAccount()) : renderCleanAccount();
          cleanMisleadingUi();
          return undefined;
        }
      }
      const output = originalRender.apply(this, arguments);
      cleanMisleadingUi();
      return output;
    };
    render.__accountUiCleanupPatched = true;
    patched = true;
    render();
    return true;
  }

  const timer = window.setInterval(() => {
    cleanMisleadingUi();
    if (patchRender()) window.clearInterval(timer);
  }, 30);

  window.setTimeout(() => window.clearInterval(timer), 10000);
})();