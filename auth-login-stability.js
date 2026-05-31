"use strict";

(function installAuthLoginStability() {
  const BOOTSTRAP_TIMEOUT_MS = 7000;
  const SIGNIN_TIMEOUT_MS = 12000;
  const SUPER_ADMIN_EMAIL = "set874872@gmail.com";

  function timeoutAfter(ms, label) {
    return new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timeout`)), ms);
    });
  }

  function buildFallbackProfile(user) {
    const email = String(user?.email || "").toLowerCase();
    const name = user?.user_metadata?.full_name
      || user?.user_metadata?.name
      || user?.user_metadata?.display_name
      || (email ? email.split("@")[0] : "Member");
    return {
      id: user?.id || null,
      email,
      display_name: name,
      avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "",
      role_id: email === SUPER_ADMIN_EMAIL ? "super_admin" : "member",
      status: "active"
    };
  }

  function fallbackBootstrap(user, message) {
    return {
      ok: true,
      message: message || "登入成功，資料同步稍後完成。",
      session: null,
      user,
      profile: buildFallbackProfile(user),
      siteSettings: [],
      predictions: [],
      categories: [],
      products: [],
      wallet: null,
      pointTransactions: [],
      memberships: [],
      referrals: [],
      tasks: []
    };
  }

  function patchDatabase() {
    const db = window.NexaDB;
    if (!db || db.__authLoginStabilityPatched) return Boolean(db);

    const originalBootstrap = db.bootstrap?.bind(db);
    const originalSignIn = db.signIn?.bind(db);

    if (db.client?.auth?.signInWithPassword) {
      db.signIn = async function stableSignIn(email, password) {
        try {
          const signInTask = db.client.auth.signInWithPassword({ email, password });
          const { data, error } = await Promise.race([signInTask, timeoutAfter(SIGNIN_TIMEOUT_MS, "signIn")]);
          if (error) return { ok: false, message: error.message || "登入失敗" };
          db.recordLoginEvent?.().catch(() => null);
          return { ok: true, message: "登入成功，正在進入主控台。", data };
        } catch (error) {
          if (originalSignIn) {
            try {
              return await Promise.race([originalSignIn(email, password), timeoutAfter(SIGNIN_TIMEOUT_MS, "originalSignIn")]);
            } catch (_fallbackError) {
              return { ok: false, message: error.message || "登入逾時，請重新整理後再試。" };
            }
          }
          return { ok: false, message: error.message || "登入逾時，請重新整理後再試。" };
        }
      };
    }

    if (originalBootstrap) {
      db.bootstrap = async function stableBootstrap() {
        try {
          const result = await Promise.race([originalBootstrap(), timeoutAfter(BOOTSTRAP_TIMEOUT_MS, "bootstrap")]);
          if (result?.ok) return result;
          const session = db.getSession ? await db.getSession() : { user: null };
          if (session?.user) return fallbackBootstrap(session.user, result?.message || "登入成功，部分資料仍在同步中。");
          return result || { ok: false, message: "尚未登入。" };
        } catch (error) {
          try {
            const session = db.getSession ? await db.getSession() : { user: null };
            if (session?.user) return fallbackBootstrap(session.user, "登入成功，部分資料仍在同步中。");
          } catch (_sessionError) {
            // Return the original error below.
          }
          return { ok: false, message: error.message || "登入資料同步失敗，請稍後再試。" };
        }
      };
    }

    db.__authLoginStabilityPatched = true;
    return true;
  }

  function patchStuckLoadingGuard() {
    let loadingSince = null;
    const timer = window.setInterval(() => {
      try {
        const appState = typeof state === "undefined" ? null : state;
        if (!appState) return;
        if (!appState.dbLoading) {
          loadingSince = null;
          return;
        }
        if (loadingSince === null) loadingSince = Date.now();
        if (Date.now() - loadingSince > SIGNIN_TIMEOUT_MS + 3000) {
          appState.dbLoading = false;
          appState.authChecked = true;
          appState.authMessage = appState.authUser
            ? "登入成功，資料同步稍後完成。"
            : "登入逾時，請重新整理後再試。";
          if (typeof render === "function") render();
          loadingSince = null;
        }
      } catch (_error) {
        window.clearInterval(timer);
      }
    }, 1000);
  }

  patchDatabase();
  patchStuckLoadingGuard();
  const timer = window.setInterval(() => {
    if (patchDatabase()) window.clearInterval(timer);
  }, 30);
  window.setTimeout(() => window.clearInterval(timer), 10000);
})();
