"use strict";

(function installAuthRefreshFix() {
  const LOGIN_PATH = "/login";
  const MAX_GUARD_MS = 10000;
  const initialPath = `${location.pathname}${location.search}${location.hash}`;
  const shouldGuard = location.pathname !== LOGIN_PATH;
  const startedAt = Date.now();
  const originalReplaceState = history.replaceState.bind(history);
  let guardActive = shouldGuard;
  let renderPatched = false;

  window.__OBSIDIAN_AUTH_REFRESH_FIX__ = {
    initialPath,
    release,
    isActive: () => guardActive
  };

  history.replaceState = function guardedReplaceState(stateObject, title, url) {
    const target = normalizeUrl(url);
    if (guardActive && target && target.pathname === LOGIN_PATH && location.pathname !== LOGIN_PATH) {
      return originalReplaceState(stateObject, title, location.href);
    }
    return originalReplaceState(stateObject, title, url);
  };

  history.replaceState.__obsidianAuthRefreshPatched = true;

  const patchTimer = window.setInterval(() => {
    if (patchRender()) {
      window.clearInterval(patchTimer);
    }
    if (Date.now() - startedAt > MAX_GUARD_MS) {
      window.clearInterval(patchTimer);
      release();
    }
  }, 25);

  window.setTimeout(() => {
    if (guardActive) release();
  }, MAX_GUARD_MS);

  function normalizeUrl(url) {
    if (typeof url !== "string") return null;
    try {
      return new URL(url, location.href);
    } catch (_error) {
      return null;
    }
  }

  function getAppState() {
    try {
      return typeof state === "undefined" ? null : state;
    } catch (_error) {
      return null;
    }
  }

  function patchRender() {
    if (renderPatched || typeof render !== "function") return renderPatched;

    const originalRender = render;
    render = function authRefreshAwareRender() {
      const appState = getAppState();
      const path = location.pathname.replace(/\/+$/, "") || "/";
      const isLoginPath = path === LOGIN_PATH;
      const isRestoring = guardActive
        && !isLoginPath
        && appState
        && !appState.authUser
        && (!appState.authChecked || appState.dbLoading);

      if (isRestoring) {
        renderRestoringState();
        return undefined;
      }

      const output = originalRender.apply(this, arguments);
      const nextState = getAppState();
      const isSettled = nextState
        && (nextState.authChecked || nextState.authUser || !nextState.dbReady)
        && !nextState.dbLoading;

      if (guardActive && isSettled) {
        release();
        if (!nextState.authUser && location.pathname !== LOGIN_PATH) {
          originalReplaceState({}, "", LOGIN_PATH);
        }
      }

      return output;
    };

    render.__authRefreshFixPatched = true;
    renderPatched = true;
    render();
    return true;
  }

  function renderRestoringState() {
    const app = document.getElementById("app");
    if (!app) return;

    document.body.classList.add("auth-only");
    document.body.dataset.role = "guest";

    if (app.querySelector("[data-auth-restoring]")) return;

    app.innerHTML = `
      <section class="login-scene" data-auth-restoring>
        <div class="login-ambient"></div>
        <div class="login-card standalone-login energy-border">
          <div class="login-brand">
            <img class="login-logo" src="./assets/obsidian-logo.png" alt="黑曜智流 AI Logo">
            <div>
              <p class="eyebrow">身份驗證</p>
              <h1>正在恢復登入狀態</h1>
            </div>
          </div>
          <p class="login-copy">正在確認你的登入資料，請稍候。</p>
          <p class="login-note">刷新頁面時系統會先還原 Session，再依照帳號權限回到原本頁面。</p>
          <p class="auth-status">載入中...</p>
        </div>
      </section>
    `;
  }

  function release() {
    guardActive = false;
    if (history.replaceState.__obsidianAuthRefreshPatched) {
      history.replaceState = originalReplaceState;
    }
  }
})();