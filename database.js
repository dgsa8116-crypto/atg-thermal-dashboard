(function () {
  "use strict";

  const REQUEST_TIMEOUT_MS = 12000;
  const QUERY_TIMEOUT_MS = 7000;
  const SUPER_ADMIN_EMAIL = "set874872@gmail.com";

  const config = window.NEXA_SUPABASE || window.PULSEPLAY_SUPABASE || {};
  const hasConfig = Boolean(config.url && config.publishableKey);
  const hasLibrary = Boolean(window.supabase && typeof window.supabase.createClient === "function");
  const client = hasConfig && hasLibrary
    ? window.supabase.createClient(config.url, config.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce"
        }
      })
    : null;

  function ready() {
    return Boolean(client);
  }

  function disabledResult() {
    return {
      ok: false,
      message: hasConfig ? "Supabase SDK 尚未載入。" : "尚未設定 Supabase。"
    };
  }

  function timeout(ms, label) {
    return new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} 逾時`)), ms);
    });
  }

  function withTimeout(task, ms, label) {
    return Promise.race([task, timeout(ms, label)]);
  }

  function profileFallback(user) {
    if (!user) return null;
    const email = String(user.email || "").toLowerCase();
    const metadata = user.user_metadata || {};
    return {
      id: user.id,
      email,
      display_name: metadata.full_name || metadata.name || metadata.display_name || email.split("@")[0] || "Member",
      avatar_url: metadata.avatar_url || metadata.picture || "",
      line_id: metadata.provider_id || metadata.sub || "",
      role_id: email === SUPER_ADMIN_EMAIL ? "super_admin" : "member",
      status: "active",
      last_login_at: new Date().toISOString()
    };
  }

  function normalizeQueryResult(result, fallback) {
    if (!result || result.error) return fallback;
    if (Object.prototype.hasOwnProperty.call(result, "data")) return result.data ?? fallback;
    return result ?? fallback;
  }

  async function safeQuery(task, fallback, label) {
    try {
      return normalizeQueryResult(await withTimeout(task, QUERY_TIMEOUT_MS, label || "資料查詢"), fallback);
    } catch (_error) {
      return fallback;
    }
  }

  async function rpc(name, params) {
    if (!client) return disabledResult();
    try {
      const { data, error } = await withTimeout(client.rpc(name, params || {}), REQUEST_TIMEOUT_MS, name);
      if (error) return { ok: false, message: error.message, error };
      if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "ok")) return data;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, message: error.message || "請求逾時，請稍後再試。", error };
    }
  }

  async function getSession() {
    if (!client) return { session: null, user: null };
    try {
      const { data } = await withTimeout(client.auth.getSession(), REQUEST_TIMEOUT_MS, "Session 還原");
      return {
        session: data.session || null,
        user: data.session ? data.session.user : null
      };
    } catch (_error) {
      return { session: null, user: null };
    }
  }

  async function signIn(email, password) {
    if (!client) return disabledResult();
    try {
      const { data, error } = await withTimeout(
        client.auth.signInWithPassword({ email, password }),
        REQUEST_TIMEOUT_MS,
        "登入"
      );
      if (error) return { ok: false, message: error.message || "登入失敗" };
      recordLoginEvent().catch(() => null);
      return { ok: true, message: "登入成功，正在進入主控台。", data };
    } catch (error) {
      return { ok: false, message: error.message || "登入逾時，請重新整理後再試。", error };
    }
  }

  async function signInWithLine() {
    if (!client) return disabledResult();
    try {
      const redirectTo = `${window.location.origin}/login`;
      const { data, error } = await withTimeout(
        client.auth.signInWithOAuth({
          provider: "line",
          options: { redirectTo }
        }),
        REQUEST_TIMEOUT_MS,
        "LINE 快速登入"
      );
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "正在前往 LINE 快速登入。", data };
    } catch (error) {
      return { ok: false, message: error.message || "LINE 快速登入逾時。", error };
    }
  }

  async function signUp(email, password) {
    if (!client) return disabledResult();
    try {
      const { data, error } = await withTimeout(client.auth.signUp({ email, password }), REQUEST_TIMEOUT_MS, "註冊");
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "註冊完成。", data };
    } catch (error) {
      return { ok: false, message: error.message || "註冊逾時，請稍後再試。", error };
    }
  }

  async function signOut() {
    if (!client) return disabledResult();
    try {
      const { error } = await withTimeout(client.auth.signOut(), REQUEST_TIMEOUT_MS, "登出");
      if (error) return { ok: false, message: error.message };
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith("nexaLoginRecorded:"))
        .forEach((key) => sessionStorage.removeItem(key));
      return { ok: true, message: "已成功登出。" };
    } catch (error) {
      return { ok: false, message: error.message || "登出逾時，請稍後再試。", error };
    }
  }

  async function recordLoginEvent() {
    if (!client) return disabledResult();
    const { user } = await getSession();
    if (!user) return { ok: false, message: "尚未登入。" };
    const key = `nexaLoginRecorded:${user.id}`;
    if (sessionStorage.getItem(key)) return { ok: true, message: "本次瀏覽已記錄登入。" };
    const result = await rpc("record_login_event", {});
    if (result.ok) sessionStorage.setItem(key, "1");
    return result;
  }

  async function select(table, query) {
    if (!client) return { data: [], error: disabledResult() };
    return client.from(table).select(query || "*");
  }

  async function bootstrap() {
    if (!client) return disabledResult();

    const session = await getSession();
    const userId = session.user ? session.user.id : null;
    if (userId) recordLoginEvent().catch(() => null);

    const siteTask = select("site_settings", "*");
    const profileTask = userId
      ? client.from("users").select("*").eq("id", userId).maybeSingle()
      : Promise.resolve({ data: null, error: null });
    const predictionsTask = select("predictions", "*");
    const categoriesTask = select("prediction_categories", "*");
    const productsTask = select("products", "*");
    const walletTask = userId
      ? client.from("wallets").select("*").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null, error: null });
    const pointRowsTask = userId
      ? client.from("point_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100)
      : Promise.resolve({ data: [], error: null });
    const membershipsTask = userId
      ? client.from("memberships").select("*").eq("user_id", userId).order("expires_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });
    const referralsTask = userId
      ? client.from("referrals").select("*").eq("referrer_id", userId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });
    const tasksTask = select("tasks", "*");

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
      safeQuery(siteTask, [], "網站設定"),
      safeQuery(profileTask, profileFallback(session.user), "會員資料"),
      safeQuery(predictionsTask, [], "預測內容"),
      safeQuery(categoriesTask, [], "分類"),
      safeQuery(productsTask, [], "商品"),
      safeQuery(walletTask, null, "錢包"),
      safeQuery(pointRowsTask, [], "點數流水"),
      safeQuery(membershipsTask, [], "會員方案"),
      safeQuery(referralsTask, [], "推廣資料"),
      safeQuery(tasksTask, [], "任務")
    ]);

    return {
      ok: true,
      session: session.session,
      user: session.user,
      profile: profile || profileFallback(session.user),
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
  }

  async function fetchAtgSnapshots() {
    if (!client) return disabledResult();
    try {
      const { data, error } = await withTimeout(
        client.from("atg_room_snapshots").select("*").order("updated_at", { ascending: false }),
        QUERY_TIMEOUT_MS,
        "即時資料"
      );
      if (error) return { ok: false, message: error.message, error };
      return { ok: true, data: data || [] };
    } catch (error) {
      return { ok: false, message: error.message || "即時資料讀取逾時。", error };
    }
  }

  function subscribeAtgSnapshots(callback) {
    if (!client) return function () {};
    const channel = client
      .channel("atg-room-snapshots")
      .on("postgres_changes", { event: "*", schema: "public", table: "atg_room_snapshots" }, callback)
      .subscribe();
    return function () {
      client.removeChannel(channel);
    };
  }

  window.NexaDB = {
    ready,
    client,
    getSession,
    signIn,
    signInWithLine,
    signUp,
    signOut,
    recordLoginEvent,
    bootstrap,
    fetchAtgSnapshots,
    subscribeAtgSnapshots,
    onAuthChange: (callback) => {
      if (!client) return function () {};
      const { data } = client.auth.onAuthStateChange(() => callback());
      return function () {
        data.subscription.unsubscribe();
      };
    },
    unlockPrediction: (predictionId) => rpc("unlock_prediction", { p_prediction_id: predictionId }),
    submitTask: (taskId) => rpc("submit_task", { p_task_id: taskId }),
    createOrder: (productId) => rpc("create_order", { p_product_id: productId }),
    redeemProduct: (productId) => rpc("redeem_product", { p_product_id: productId }),
    adminAdjustPoints: (userId, amount, reason) => rpc("admin_adjust_points", { p_user_id: userId, p_amount: amount, p_reason: reason }),
    adminReviewReferralReward: (rewardId, approved, reason) => rpc("admin_review_referral_reward", { p_reward_id: rewardId, p_approved: approved, p_reason: reason })
  };
})();
