"use strict";

(function installSportsPredictionSuite() {
  const STORAGE = "obsidianSportsPrediction";
  const DEFAULT_COST = 80;
  const filters = {
    day: read("day", "today"),
    sport: read("sport", "all"),
    status: read("status", "all"),
    selected: read("selected", "npb-eagles-lions")
  };
  const events = [
    { id: "npb-eagles-lions", day: "today", sport: "baseball", league: "日職", startsAt: "今日 18:35", status: "live", statusText: "進行中", away: "樂天金鷲", home: "西武獅", awayRate: 58.6, homeRate: 41.4, market: "先發投手穩定度偏向客隊，讓分變化仍需觀察。", pick: "樂天金鷲", confidence: 78, cost: 80, trend: "客隊近五場攻擊效率較佳，牛棚消耗低於主隊。", risk: "投手調度會直接影響勝率。", sources: ["近期戰績", "先發投手", "牛棚使用量", "盤口波動"] },
    { id: "cpbl-monkeys-brothers", day: "today", sport: "baseball", league: "中職", startsAt: "今日 19:05", status: "upcoming", statusText: "即將開始", away: "樂天桃猿", home: "中信兄弟", awayRate: 47.8, homeRate: 52.2, market: "主場優勢小幅存在，盤口接近，屬於高波動賽事。", pick: "中信兄弟", confidence: 66, cost: 70, trend: "兩隊近期得分差距不大，主隊守備穩定度略好。", risk: "勝率差距小，需搭配先發名單與臨場打線確認。", sources: ["主客場表現", "打線狀態", "失誤率", "讓分盤觀察"] },
    { id: "nba-warriors-lakers", day: "today", sport: "basketball", league: "NBA", startsAt: "今日 10:30", status: "ended", statusText: "已結束", away: "勇士", home: "湖人", awayRate: 54.1, homeRate: 45.9, market: "節奏偏快，外線命中率是主要觀察變數。", pick: "勇士", confidence: 72, cost: 90, trend: "客隊轉換進攻效率較高，替補火力較完整。", risk: "已結束賽事僅作模型回測，不代表後續賽事結果。", sources: ["攻守效率", "傷兵名單", "節奏指標", "歷史對戰"] },
    { id: "epl-arsenal-chelsea", day: "tomorrow", sport: "football", league: "英超", startsAt: "明日 22:00", status: "upcoming", statusText: "未開始", away: "切爾西", home: "兵工廠", awayRate: 35.2, homeRate: 64.8, market: "主隊 xG 與控球穩定度較佳，平局風險仍需保留。", pick: "兵工廠", confidence: 81, cost: 120, trend: "主隊近期壓迫成功率高，禁區觸球數領先。", risk: "足球賽事平局因素高，單看勝率容易低估波動。", sources: ["xG", "控球率", "射門品質", "球員輪換"] },
    { id: "mlb-yankees-redsox", day: "tomorrow", sport: "baseball", league: "MLB", startsAt: "明日 07:05", status: "upcoming", statusText: "未開始", away: "洋基", home: "紅襪", awayRate: 51.6, homeRate: 48.4, market: "先發對位接近，總分與牛棚狀態比勝負更敏感。", pick: "洋基", confidence: 69, cost: 90, trend: "客隊長打能力較好，但主隊主場得分穩定。", risk: "MLB 先發投手異動會明顯改變模型輸出。", sources: ["先發對位", "長打率", "牛棚疲勞", "球場因素"] },
    { id: "atp-sinner-alcaraz", day: "tomorrow", sport: "tennis", league: "ATP", startsAt: "明日 20:00", status: "upcoming", statusText: "未開始", away: "辛納", home: "阿卡拉斯", awayRate: 48.9, homeRate: 51.1, market: "盤分接近，發球局保發率會決定優勢方向。", pick: "阿卡拉斯", confidence: 64, cost: 80, trend: "雙方硬地數據接近，主動得分與非受迫失誤是關鍵。", risk: "網球臨場狀態與傷勢資訊會造成大幅偏移。", sources: ["保發率", "接發效率", "硬地表現", "近期體能"] }
  ];
  const sports = [["all", "全部"], ["baseball", "棒球"], ["basketball", "籃球"], ["football", "足球"], ["tennis", "網球"]];
  const statuses = [["all", "全部"], ["live", "進行中"], ["upcoming", "即將開始"], ["ended", "已結束"]];
  const days = [["today", "今日賽事"], ["tomorrow", "明日賽事"]];

  function read(key, fallback) { try { return localStorage.getItem(`${STORAGE}:${key}`) || fallback; } catch (_error) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(`${STORAGE}:${key}`, value); } catch (_error) {} }
  function stateRef() { try { return typeof state === "undefined" ? null : state; } catch (_error) { return null; } }
  function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char])); }
  function msg(text) { if (typeof showToast === "function") showToast(text); else window.alert(text); }
  function clean(path) { return (path || location.pathname).replace(/\/+$/, "") || "/"; }
  function sportsPath(path = location.pathname) { const p = clean(path); return p === "/sports" || p === "/atg"; }
  function legacyPath(path = location.pathname) { const p = clean(path); return p === "/launcher" || p === "/predictions" || p.startsWith("/predictions/"); }
  function redirectLegacy() { if (!legacyPath()) return false; history.replaceState({}, "", "/sports"); return true; }
  function key(eventId) { const s = stateRef(); const user = s?.authUser?.id || s?.authUser?.email || "guest"; return `${STORAGE}:unlock:${user}:${eventId}`; }
  function unlocked(event) { try { return localStorage.getItem(key(event.id)) === "1"; } catch (_error) { return false; } }
  function list() { return events.filter((event) => (filters.day === "all" || event.day === filters.day) && (filters.sport === "all" || event.sport === filters.sport) && (filters.status === "all" || event.status === filters.status)); }
  function selected(rows) { return rows.find((event) => event.id === filters.selected) || rows[0] || events[0]; }
  function sportLabel(value) { return (sports.find(([keyName]) => keyName === value) || [value, value])[1]; }
  function formatTime() { return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()); }

  function renderSuite() {
    redirectLegacy();
    if (!sportsPath()) return false;
    const app = document.getElementById("app");
    const s = stateRef();
    if (!app) return true;
    if (!s?.authUser) { if (typeof navigate === "function") navigate("/login"); return true; }
    document.body.classList.remove("auth-only");
    document.body.classList.add("sports-prediction-body");
    if (typeof updateSeo === "function") updateSeo({ slug: "/sports", title: "體育賽事分析與勝率解鎖｜黑曜智流 AI", description: "整合今日與明日賽事、盤口觀察、勝率評估、點數解鎖與風險提醒。" });
    if (typeof updateNav === "function") updateNav("/sports");
    const rows = list();
    const active = selected(rows);
    const permission = typeof renderPermissionBar === "function" ? renderPermissionBar() : "";
    const html = `${permission}${shell(rows, active)}`;
    app.innerHTML = typeof brandText === "function" ? brandText(html) : html;
    return true;
  }

  function shell(rows, active) {
    const s = stateRef();
    const points = Number(s?.points || 0).toLocaleString("zh-TW");
    const live = events.filter((event) => event.status === "live").length;
    const count = events.filter(unlocked).length;
    return `<section class="sports-suite"><aside class="sports-suite-sidebar energy-border"><a class="sports-suite-brand" href="/sports" data-link><span>AI</span><strong>黑曜體育 AI</strong></a><div class="sports-suite-group"><p>賽事篩選</p>${sports.map(([v,l]) => side("sport", v, l, filters.sport)).join("")}</div><div class="sports-suite-group"><p>狀態</p>${statuses.map(([v,l]) => side("status", v, l, filters.status)).join("")}</div><div class="sports-suite-note"><strong>內容定位</strong><small>整合預測內容、勝率開通與風險提醒，不提供投注或現金兌換。</small></div></aside><main class="sports-suite-main"><section class="sports-suite-hero energy-border"><div><p class="eyebrow">Sports Prediction Dashboard</p><h1>體育賽事分析</h1><p>即時整理今日與明日賽事、盤口觀察、AI 勝率評估與會員點數解鎖內容。</p></div><div><button type="button" data-sp-refresh>更新賽事</button><span>最後更新：${esc(formatTime())}</span></div></section><section class="sports-suite-tabs">${days.map(([v,l]) => tab("day", v, l, filters.day)).join("")}</section><section class="sports-suite-metrics">${metric("會員點數", points, "可用於開通隊伍勝率")}${metric("進行中", String(live), "即時監測賽事")}${metric("已開通", String(count), "會員專屬分析")}${metric("內容安全", "已啟用", "不保證結果")}</section><section class="sports-suite-table energy-border">${table(rows)}</section>${analysis(active)}</main></section>`;
  }
  function side(type, value, label, active) { return `<button type="button" class="${active === value ? "active" : ""}" data-sp-${type}="${esc(value)}">${esc(label)}</button>`; }
  function tab(type, value, label, active) { return `<button type="button" class="${active === value ? "active" : ""}" data-sp-${type}="${esc(value)}">${esc(label)}</button>`; }
  function metric(label, value, note) { return `<article class="sports-suite-metric energy-border"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`; }
  function table(rows) { if (!rows.length) return `<div class="sports-suite-empty"><h2>沒有符合條件的賽事</h2><p>請切換今日、明日、球種或狀態篩選。</p></div>`; return `<div class="sports-suite-scroll"><table class="sports-suite-grid"><thead><tr><th>AI 判別</th><th>聯賽</th><th>時間</th><th>客隊 / 主隊</th><th>勝率</th><th>盤口觀察</th><th>推薦方向</th><th>狀態</th><th>操作</th></tr></thead><tbody>${rows.map(row).join("")}</tbody></table></div>`; }
  function row(event) { const ok = unlocked(event); return `<tr class="${event.status === "live" ? "is-live" : ""}"><td><b>AI 推薦</b></td><td><strong>${esc(event.league)}</strong><small>${esc(sportLabel(event.sport))}</small></td><td><strong>${esc(event.startsAt)}</strong></td><td><button type="button" class="sports-suite-teams" data-sp-select="${esc(event.id)}"><b>${esc(event.away)}</b><span>VS</span><b>${esc(event.home)}</b></button></td><td>${ok ? rates(event) : locked(event)}</td><td><span>${esc(event.market)}</span><small>僅供資料觀察</small></td><td><strong>${esc(event.pick)}</strong><small>信心 ${event.confidence}/100</small></td><td><span class="sports-suite-status ${event.status}">${esc(event.statusText)}</span></td><td><button type="button" class="sports-suite-action" data-sp-analysis="${esc(event.id)}">${ok ? "查看分析" : `開通 ${event.cost}點`}</button></td></tr>`; }
  function rates(event) { return `<div class="sports-suite-rates"><span>客隊 <b>${event.awayRate.toFixed(1)}%</b></span><span>主隊 <b>${event.homeRate.toFixed(1)}%</b></span></div>`; }
  function locked(event) { return `<div class="sports-suite-locked"><span>勝率已鎖定</span><button type="button" data-sp-unlock="${esc(event.id)}">${event.cost}點開通</button></div>`; }
  function analysis(event) { const ok = unlocked(event); return `<section class="sports-suite-analysis energy-border"><div><p class="eyebrow">Prediction Content</p><h2>${esc(event.away)} vs ${esc(event.home)}</h2><p>${ok ? esc(event.trend) : "此賽事完整勝率與 AI 分析需使用點數開通後查看。"}</p></div><article><span>模型信心</span><strong>${event.confidence}/100</strong><small>${esc(event.market)}</small></article><article class="${ok ? "" : "locked"}"><span>會員內容</span><strong>${ok ? "已開通" : `${event.cost}點`}</strong><small>${ok ? esc(event.risk) : "開通後顯示勝率、推薦方向與風險提醒。"}</small>${ok ? "" : `<button type="button" class="sports-suite-action" data-sp-unlock="${esc(event.id)}">使用 ${event.cost} 點開通</button>`}</article><div class="sports-suite-source"><strong>參考資料</strong><ul>${event.sources.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div><p class="sports-suite-disclaimer">本內容僅供娛樂與資料參考，不保證結果，不構成投注、投資或獲利建議；本平台不提供下注、出金或現金兌換。</p></section>`; }

  function unlock(eventId) {
    const s = stateRef();
    const event = events.find((item) => item.id === eventId);
    if (!event || !s) return;
    if (!s.authUser) return msg("請先登入，才能使用點數開通隊伍勝率。");
    if (unlocked(event)) { filters.selected = event.id; write("selected", event.id); return rerender(); }
    const cost = Number(event.cost || DEFAULT_COST);
    const balance = Number(s.points || 0);
    if (balance < cost) return msg(`點數不足，需要 ${cost} 點才能開通。`);
    s.points = balance - cost;
    try { localStorage.setItem(key(event.id), "1"); } catch (_error) {}
    filters.selected = event.id;
    write("selected", event.id);
    msg(`已使用 ${cost} 點開通 ${event.away} vs ${event.home}。`);
    rerender();
  }
  function setFilter(type, value) { filters[type] = value || "all"; write(type, filters[type]); rerender(); }
  function rerender() { if (sportsPath() && typeof render === "function") render(); }
  function patchRender() { if (typeof render !== "function" || render.__sportsPredictionSuitePatched) return false; const previous = render; render = function sportsPredictionSuiteRender() { redirectLegacy(); if (sportsPath()) return renderSuite(); return previous.apply(this, arguments); }; render.__sportsPredictionSuitePatched = true; if (sportsPath() || legacyPath()) render(); return true; }
  function clickHandler(event) {
    const legacy = event.target.closest('a[href="/launcher"],a[href="/predictions"],a[href^="/predictions/"]');
    if (legacy) { event.preventDefault(); event.stopImmediatePropagation(); history.pushState({}, "", "/sports"); if (typeof render === "function") render(); return; }
    const day = event.target.closest("[data-sp-day]"); if (day) return setFilter("day", day.dataset.spDay || "today");
    const sport = event.target.closest("[data-sp-sport]"); if (sport) return setFilter("sport", sport.dataset.spSport || "all");
    const status = event.target.closest("[data-sp-status]"); if (status) return setFilter("status", status.dataset.spStatus || "all");
    const select = event.target.closest("[data-sp-select]"); if (select) { filters.selected = select.dataset.spSelect; write("selected", filters.selected); rerender(); return; }
    const open = event.target.closest("[data-sp-unlock],[data-sp-analysis]"); if (open) unlock(open.dataset.spUnlock || open.dataset.spAnalysis);
    const refresh = event.target.closest("[data-sp-refresh]"); if (refresh) { msg("賽事資料已更新。正式版可接入 Supabase Realtime 或授權賽事資料 API。"); rerender(); }
  }
  function style() {
    if (document.getElementById("sportsPredictionSuiteStyles")) return;
    const node = document.createElement("style");
    node.id = "sportsPredictionSuiteStyles";
    node.textContent = `body.sports-prediction-body{background:#050907;color:#edf8ef}.sports-suite{display:grid;grid-template-columns:230px minmax(0,1fr);gap:16px;min-height:calc(100vh - 88px);padding:16px;background:radial-gradient(circle at 20% 0%,rgba(29,255,113,.16),transparent 34%),linear-gradient(135deg,#050907,#101411)}.sports-suite-sidebar,.sports-suite-hero,.sports-suite-table,.sports-suite-analysis,.sports-suite-metric{background:rgba(8,14,10,.92);border:2px solid rgba(60,255,121,.28);border-radius:18px;box-shadow:0 0 28px rgba(31,255,103,.1)}.sports-suite-sidebar{position:sticky;top:86px;align-self:start;display:grid;gap:14px;padding:16px}.sports-suite-brand{display:flex;align-items:center;gap:10px;color:#eaffed;text-decoration:none;font-weight:900}.sports-suite-brand span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#0f3b1a,#1dff6f);color:#061009}.sports-suite-group{display:grid;gap:8px}.sports-suite-group p,.sports-suite-note strong{margin:0;color:#7aff9b;font-size:.82rem;font-weight:950}.sports-suite-group button,.sports-suite-tabs button{border:1px solid rgba(90,255,137,.18);border-radius:12px;background:rgba(255,255,255,.04);color:#d8eadb;padding:10px 12px;font-weight:850;cursor:pointer}.sports-suite-group button.active,.sports-suite-tabs button.active,.sports-suite-group button:hover,.sports-suite-tabs button:hover{border-color:rgba(75,255,121,.72);background:linear-gradient(90deg,rgba(37,255,104,.2),rgba(255,255,255,.03));box-shadow:0 0 18px rgba(35,255,95,.18)}.sports-suite-note{display:grid;gap:8px;padding:12px;border-radius:14px;background:rgba(29,255,113,.08);color:#bad2bd;line-height:1.7}.sports-suite-main{min-width:0;display:grid;gap:14px}.sports-suite-hero{display:flex;justify-content:space-between;gap:16px;padding:22px}.sports-suite-hero h1{margin:4px 0 8px;font-size:clamp(1.7rem,3vw,3.1rem)}.sports-suite-hero p{margin:0;color:#a9c4ad;line-height:1.75}.sports-suite-hero button,.sports-suite-action,.sports-suite-locked button{border:1px solid rgba(91,255,136,.5);border-radius:12px;background:linear-gradient(135deg,#15812f,#20f06b);color:#061009;padding:10px 14px;font-weight:1000;cursor:pointer}.sports-suite-tabs{display:flex;gap:10px;flex-wrap:wrap}.sports-suite-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.sports-suite-metric{padding:15px}.sports-suite-metric span,.sports-suite-metric small{display:block;color:#8fb596;font-size:.8rem}.sports-suite-metric strong{display:block;margin:7px 0;color:#fff;font-size:1.45rem}.sports-suite-table{overflow:hidden}.sports-suite-scroll{overflow:auto}.sports-suite-grid{width:100%;min-width:1120px;border-collapse:collapse}.sports-suite-grid th{background:#0f1912;color:#d8f2dc;text-align:left;font-size:.82rem;padding:14px}.sports-suite-grid td{padding:14px;border-top:1px solid rgba(75,255,126,.1);vertical-align:middle;color:#dcebe0}.sports-suite-grid tr:hover,.sports-suite-grid tr.is-live{background:rgba(31,255,103,.06)}.sports-suite-grid small{display:block;margin-top:5px;color:#8ba792;font-size:.76rem;line-height:1.45}.sports-suite-teams{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;width:100%;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer}.sports-suite-teams b:first-child,.sports-suite-pick,.sports-suite-rates b{color:#46ff83}.sports-suite-teams span{color:#78967f}.sports-suite-rates,.sports-suite-locked{display:grid;gap:6px}.sports-suite-status{display:inline-flex;border-radius:999px;padding:6px 10px;background:rgba(255,255,255,.06);font-size:.78rem;font-weight:950}.sports-suite-status.live{background:rgba(32,240,107,.16);color:#75ffa0}.sports-suite-status.upcoming{background:rgba(92,137,255,.14);color:#a9c1ff}.sports-suite-analysis{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(180px,.45fr) minmax(230px,.7fr);gap:14px;padding:18px}.sports-suite-analysis p{margin:0;color:#abc3af;line-height:1.75}.sports-suite-analysis article{display:grid;gap:8px;padding:14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(75,255,126,.18)}.sports-suite-analysis article strong{font-size:1.45rem}.sports-suite-source,.sports-suite-disclaimer{grid-column:1/-1}.sports-suite-source ul{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 0;padding:0;list-style:none}.sports-suite-source li{border:1px solid rgba(75,255,126,.18);border-radius:999px;padding:7px 10px;color:#a9c4ad}.sports-suite-disclaimer{border-top:1px solid rgba(75,255,126,.14);padding-top:12px;font-size:.86rem}@media(max-width:1100px){.sports-suite{grid-template-columns:1fr}.sports-suite-sidebar{position:relative;top:auto}.sports-suite-metrics{grid-template-columns:repeat(2,1fr)}.sports-suite-analysis{grid-template-columns:1fr}}@media(max-width:680px){.sports-suite{padding:10px}.sports-suite-hero{display:grid}.sports-suite-metrics{grid-template-columns:1fr}.sports-suite-tabs button{flex:1 1 auto}.sports-suite-grid{min-width:980px}}`;
    document.head.appendChild(node);
  }
  style();
  document.addEventListener("click", clickHandler, true);
  redirectLegacy();
  if (!patchRender()) {
    const timer = window.setInterval(() => { if (patchRender()) window.clearInterval(timer); }, 30);
    window.setTimeout(() => window.clearInterval(timer), 10000);
  }
})();