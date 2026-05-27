(function () {
  "use strict";

  const config = window.PULSEPLAY_SUPABASE || {};
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

  async function tableSelect(table, query) {
    if (!client) return { data: [], error: disabledResult() };
    let builder = client.from(table).select(query || "*");
    const { data, error } = await builder;
    return { data: data || [], error };
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
    return { ok: true, message: "註冊完成，請依專案設定完成驗證。", data };
  }

  async function signOut() {
    if (!client) return disabledResult();
    const { error } = await client.auth.signOut();
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "已登出。" };
  }

  async function loadBootstrap() {
    if (!client) return disabledResult();
    const session = await getSession();
    const [profileRes, tasksRes, userTasksRes, productsRes, inventoryRes, ledgerRes, predictionsRes] = await Promise.all([
      session.user ? client.from("profiles").select("*").eq("id", session.user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      tableSelect("tasks", "*"),
      session.user ? client.from("user_tasks").select("*").eq("user_id", session.user.id) : Promise.resolve({ data: [], error: null }),
      tableSelect("products", "*"),
      session.user ? client.from("inventory_items").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      session.user ? client.from("point_ledger").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(80) : Promise.resolve({ data: [], error: null }),
      tableSelect("predictions", "*")
    ]);

    const firstError = [profileRes, tasksRes, userTasksRes, productsRes, inventoryRes, ledgerRes, predictionsRes].find((item) => item.error);
    if (firstError) return { ok: false, message: firstError.error.message };

    return {
      ok: true,
      session: session.session,
      user: session.user,
      profile: profileRes.data,
      tasks: tasksRes.data || [],
      userTasks: userTasksRes.data || [],
      products: productsRes.data || [],
      inventory: inventoryRes.data || [],
      ledger: ledgerRes.data || [],
      predictions: predictionsRes.data || []
    };
  }

  function onAuthChange(callback) {
    if (!client) return function () {};
    const { data } = client.auth.onAuthStateChange(() => callback());
    return function () {
      data.subscription.unsubscribe();
    };
  }

  window.PulsePlayDB = {
    ready,
    client,
    getSession,
    signIn,
    signUp,
    signOut,
    loadBootstrap,
    onAuthChange,
    claimDailyCheckin: () => rpc("claim_daily_checkin"),
    startTask: (taskId) => rpc("start_task", { p_task_id: taskId }),
    redeemProduct: (productId) => rpc("redeem_product", { p_product_id: productId }),
    useInventoryItem: (itemId) => rpc("use_inventory_item", { p_item_id: itemId }),
    adminListProfiles: () => rpc("admin_list_profiles"),
    adminUpdateProfile: (userId, payload) => rpc("admin_update_profile", { p_user_id: userId, p_payload: payload }),
    adminAdjustPoints: (userId, amount, reason) => rpc("admin_adjust_points", { p_user_id: userId, p_amount: amount, p_reason: reason }),
    adminSetUserRole: (userId, role) => rpc("admin_set_user_role", { p_user_id: userId, p_role: role })
  };
})();
