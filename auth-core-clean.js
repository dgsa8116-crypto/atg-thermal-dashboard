"use strict";

(function installAuthCoreClean() {
  const LOGIN_PATH = "/login";
  const GUARD_MAX_MS = 8000;
  const REQUEST_TIMEOUT_MS = 12000;
  const QUERY_TIMEOUT_MS = 7000;
  const SUPER_ADMIN_EMAIL = "set874872@gmail.com";
  const originalPath = `${location.pathname}${location.search || ""}${location.hash || ""}`;
  const originalReplaceState = history.replaceState.bind(history);
  let guardActive = location.pathname !== LOGIN_PATH;
  let renderPatched = false;
  let databasePatched = false;

  function getState() {
    try {
      return typeof state === "undefined" ? null : state;
    } catch (_error) {
      return null;
    }
  }

  function normalizeUrl(url) {
    if (typeof url !== "string") return null;
    try {
      return new URL(url, location.href);
    } catch (_error) {
      return null;
    }
  }

  function timeoutAfter(ms, label) {
    return new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label}逾時，請重新整理後再試。`)), ms);
    });
  }

  function withTimeout(task, ms, label) {
    return Promise.race([task, timeoutAfter(ms, label)]);
  }

  function profileFallback(user) {
    if (!user) return null;
    const email = String(user.email || "").toLowerCase();
    const metadata = user.user_metadata || {};
    return {
      id: user.id || null,
      email,
      display_name: metadata.full_name || metadata.name || metadata.display_name || email.split("@")[0] || "Member",
      avatar_url: metadata.avatar_url || metadata.picture || "",
      line_id: metadata.provider_id || metadata.sub || "",
      role_id: email === SUPER_ADMIN_EMAIL ? "super_admin" : "member",
      status: "active",
      last_login_at: new Date().toISOString()
    };
  }

  function safeData(result, fallback) {
    if (!result || result.error) return fallback;
    return Object.prototype.hasOwnProperty.call(result, "data") ? result.data ?? fallback : result;
  }

  async function safeQuery(task, fallback, label) {
    try {
      return safeData(await withTimeout(task, QUERY_TIMEOUT_MS, label || "資料查詢"), fallback);
    } catch (_error) {
      return fallback;
    }
  }

  function installHistoryGuard() {
    history.replaceState = function guardedReplaceState(stateObject, title, url) {
      const target = normalizeUrl(url);
      if (guardActive && target && target.pathname === LOGIN_PATH && location.pathname !== LOGIN_PATH) {
        return originalReplaceState(stateObject, title, location.href);
      }
      return originalReplaceState(stateObject, title, url);
    };
    history.replaceState.__authCoreCleanPatched = true;

    window.setTimeout(() => {
      const appState = getState();
      if (!guardActive) return;
      releaseGuard(Boolean(!appState?.authUser));
    }, GUARD_MAX_MS);
  }

  function releaseGuard(redirectToLogin) {
    if (!guardActive) return;
    guardActive = false;
    if (history.replaceState.__authCoreCleanPatched) {
      history.replaceState = originalReplaceState;
    }
    if (redirectToLogin && location.pathname !== LOGIN_PATH) {
      originalReplaceState({}, "", LOGIN_PATH);
    }
    window.setTimeout(() => {
      if (typeof render === "function") render();
    }, 0);
  }

  function patchRender() {
    if (renderPatched || typeof render !== "function") return renderPatched;
    const originalRender = render;
    render = function authCoreCleanRender() {
      const output = originalRender.apply(this, arguments);
      const appState = getState();
      const settled = appState
        && (appState.authChecked || appState.authUser || !appState.dbReady)
        && !appState.dbLoading;
      if (guardActive && settled) {
        releaseGuard(Boolean(!appState.authUser));
      }
      return output;
    };
    render.__authCoreCleanPatched = true;
    renderPatched = true;
    return true;
  }

  function patchDatabase() {
    const db = window.NexaDB;
    if (!db || databasePatched || db.__authCoreCleanPatched) return Boolean(db);
    const client = db.client;
    const originalSignIn = db.signIn?.bind(db);
    const originalBootstrap = db.bootstrap?.bind(db);

    if (client?.auth?.signInWithPassword) {
      db.signIn = async function cleanSignIn(email, password) {
        try {
          const { data, error } = await withTimeout(
            client.auth.signInWithPassword({ email, password }),
            REQUEST_TIMEOUT_MS,
            "登入"
          );
          if (error) return { ok: false, message: error.message || "登入失敗" };
          db.recordLoginEvent?.().catch(() => null);
          return { ok: true, message: "登入成功，正在進入主控台。", data };
        } catch (error) {
          if (originalSignIn) {
            try {
              return await withTimeout(originalSignIn(email, password), REQUEST_TIMEOUT_MS, "登入");
            } catch (_fallbackError) {
              return { ok: false, message: error.message || "登入逾時，請重新整理後再試。" };
            }
          }
          return { ok: false, message: error.message || "登入逾時，請重新整理後再試。" };
        }
      };
    }

    if (client?.auth?.getSession && client?.from) {
      db.bootstrap = async function cleanBootstrap() {
        try {
          const { data } = await withTimeout(client.auth.getSession(), REQUEST_TIMEOUT_MS, "Session 還原");
          const session = data?.session || null;
          const user = session?.user || null;
          const userId = user?.id || null;
          if (userId) db.recordLoginEvent?.().catch(() => null);

          const profileTask = userId
            ? client.from("users").select("*").eq("id", userId).maybeSingle()
            : Promise.resolve({ data: null, error: null });
          const walletTask = userId
            ? client.from("wallets").select("*").eq("user_id", userId).maybeSingle()
            : Promise.resolve({ data: null, error: null });
          const pointsTask = userId
            ? client.from("point_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100)
            : Promise.resolve({ data: [], error: null });
          const membershipsTask = userId
            ? client.from("memberships").select("*").eq("user_id", userId).order("expires_at", { ascending: false })
            : Promise.resolve({ data: [], error: null });
          const referralsTask = userId
            ? client.from("referrals").select("*").eq("referrer_id", userId).order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null });

          const [
            siteSettings,
            profile,
            predictions,
            categories,
            products,
            wallet,
            pointTransactions,
            memberships,
            referrals,
            tasks
          ] = await Promise.all([
            safeQuery(client.from("site_settings").select("*"), [], "網站設定"),
            safeQuery(profileTask, profileFallback(user), "會員資料"),
            safeQuery(client.from("predictions").select("*"), [], "預測內容"),
            safeQuery(client.from("prediction_categories").select("*"), [], "分類"),
            safeQuery(client.from("products").select("*"), [], "商品"),
            safeQuery(walletTask, null, "錢包"),
            safeQuery(pointsTask, [], "點數流水"),
            safeQuery(membershipsTask, [], "會員方案"),
            safeQuery(referralsTask, [], "推廣資料"),
            safeQuery(client.from("tasks").select("*"), [], "任務")
          ]);

          return {
            ok: true,
            session,
            user,
            profile: profile || profileFallback(user),
            siteSettings,
            predictions,
            categories,
            products,
            wallet,
            pointTransactions,
            memberships,
            referrals,
            tasks
          };
        } catch (error) {
          if (originalBootstrap) {
            try {
              const fallback = await withTimeout(originalBootstrap(), REQUEST_TIMEOUT_MS, "登入資料同步");
              if (fallback?.ok) return fallback;
            } catch (_fallbackError) {
              // Return a controlled failure below.
            }
          }
          return { ok: false, message: error.message || "登入資料同步失敗。" };
        }
      };
    }

    db.__authCoreCleanPatched = true;
    databasePatched = true;
    return true;
  }

  function tick() {
    patchDatabase();
    patchRender();
    const appState = getState();
    const settled = appState
      && (appState.authChecked || appState.authUser || !appState.dbReady)
      && !appState.dbLoading;
    if (guardActive && settled) {
      releaseGuard(Boolean(!appState.authUser));
      return;
    }
    if (appState?.authUser && originalPath && location.pathname === LOGIN_PATH) {
      originalReplaceState({}, "", originalPath);
    }
  }

  installHistoryGuard();
  const timer = window.setInterval(tick, 30);
  window.setTimeout(() => window.clearInterval(timer), GUARD_MAX_MS + 2000);
})();
