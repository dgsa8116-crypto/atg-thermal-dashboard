"use strict";

(function installAdminSecurityUpgrade() {
  const SUPER_EMAIL = "set874872@gmail.com";
  const ROLE_LABELS = { super_admin: "最高管理員", admin: "一般管理員", manager: "營運主管", assistant: "小助理", support: "客服人員", editor: "內容編輯", member: "一般會員", user: "一般使用者", guest: "訪客" };
  const ROLE_LEVELS = { super_admin: 100, admin: 80, manager: 70, editor: 60, assistant: 50, support: 40, member: 0, user: 0, guest: -10 };
  const ASSIGNABLE = { super_admin: ["admin", "manager", "assistant", "support", "editor", "member", "user"], admin: ["assistant", "support", "member", "user"] };
  let renderPatched = false;
  let dbPatched = false;
  let loadingUsers = false;
  let lastMessage = "";

  function s() { try { return typeof state === "undefined" ? null : state; } catch (_error) { return null; } }
  function h(value) { if (typeof escapeHtml === "function") return escapeHtml(value); return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }
  function email() { return String(s()?.authUser?.email || s()?.profile?.email || "").toLowerCase(); }
  function roleOf(user) { if (String(user?.email || "").toLowerCase() === SUPER_EMAIL) return "super_admin"; return user?.role_id || user?.role || "member"; }
  function currentRoleValue() { return email() === SUPER_EMAIL ? "super_admin" : roleOf(s()?.profile || {}); }
  function level(role) { return ROLE_LEVELS[role] ?? 0; }
  function label(role) { return ROLE_LABELS[role] || role || "未設定"; }
  function canAdmin() { return level(currentRoleValue()) >= 40; }
  function canManageRoles() { return ["super_admin", "admin"].includes(currentRoleValue()); }
  function assignableRoles() { return ASSIGNABLE[currentRoleValue()] || []; }
  function msg(text) { lastMessage = text || ""; if (typeof showToast === "function") showToast(text); }
  function brand(html) { return typeof brandText === "function" ? brandText(html) : html; }
  function bar() { return typeof renderPermissionBar === "function" ? renderPermissionBar() : ""; }

  function patchRoleHelpers() {
    if (typeof currentRole === "function" && !currentRole.__adminSecurityPatched) {
      const old = currentRole;
      currentRole = function patchedCurrentRole() { return email() === SUPER_EMAIL ? "super_admin" : old.apply(this, arguments); };
      currentRole.__adminSecurityPatched = true;
    }
    if (typeof canAccessAdmin === "function" && !canAccessAdmin.__adminSecurityPatched) {
      const old = canAccessAdmin;
      canAccessAdmin = function patchedCanAccessAdmin() { return canAdmin() || old.apply(this, arguments); };
      canAccessAdmin.__adminSecurityPatched = true;
    }
    if (typeof canAccessRoute === "function" && !canAccessRoute.__adminSecurityPatched) {
      const old = canAccessRoute;
      canAccessRoute = function patchedCanAccessRoute(path) { return path === "/admin/roles" ? canManageRoles() : old.apply(this, arguments); };
      canAccessRoute.__adminSecurityPatched = true;
    }
  }

  function patchDb() {
    const db = window.NexaDB;
    if (!db || dbPatched) return Boolean(db);
    db.updatePassword = async function updatePassword(currentPassword, newPassword) {
      if (!db.client) return { ok: false, message: "尚未連接身份驗證服務。" };
      const { data, error: sessionError } = await db.client.auth.getSession();
      if (sessionError) return { ok: false, message: sessionError.message };
      const user = data?.session?.user;
      if (!user) return { ok: false, message: "請先登入後再修改密碼。" };
      if (currentPassword && user.email) {
        const { error } = await db.client.auth.signInWithPassword({ email: user.email, password: currentPassword });
        if (error) return { ok: false, message: "目前密碼驗證失敗。" };
      }
      const { error } = await db.client.auth.updateUser({ password: newPassword });
      return error ? { ok: false, message: error.message } : { ok: true, message: "密碼已更新，請妥善保存新密碼。" };
    };
    db.adminListRoleUsers = async function adminListRoleUsers() {
      if (!db.client) return { ok: false, users: [], message: "尚未連接資料庫。" };
      const rpc = await db.client.rpc("admin_list_role_users");
      if (!rpc.error) return { ok: true, users: rpc.data || [] };
      const { data, error } = await db.client.from("users").select("id,email,display_name,role_id,status,current_login_at,last_login_at,login_count").order("current_login_at", { ascending: false, nullsFirst: false }).limit(100);
      return error ? { ok: false, users: [], message: error.message } : { ok: true, users: data || [] };
    };
    db.adminAssignRoleByEmail = async function adminAssignRoleByEmail(targetEmail, roleId, reason) {
      if (!db.client) return { ok: false, message: "尚未連接資料庫。" };
      const { data, error } = await db.client.rpc("admin_assign_role_by_email", { p_target_email: targetEmail, p_role_id: roleId, p_reason: reason });
      if (error) return { ok: false, message: error.message };
      return data && typeof data === "object" ? data : { ok: true, message: "帳號權限已更新。" };
    };
    dbPatched = true;
    return true;
  }

  function ensureNav() {
    const nav = document.getElementById("siteNav");
    if (!nav) return;
    let link = nav.querySelector('a[href="/admin/roles"]');
    if (!link) {
      link = document.createElement("a");
      link.href = "/admin/roles";
      link.textContent = "權限控管";
      link.setAttribute("data-link", "");
      const admin = nav.querySelector('a[href="/admin"]');
      if (admin?.nextSibling) nav.insertBefore(link, admin.nextSibling); else nav.appendChild(link);
    }
    link.hidden = !canManageRoles();
    link.classList.toggle("active", location.pathname === "/admin/roles");
  }

  function loadUsers() {
    const st = s();
    if (!canManageRoles() || loadingUsers || st?.adminRoleUsers) return;
    const db = window.NexaDB;
    if (!patchDb() || !db?.adminListRoleUsers) return;
    loadingUsers = true;
    db.adminListRoleUsers().then((result) => {
      const next = s();
      if (next) { next.adminRoleUsers = result.ok ? result.users || [] : []; next.adminRoleError = result.ok ? "" : result.message || "無法載入帳號列表。"; }
    }).catch((error) => { const next = s(); if (next) next.adminRoleError = error.message || "無法載入帳號列表。"; }).finally(() => { loadingUsers = false; if (location.pathname === "/admin/roles" && typeof render === "function") render(); });
  }

  function normalizedUsers() {
    const map = new Map();
    (s()?.adminRoleUsers || []).forEach((user) => {
      const key = String(user.email || user.id || "").toLowerCase();
      if (!key) return;
      map.set(key, { id: user.id || "", email: String(user.email || "").toLowerCase(), display_name: user.display_name || "", role_id: roleOf(user), status: user.status || "active", current_login_at: user.current_login_at || "", login_count: user.login_count || 0 });
    });
    if (!map.has(SUPER_EMAIL)) map.set(SUPER_EMAIL, { email: SUPER_EMAIL, display_name: "最高管理員", role_id: "super_admin", status: "active", current_login_at: "", login_count: 0 });
    return Array.from(map.values()).sort((a, b) => level(b.role_id) - level(a.role_id));
  }

  function renderStat(name, value, note) {
    if (typeof statCard === "function") return statCard(name, value, note).replace("stat-card", "stat-card energy-border role-stat");
    return `<article class="stat-card energy-border role-stat"><span>${h(name)}</span><strong>${h(value)}</strong><small>${h(note)}</small></article>`;
  }

  function renderRoleRule(title, subtitle, items) {
    return `<article class="role-rule-card energy-border"><p class="eyebrow">${h(subtitle)}</p><h2>${h(title)}</h2><ul>${items.map((item) => `<li>${h(item)}</li>`).join("")}</ul></article>`;
  }

  function renderUsersTable(users) {
    const rows = users.map((u) => `<tr><td>${h(u.display_name || "-")}</td><td>${h(u.email || "-")}</td><td><span class="pill">${h(label(u.role_id))}</span></td><td>${h(u.status || "-")}</td><td>${h(u.current_login_at || "-")}</td><td>${h(String(u.login_count || 0))}</td></tr>`).join("");
    return `<div class="table-card energy-border"><table class="role-users-table"><thead><tr><th>顯示名稱</th><th>Email</th><th>帳號權限</th><th>狀態</th><th>最近登入</th><th>登入次數</th></tr></thead><tbody>${rows || `<tr><td colspan="6">正在載入帳號列表...</td></tr>`}</tbody></table></div>`;
  }

  function renderPanel() {
    const st = s() || {};
    const users = normalizedUsers();
    const canAssign = assignableRoles();
    const targetOptions = users.map((user) => `<option value="${h(user.email)}">${h(user.display_name || user.email)}｜${h(label(user.role_id))}</option>`).join("");
    return `${bar()}<section class="container page-hero role-admin-hero"><p class="eyebrow">Super Admin Panel</p><h1>最高管理員權限控管</h1><p>最高管理員擁有全系統權限，可指派一般管理員；一般管理員可指派小助理。所有正式指派需由後端 RPC 驗證並寫入 audit log。</p><div class="hero-actions"><a class="button" href="/admin" data-link>管理後台</a><a class="button secondary" href="/account" data-link>安全設定</a></div></section><section class="container section-tight"><div class="stats-strip">${renderStat("目前權限", label(currentRoleValue()), "依帳號角色判斷")}${renderStat("最高管理員", SUPER_EMAIL, "固定最高權限信箱")}${renderStat("可指派角色", canAssign.map(label).join("、") || "無", "後端同步檢查")}${renderStat("操作紀錄", "audit_logs", "每次變更都留痕")}</div></section><section class="container role-grid section-tight">${renderRoleRule("最高管理員", "全系統最高權限", ["可進入所有管理頁", "可指派一般管理員與小助理", "可調整白標、SEO、點數與風控", "固定信箱：" + SUPER_EMAIL])}${renderRoleRule("一般管理員", "營運管理權限", ["可進入管理後台", "可管理會員、內容與任務", "可指派小助理", "不可建立最高管理員"])}${renderRoleRule("小助理", "協作與查詢權限", ["可查看授權範圍資料", "協助處理會員與內容", "不可調整最高權限", "不可指派管理員"])}${renderRoleRule("一般會員", "前台使用權限", ["可查看會員內容", "可使用點數與任務", "不可進入管理後台"])}</section><section class="container section-tight"><article class="panel energy-border role-assign-panel"><div><p class="eyebrow">Role Assignment</p><h2>指派帳號權限</h2><p>請選擇已註冊且至少登入過一次的帳號。若名單尚未載入，可直接輸入 Email。</p>${st.adminRoleError ? `<p class="auth-status error">${h(st.adminRoleError)}</p>` : ""}${lastMessage ? `<p class="auth-status">${h(lastMessage)}</p>` : ""}</div><form class="role-form" data-role-assign-form><label><span>目標帳號 Email</span><input name="email" list="roleUserEmails" type="email" placeholder="member@example.com" required><datalist id="roleUserEmails">${targetOptions}</datalist></label><label><span>新帳號權限</span><select name="role" required>${canAssign.map((role) => `<option value="${h(role)}">${h(label(role))}</option>`).join("")}</select></label><label><span>變更原因</span><textarea name="reason" rows="3" required></textarea></label><button class="button" type="submit">儲存設定</button></form></article></section><section class="container section"><div class="section-head"><div><p class="eyebrow">Account List</p><h2>帳號權限列表</h2><p>正式資料來自 Supabase users 表。</p></div></div>${renderUsersTable(users)}</section>`;
  }

  function renderRolesRoute() {
    if (!s()?.authUser) { if (typeof navigate === "function") navigate("/login"); return; }
    document.body.classList.toggle("auth-only", false);
    document.body.dataset.role = currentRoleValue();
    if (typeof updateSeo === "function") updateSeo({ slug: "/admin/roles", title: "權限控管｜黑曜智流 AI", description: "最高管理員、一般管理員與小助理權限控管。" });
    if (typeof updateNav === "function") updateNav("/admin/roles");
    ensureNav();
    const app = document.getElementById("app");
    if (!app) return;
    if (!canManageRoles()) { app.innerHTML = brand(`${bar()}<section class="container page-hero"><p class="eyebrow">Access Control</p><h1>權限不足</h1><p>只有最高管理員與一般管理員可以進入權限控管面板。</p><a class="button" href="/" data-link>回主控台</a></section>`); return; }
    loadUsers();
    app.innerHTML = brand(renderPanel());
  }

  function securityPanel() {
    const userEmail = s()?.authUser?.email || "LINE OAuth 帳號";
    return `<section class="container section-tight" data-security-password-panel><article class="panel energy-border security-password-panel"><div><p class="eyebrow">Security Settings</p><h2>安全設定與修改密碼</h2><p>目前登入帳號：${h(userEmail)}</p><p>建議密碼至少 8 碼，並混合大小寫、數字與符號。</p></div><form class="security-form" data-security-password-form><label><span>目前密碼</span><input name="currentPassword" type="password" autocomplete="current-password" placeholder="Email 登入帳號建議填寫"></label><label><span>新密碼</span><input name="newPassword" type="password" autocomplete="new-password" minlength="8" required></label><label><span>確認新密碼</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label><button class="button" type="submit">儲存設定</button></form></article></section>`;
  }

  function injectSecurityPanel() {
    const app = document.getElementById("app");
    if (!app || !s()?.authUser || app.querySelector("[data-security-password-panel]")) return;
    app.insertAdjacentHTML("beforeend", brand(securityPanel()));
  }

  async function handleRoleAssign(form) {
    const db = window.NexaDB;
    const targetEmail = String(form.elements.email?.value || "").trim().toLowerCase();
    const role = String(form.elements.role?.value || "").trim();
    const reason = String(form.elements.reason?.value || "").trim();
    if (!targetEmail || !role || !reason) return msg("請完整填寫帳號、角色與變更原因。");
    if (!assignableRoles().includes(role)) return msg("你的帳號權限不足，無法指派此角色。");
    if (targetEmail === SUPER_EMAIL) return msg("最高管理員帳號不可降級或改派。");
    if (!db?.adminAssignRoleByEmail) return msg("權限 RPC 尚未載入，請重新整理後再試。");
    const result = await db.adminAssignRoleByEmail(targetEmail, role, reason);
    msg(result.message || (result.ok ? "帳號權限已更新。" : "帳號權限更新失敗。"));
    if (result.ok) { const st = s(); if (st) st.adminRoleUsers = null; form.reset(); loadUsers(); }
  }

  async function handlePasswordUpdate(form) {
    const db = window.NexaDB;
    const currentPassword = String(form.elements.currentPassword?.value || "");
    const newPassword = String(form.elements.newPassword?.value || "");
    const confirmPassword = String(form.elements.confirmPassword?.value || "");
    if (newPassword.length < 8) return msg("新密碼至少需要 8 碼。");
    if (newPassword !== confirmPassword) return msg("兩次輸入的新密碼不一致。");
    if (!db?.updatePassword) return msg("密碼更新功能尚未載入，請重新整理後再試。");
    const result = await db.updatePassword(currentPassword, newPassword);
    msg(result.message || (result.ok ? "密碼已更新。" : "密碼更新失敗。"));
    if (result.ok) form.reset();
  }

  function injectStyles() {
    if (document.getElementById("adminSecurityUpgradeStyles")) return;
    const style = document.createElement("style");
    style.id = "adminSecurityUpgradeStyles";
    style.textContent = `.role-admin-hero .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.role-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.role-rule-card{padding:18px;border-radius:22px;background:linear-gradient(145deg,rgba(2,16,8,.92),rgba(9,38,18,.72))}.role-rule-card h2{margin:6px 0 12px}.role-rule-card ul{display:grid;gap:8px;margin:0;padding-left:18px;color:var(--muted)}.role-assign-panel,.security-password-panel{display:grid;grid-template-columns:minmax(0,.9fr) minmax(320px,1.1fr);gap:18px;align-items:start;padding:22px}.role-form,.security-form{display:grid;gap:14px}.role-form label,.security-form label{display:grid;gap:7px;color:#dfffe7;font-weight:800}.role-form input,.role-form select,.role-form textarea,.security-form input{width:100%;border:1px solid rgba(86,255,135,.35);border-radius:14px;background:rgba(0,0,0,.34);color:#f2fff5;padding:12px 13px;outline:none}.role-users-table{width:100%;border-collapse:collapse}.role-users-table th,.role-users-table td{border-bottom:1px solid rgba(86,255,135,.13);padding:12px;text-align:left}.role-users-table th{color:#b8ffc8;font-size:.86rem}.auth-status.error{color:#ffb7b7}@media (max-width:980px){.role-grid,.role-assign-panel,.security-password-panel{grid-template-columns:1fr}.role-users-table{min-width:760px}.table-card{overflow:auto}}`;
    document.head.appendChild(style);
  }

  function patchRender() {
    if (renderPatched || typeof render !== "function") return renderPatched;
    const old = render;
    render = function adminSecurityRender() {
      patchRoleHelpers();
      patchDb();
      const path = location.pathname.replace(/\/+$/, "") || "/";
      if (path === "/admin/roles") { renderRolesRoute(); return undefined; }
      const out = old.apply(this, arguments);
      ensureNav();
      if (path === "/account") injectSecurityPanel();
      return out;
    };
    render.__adminSecurityPatched = true;
    renderPatched = true;
    render();
    return true;
  }

  document.addEventListener("submit", (event) => {
    const roleForm = event.target.closest("[data-role-assign-form]");
    if (roleForm) { event.preventDefault(); handleRoleAssign(roleForm); return; }
    const passwordForm = event.target.closest("[data-security-password-form]");
    if (passwordForm) { event.preventDefault(); handlePasswordUpdate(passwordForm); }
  });

  patchRoleHelpers();
  patchDb();
  injectStyles();
  const timer = window.setInterval(() => { patchRoleHelpers(); patchDb(); ensureNav(); if (patchRender()) window.clearInterval(timer); }, 30);
  window.setTimeout(() => window.clearInterval(timer), 10000);
})();
