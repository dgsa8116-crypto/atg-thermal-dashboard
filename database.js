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
    return { ok: true, message: "登入成功。", data };
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
    return { ok: true, message: "已登出。" };
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

  window.NexaDB = {
    ready,
    client,
    getSession,
    signIn,
    signUp,
    signOut,
    bootstrap,
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
