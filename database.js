(function () {
  "use strict";

  const config = window.NEXA_SUPABASE || window.PULSEPLAY_SUPABASE || {};
  const hasConfig = Boolean(config.url && config.publishableKey);
  const hasLibrary = Boolean(window.supabase && typeof window.supabase.createClient === "function");
  const client = hasConfig && hasLibrary
    ? window.supabase.createClient(config.url, config.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
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

  async function rpc(name, params) {
    if (!client) return disabledResult();
    const { data, error } = await client.rpc(name, params || {});
    if (error) return { ok: false, message: error.message, error };
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "ok")) return data;
    return { ok: true, data };
  }

  async function getSession() {
    if (!client) return { session: null, user: null };
    const { data } = await client.auth.getSession();
    return {
      session: data.session || null,
      user: data.session ? data.session.user : null
    };
  }

  async function signIn(email, password) {
    if (!client) return disabledResult();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    await recordLoginEvent();
    return { ok: true, message: "登入成功，正在進入主控台。", data };
  }

  async function signInWithLine() {
    if (!client) return disabledResult();
    const redirectTo = `${window.location.origin}/login`;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "line",
      options: { redirectTo }
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "正在前往 LINE 快速登入。", data };
  }

  async function signUp(email, password) {
    if (!client) return disabledResult();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "註冊完成。", data };
  }

  async function signOut() {
    if (!client) return disabledResult();
    const { error } = await client.auth.signOut();
    if (error) return { ok: false, message: error.message };
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("nexaLoginRecorded:"))
      .forEach((key) => sessionStorage.removeItem(key));
    return { ok: true, message: "已成功登出。" };
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
    const { data, error } = await client.from(table).select(query || "*");
    return { data: data || [], error };
  }

  async function bootstrap() {
    if (!client) return disabledResult();
    const session = await getSession();
    const userId = session.user ? session.user.id : null;
    if (userId) await recordLoginEvent().catch(() => null);
    const [site, profile, predictions, categories, products, wallet, pointRows, memberships, referrals, tasks] = await Promise.all([
      select("site_settings", "*"),
      userId ? client.from("users").select("*").eq("id", userId).maybeSingle() : Promise.resolve({ data: null, error: null }),
      select("predictions", "*"),
      select("prediction_categories", "*"),
      select("products", "*"),
      userId ? client.from("wallets").select("*").eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null, error: null }),
      userId ? client.from("point_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null }),
      userId ? client.from("memberships").select("*").eq("user_id", userId).order("expires_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      userId ? client.from("referrals").select("*").eq("referrer_id", userId).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      select("tasks", "*")
    ]);

    const firstError = [site, profile, predictions, categories, products, wallet, pointRows, memberships, referrals, tasks].find((item) => item.error);
    if (firstError) return { ok: false, message: firstError.error.message };

    return {
      ok: true,
      session: session.session,
      user: session.user,
      profile: profile.data,
      siteSettings: site.data || [],
      predictions: predictions.data || [],
      categories: categories.data || [],
      products: products.data || [],
      wallet: wallet.data,
      pointTransactions: pointRows.data || [],
      memberships: memberships.data || [],
      referrals: referrals.data || [],
      tasks: tasks.data || []
    };
  }

  async function fetchAtgSnapshots() {
    if (!client) return disabledResult();
    const { data, error } = await client
      .from("atg_room_snapshots")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return { ok: false, message: error.message, error };
    return { ok: true, data: data || [] };
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
