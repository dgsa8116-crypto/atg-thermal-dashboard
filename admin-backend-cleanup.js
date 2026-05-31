"use strict";

(function installAdminBackendCleanup() {
  const ROUTES = [
    ["/admin", "儀表板"],
    ["/admin/users", "帳號管理"],
    ["/admin/roles", "權限控管", "roles"],
    ["/admin/predictions", "內容管理"],
    ["/admin/categories", "分類管理"],
    ["/admin/products", "商品管理"],
    ["/admin/orders", "訂單管理"],
    ["/admin/points", "點數管理"],
    ["/admin/referrals", "推廣管理"],
    ["/admin/tasks", "任務管理"],
    ["/admin/risk", "風控管理"],
    ["/admin/seo", "SEO 管理"],
    ["/admin/settings", "白標設定"]
  ];
  const RELATIONS = {
    "/admin/users": [["/admin/roles", "指派帳號權限", "roles"], ["/admin/points", "查看點數流水"], ["/admin/orders", "查看訂單"], ["/admin/referrals", "查看推廣紀錄"]],
    "/admin/predictions": [["/sports", "前台體育預測"], ["/admin/categories", "管理分類"], ["/admin/seo", "內容 SEO"], ["/admin/points", "解鎖點數流水"]],
    "/admin/products": [["/shop", "前台點數商城"], ["/admin/orders", "訂單管理"], ["/admin/points", "點數流水"]],
    "/admin/orders": [["/admin/users", "帳號管理"], ["/admin/products", "商品管理"], ["/admin/points", "入帳流水"], ["/admin/risk", "異常訂單風控"]],
    "/admin/points": [["/wallet", "前台點數錢包"], ["/admin/users", "帳號管理"], ["/admin/orders", "訂單來源"], ["/admin/risk", "異常消耗風控"]],
    "/admin/referrals": [["/referral", "前台推廣中心"], ["/admin/users", "推薦人帳號"], ["/admin/points", "獎勵點數流水"], ["/admin/risk", "推廣風控"]],
    "/admin/tasks": [["/tasks", "前台任務中心"], ["/admin/users", "完成會員"], ["/admin/points", "任務獎勵流水"]],
    "/admin/risk": [["/admin/users", "帳號風險"], ["/admin/orders", "付款異常"], ["/admin/referrals", "推廣異常"], ["/admin/points", "點數異動"]],
    "/admin/seo": [["/", "前台主控台"], ["/sports", "體育預測頁"], ["/admin/settings", "白標設定"]],
    "/admin/settings": [["/admin/seo", "SEO 管理"], ["/account", "會員中心"]]
  };
  const DESC = {
    "/admin/users": "檢視帳號資料、會員狀態、點數、訂單與推廣關聯，並連到權限控管與風控模組。",
    "/admin/predictions": "檢視體育預測內容、分類、發布時間、有效期限、觀看權限與解鎖點數狀態。",
    "/admin/categories": "檢視前台內容分類、排序、內容數量與上下架狀態。",
    "/admin/products": "檢視點數包、VIP 方案、虛擬商品、價格、有效期限、庫存與商城關聯。",
    "/admin/orders": "檢視訂單列表、付款狀態、使用者、購買品項、付款時間與異常狀態。",
    "/admin/points": "檢視所有點數流水、來源、數量、狀態與關聯會員。",
    "/admin/referrals": "檢視推薦人、被推薦人、邀請碼、推廣層級、獎勵狀態與風控關聯。",
    "/admin/tasks": "檢視任務名稱、獎勵、條件、審核方式、狀態與完成紀錄。",
    "/admin/risk": "檢視重複 IP、重複裝置、短時間大量註冊、異常推廣、付款異常與點數異動提醒。",
    "/admin/seo": "檢視頁面 SEO Title、Meta Description、OG、Canonical 與 FAQ Schema 設定狀態。",
    "/admin/settings": "檢視網站名稱、Logo、品牌色、客服資訊、頁尾文案、網域與功能開關狀態。"
  };
  let patched = false;

  function st() { try { return typeof state === "undefined" ? null : state; } catch (_e) { return null; } }
  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }
  function text(v) { return esc(String(v ?? "").replace(/Email 與安全設定/g, "Email 驗證").replace(/安全設定/g, "帳號狀態")); }
  function role() {
    const s = st();
    const email = String(s?.authUser?.email || s?.profile?.email || "").toLowerCase();
    if (email === "set874872@gmail.com") return "super_admin";
    try { if (typeof currentRole === "function") return currentRole(); } catch (_e) {}
    return s?.profile?.role_id || s?.profile?.role || "member";
  }
  function canRoles() { return ["super_admin", "admin"].includes(role()); }
  function canAdmin() { try { if (typeof canAccessAdmin === "function") return canAccessAdmin(); } catch (_e) {} return ["super_admin", "admin", "manager", "assistant", "support", "editor"].includes(role()); }
  function data(path) { try { return adminModules[path] || null; } catch (_e) { return null; } }
  function routes() { return ROUTES.filter(([, , flag]) => flag !== "roles" || canRoles()); }
  function nav(path) { return `<section class="container section-tight"><nav class="admin-clean-nav">${routes().map(([href, label]) => `<a href="${href}" data-link class="${href === path ? "active" : ""}">${esc(label)}</a>`).join("")}</nav></section>`; }
  function card(href, title, body, flag) { if (flag === "roles" && !canRoles()) return ""; return `<a class="admin-action-card energy-border" href="${href}" data-link><span>${esc(title)}</span><strong>${esc(body)}</strong></a>`; }
  function stat(label, value, note) { return `<article class="stat-card energy-border admin-clean-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong><p>${esc(note)}</p></article>`; }
  function relation(path) {
    const links = (RELATIONS[path] || []).map(([href, label, flag]) => flag === "roles" && !canRoles() ? "" : `<a href="${href}" data-link>${esc(label)}</a>`).filter(Boolean).join("");
    return links ? `<section class="container section-tight"><article class="panel admin-clean-related"><p class="eyebrow">Linked Modules</p><h2>關聯功能</h2><div class="admin-related-links">${links}</div></article></section>` : "";
  }
  function table(columns, rows) {
    const indexes = (columns || []).map((c, i) => c === "操作" ? -1 : i).filter(i => i >= 0);
    const heads = indexes.map(i => `<th>${text(columns[i])}</th>`).join("");
    const body = (rows || []).map(row => `<tr>${indexes.map(i => `<td>${text(row[i])}</td>`).join("")}</tr>`).join("");
    return `<div class="admin-clean-table-wrap"><table class="admin-clean-table"><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function dashboard() {
    const s = st() || {};
    const points = typeof formatNumber === "function" ? formatNumber(s.points || 0) : String(s.points || 0);
    let count = "0"; try { count = String(predictions.length); } catch (_e) {}
    return `${typeof renderPermissionBar === "function" ? renderPermissionBar() : ""}<section class="container page-hero admin-clean-hero"><p class="eyebrow">Admin Dashboard</p><h1>管理後台</h1><p>集中管理帳號、權限、體育預測內容、點數流水、商品訂單、推廣任務、風控、SEO 與白標設定。</p></section>${nav("/admin")}<section class="container section-tight"><div class="stats-strip">${stat("目前帳號", s.profile?.display_name || s.authUser?.email || "管理員", `角色：${role()}`)}${stat("內容資料", count, "體育預測內容已接入後台導覽")}${stat("可用點數", points, "依目前登入狀態顯示")}${stat("權限控管", canRoles() ? "可進入" : "未授權", canRoles() ? "管理員可指派角色" : "此角色不顯示入口")}</div></section><section class="container section"><div class="admin-action-grid">${card("/admin/users", "帳號管理", "會員、狀態、點數與訂單")}${card("/admin/roles", "權限控管", "最高管理員與一般管理員", "roles")}${card("/admin/predictions", "內容管理", "體育預測內容與解鎖點數")}${card("/admin/points", "點數管理", "流水、來源、消耗與風控")}${card("/admin/products", "商品管理", "點數包、VIP 與虛擬商品")}${card("/admin/orders", "訂單管理", "付款、品項與異常標記")}${card("/admin/referrals", "推廣管理", "邀請、審核與獎勵")}${card("/admin/tasks", "任務管理", "任務、條件與完成紀錄")}${card("/admin/risk", "風控管理", "異常帳號、推廣與付款")}${card("/admin/seo", "SEO 管理", "標題、描述與 Schema")}${card("/admin/settings", "白標設定", "品牌、客服與功能開關")}</div></section><section class="container section-tight"><article class="notice admin-clean-notice">後台只保留可導航、可檢視或已串接的功能。資料寫入類操作在後端權限驗證與 audit log 未完成前不會顯示成按鈕。</article></section>`;
  }
  function modulePage(path) {
    const d = data(path); if (!d) return dashboard();
    return `${typeof renderPermissionBar === "function" ? renderPermissionBar() : ""}<section class="container page-hero admin-clean-hero"><p class="eyebrow">Admin Module</p><h1>${esc(d.title)}</h1><p>${esc(DESC[path] || d.desc)}</p></section>${nav(path)}<section class="container section-tight"><div class="grid-2"><article class="panel admin-clean-status"><p class="eyebrow">Available Now</p><h2>目前可用</h2><p>資料檢視、狀態確認與關聯模組導覽。</p></article><article class="panel admin-clean-status"><p class="eyebrow">Write Safety</p><h2>不顯示未完成操作</h2><p>資料寫入類操作需後端 RPC、權限驗證與 audit log 串接完成後才會開放。</p></article></div></section>${relation(path)}<section class="container section"><article class="panel admin-clean-data"><p class="eyebrow">Data List</p><h2>資料列表</h2>${table(d.columns, d.rows)}</article></section>`;
  }
  function noAccess() { return `<section class="container page-hero"><p class="eyebrow">Access Control</p><h1>權限不足</h1><p>你的帳號權限不足，無法查看管理後台。</p><a class="button" href="/" data-link>回主控台</a></section>`; }
  function styles() {
    if (document.getElementById("adminBackendCleanupStyles")) return;
    const s = document.createElement("style"); s.id = "adminBackendCleanupStyles";
    s.textContent = `.admin-clean-nav{display:flex;gap:10px;flex-wrap:wrap;padding:12px;border:1px solid rgba(86,255,135,.22);border-radius:20px;background:rgba(2,14,7,.72)}.admin-clean-nav a{color:#dfffe7;text-decoration:none;border:1px solid rgba(86,255,135,.24);border-radius:999px;padding:9px 13px;font-weight:800;background:rgba(0,0,0,.22)}.admin-clean-nav a.active,.admin-clean-nav a:hover{border-color:rgba(86,255,135,.82);box-shadow:0 0 18px rgba(42,255,109,.22);color:#fff}.admin-action-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.admin-action-card{display:grid;gap:8px;min-height:128px;padding:18px;border-radius:22px;text-decoration:none;color:#f3fff5;background:linear-gradient(145deg,rgba(3,21,9,.92),rgba(8,38,18,.7))}.admin-action-card span{color:#96ffaf;font-size:.86rem;font-weight:900}.admin-action-card strong{font-size:1.08rem;line-height:1.35}.admin-action-card:hover{transform:translateY(-2px);box-shadow:0 0 32px rgba(42,255,109,.2)}.admin-related-links{display:flex;gap:10px;flex-wrap:wrap}.admin-related-links a{border:1px solid rgba(86,255,135,.28);border-radius:999px;padding:9px 13px;color:#dfffe7;text-decoration:none;font-weight:800}.admin-clean-table-wrap{overflow:auto}.admin-clean-table{width:100%;border-collapse:collapse;min-width:720px}.admin-clean-table th,.admin-clean-table td{padding:13px 12px;border-bottom:1px solid rgba(86,255,135,.13);text-align:left}.admin-clean-table th{color:#b8ffc8;font-size:.86rem}@media(max-width:1100px){.admin-action-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.admin-action-grid{grid-template-columns:1fr}.admin-clean-nav{overflow:auto;flex-wrap:nowrap}.admin-clean-nav a{white-space:nowrap}}`;
    document.head.appendChild(s);
  }
  function patch() {
    if (patched || typeof render !== "function") return patched;
    const oldRender = render;
    render = function adminBackendCleanupRender() {
      const path = location.pathname.replace(/\/+$/, "") || "/";
      if (path.startsWith("/admin")) {
        if (path === "/admin/roles") return oldRender.apply(this, arguments);
        if (!st()?.authUser) return oldRender.apply(this, arguments);
        const html = canAdmin() ? (path === "/admin" ? dashboard() : modulePage(path)) : noAccess();
        if (typeof updateSeo === "function") updateSeo({ slug: path, title: path === "/admin" ? "管理後台｜黑曜智流 AI" : `${data(path)?.title || "管理模組"}｜黑曜智流 AI`, description: "黑曜智流 AI 管理後台。" });
        if (typeof updateNav === "function") updateNav(path);
        document.body.classList.toggle("auth-only", !st()?.authUser);
        document.body.dataset.role = role();
        document.getElementById("app").innerHTML = typeof brandText === "function" ? brandText(html) : html;
        return undefined;
      }
      return oldRender.apply(this, arguments);
    };
    patched = true; render(); return true;
  }
  styles();
  const timer = window.setInterval(() => { styles(); if (patch()) window.clearInterval(timer); }, 30);
  window.setTimeout(() => window.clearInterval(timer), 10000);
})();