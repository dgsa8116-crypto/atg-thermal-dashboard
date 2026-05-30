"use strict";

(function installSportsDashboard() {
  const sportsState = {
    filter: "全部",
    selectedId: "mlb-dbacks-mariners"
  };

  const sportsCategories = ["全部", "棒球", "籃球", "足球", "網球", "場中追蹤", "VIP"];
  const sportsEvents = [
    {
      id: "mlb-dbacks-mariners",
      code: "MLB-0530-01",
      sport: "棒球",
      league: "美國職棒 MLB",
      home: "西雅圖水手",
      away: "亞歷桑那響尾蛇",
      matchup: "亞歷桑那響尾蛇 vs 西雅圖水手",
      startTime: "2026/05/30 09:40",
      status: "賽前觀察",
      access: "一般會員",
      confidence: 73,
      marketHeat: 68,
      trend: "近 10 場得分節奏偏低",
      prediction: "總分小分觀察",
      lineWatch: "總分 7.5 至 8.0 區間",
      dataPoints: ["先發投手近期 WHIP 穩定", "兩隊牛棚使用量偏高", "主場風向與球場因素需賽前確認"],
      risk: "若先發打線臨時輪休或牛棚調度提前，低分模型會失真。",
      source: "賽事表 / 棒球數據",
      note: "僅提供資料觀察與娛樂分析，不構成投注或獲利建議。"
    },
    {
      id: "nba-lakers-warriors",
      code: "NBA-0530-02",
      sport: "籃球",
      league: "NBA",
      home: "金州勇士",
      away: "洛杉磯湖人",
      matchup: "洛杉磯湖人 vs 金州勇士",
      startTime: "2026/05/30 10:00",
      status: "場中追蹤",
      access: "VIP",
      confidence: 76,
      marketHeat: 82,
      trend: "兩隊 Pace 與三分出手比重偏高",
      prediction: "總分大分觀察",
      lineWatch: "總分 226.5 至 229.5 區間",
      dataPoints: ["近 5 場有效命中率提升", "替補輪換得分穩定", "需追蹤傷病名單與背靠背賽程"],
      risk: "若主力受限或臨場節奏放慢，總分方向需降權。",
      source: "即時比分 / 籃球數據",
      note: "場中資訊僅供會員閱讀參考，不提供下單或投注功能。"
    },
    {
      id: "ucl-arsenal-psg",
      code: "SOC-0531-01",
      sport: "足球",
      league: "歐洲冠軍聯賽",
      home: "巴黎聖日耳曼",
      away: "兵工廠",
      matchup: "兵工廠 vs 巴黎聖日耳曼",
      startTime: "2026/05/31 03:00",
      status: "重點賽事",
      access: "一般會員",
      confidence: 71,
      marketHeat: 88,
      trend: "雙方前場壓迫強，定位球占比提高",
      prediction: "雙方進球觀察",
      lineWatch: "總進球 2.5 區間",
      dataPoints: ["兩隊 xG 連續 4 場高於聯賽均值", "邊路傳中與二點球數據活躍", "決賽保守開局風險需納入"],
      risk: "淘汰賽決賽可能先求穩，早段節奏若過慢需降低進球模型權重。",
      source: "賽事表 / 足球數據",
      note: "預測內容不保證結果，請勿視為投注建議。"
    },
    {
      id: "npb-tigers-giants",
      code: "NPB-0530-03",
      sport: "棒球",
      league: "日本職棒 NPB",
      home: "阪神虎",
      away: "讀賣巨人",
      matchup: "阪神虎 vs 讀賣巨人",
      startTime: "2026/05/30 18:00",
      status: "名單確認中",
      access: "一般會員",
      confidence: 69,
      marketHeat: 61,
      trend: "投手戰機率高，前 5 局失分模型偏低",
      prediction: "主隊不讓分觀察",
      lineWatch: "主勝 / 前五局低比分",
      dataPoints: ["主隊先發近 3 場控球穩定", "客隊長打率近期下滑", "需確認天候與打線排序"],
      risk: "若客隊臨時調整左打配置，主隊投手對位優勢可能下降。",
      source: "賽事表 / 賽果查詢",
      note: "本平台只做內容管理與會員解鎖，不處理投注。"
    },
    {
      id: "tennis-final-live",
      code: "TEN-0530-04",
      sport: "網球",
      league: "ATP 巡迴賽",
      home: "選手 B",
      away: "選手 A",
      matchup: "選手 A vs 選手 B",
      startTime: "2026/05/30 21:30",
      status: "場中追蹤",
      access: "VIP",
      confidence: 66,
      marketHeat: 54,
      trend: "一發得分率拉開，但接發表現波動",
      prediction: "第二盤局數偏大觀察",
      lineWatch: "局數 9.5 區間",
      dataPoints: ["選手 A 一發進球率 64%", "選手 B 破發點挽救率偏高", "場地速度對發球方較有利"],
      risk: "若出現醫療暫停或一發失準，局數模型需要即時修正。",
      source: "場中 / 網球數據",
      note: "場中資料會延遲，會員應以資料參考角度閱讀。"
    }
  ];

  function escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function calculateScore(event) {
    const statusBoost = event.status === "場中追蹤" ? 4 : event.status === "重點賽事" ? 3 : 0;
    return Math.max(0, Math.min(99, Math.round(Number(event.confidence || 0) * 0.72 + Number(event.marketHeat || 0) * 0.22 + statusBoost)));
  }

  function canViewVip() {
    if (typeof canAccessAdmin === "function" && canAccessAdmin()) return true;
    return Boolean(typeof state !== "undefined" && Array.isArray(state.memberships) && state.memberships.some((item) => item.active || item.plan === "VIP" || item.name === "VIP"));
  }

  function pill(text) {
    return `<span class="pill">${escape(text)}</span>`;
  }

  function energyBar(score) {
    const value = Math.max(0, Math.min(100, Number(score) || 0));
    return `<div class="energy-bar" aria-label="信心分數 ${value}%"><span style="width:${value}%"></span></div>`;
  }

  function stat(label, value, note) {
    return `<article class="stat-card energy-border"><span>${escape(label)}</span><strong>${escape(value)}</strong><p>${escape(note)}</p></article>`;
  }

  function pageHero() {
    return `<section class="container page-hero"><p class="eyebrow">黑曜智流 AI</p><h1>體育預測即時看板</h1><p>參考賽事表、場中追蹤、即時比分、運動數據與賽果查詢的資訊架構，提供會員制體育預測內容、資料觀察與風險提醒。</p></section>`;
  }

  function sourceCards() {
    const cards = [
      ["賽事表", "集中顯示賽事編號、聯盟、開賽時間、主客隊與狀態。"],
      ["場中追蹤", "用於標記進行中或需快速更新的賽事資料，不提供下單操作。"],
      ["即時比分", "保留比分、節奏與事件更新欄位，後續可接 API 或 Supabase Realtime。"],
      ["運動數據", "整理近期狀態、對戰資料、傷病名單、投手或球員效率指標。"]
    ];
    return `<section class="container section-tight"><div class="sports-source-grid">${cards.map(([title, body]) => `<article class="sports-source-card energy-border"><span>${escape(title)}</span><p>${escape(body)}</p></article>`).join("")}</div></section>`;
  }

  function filters() {
    return `<section class="container section-tight"><div class="sports-filter-bar energy-border">${sportsCategories.map((category) => `<button type="button" class="${sportsState.filter === category ? "active" : ""}" data-sports-filter="${escape(category)}">${escape(category)}</button>`).join("")}</div></section>`;
  }

  function eventCard(event, index, active) {
    const score = calculateScore(event);
    return `<article class="sports-event-card energy-border ${active ? "active" : ""}">
      <button type="button" class="sports-event-main" data-sports-event="${escape(event.id)}">
        <span class="sports-rank">#${index}</span>
        <span><strong>${escape(event.matchup)}</strong><small>${escape(event.league)}｜${escape(event.startTime)}｜${escape(event.code)}</small></span>
        <span class="sports-score">${score}</span>
      </button>
      <div class="sports-tags">${pill(event.sport)}${pill(event.status)}${pill(event.access)}</div>
      ${energyBar(score)}
      <div class="sports-event-footer"><span>${escape(event.prediction)}</span><small>${escape(event.trend)}</small></div>
    </article>`;
  }

  function metric(label, value) {
    return `<div class="mini-metric"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`;
  }

  function eventDetail(event) {
    const score = calculateScore(event);
    const locked = event.access === "VIP" && !canViewVip();
    const points = locked ? ["此賽事為 VIP 內容，請升級後查看完整觀察。", "未解鎖前不顯示完整分析與風險細節。"] : event.dataPoints;
    return `<aside class="sports-detail panel energy-border">
      <p class="eyebrow">Match Detail</p>
      <h2>${escape(event.matchup)}</h2>
      <p>${escape(event.note)}</p>
      <div class="sports-detail-score"><span>信心分數</span><strong>${score}</strong>${energyBar(score)}</div>
      <div class="atg-metric-grid">
        ${metric("聯盟", event.league)}${metric("開賽時間", event.startTime)}${metric("狀態", event.status)}${metric("會員權限", event.access)}
        ${metric("預測方向", locked ? "VIP 解鎖後查看" : event.prediction)}${metric("指標觀察", locked ? "VIP 解鎖後查看" : event.lineWatch)}
      </div>
      <div class="sports-analysis ${locked ? "locked" : ""}"><h3>${locked ? "VIP 內容已鎖定" : "資料觀察"}</h3><ul>${points.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></div>
      <div class="notice"><strong>風險提醒：</strong>${escape(locked ? "VIP 解鎖後可查看完整風險提醒。" : event.risk)}</div>
      <div class="button-row"><a class="button" href="/predictions" data-link>查看預測內容</a><a class="button secondary" href="/shop" data-link>升級會員</a></div>
    </aside>`;
  }

  function dataTable(events) {
    const columns = ["賽事編號", "運動", "聯盟", "開賽時間", "對戰", "狀態", "預測方向", "信心"];
    const cells = events.flatMap((event) => [event.code, event.sport, event.league, event.startTime, event.matchup, event.status, event.access === "VIP" && !canViewVip() ? "VIP 解鎖後查看" : event.prediction, String(calculateScore(event))]);
    return `<section class="container section"><div class="section-head"><div><p class="eyebrow">Sports Match List</p><h2>賽事資料列表</h2><p>清楚呈現賽事表、狀態、預測方向與會員權限。</p></div></div><div class="data-table" style="--cols:${columns.length}">${columns.map((item) => `<strong>${escape(item)}</strong>`).join("")}${cells.map((item) => `<span>${escape(item)}</span>`).join("")}</div></section>`;
  }

  function disclaimer() {
    const items = [
      "本頁僅提供體育賽事資料整理、內容分析、會員閱讀與風險提醒，不提供投注、下單、出金或現金兌換。",
      "體育預測內容不保證結果，不構成投注、投資或獲利建議。",
      "賽事時間、名單、比分與外部資料可能延遲或更動，正式營運時應接入合規資料源並保留更新紀錄。"
    ];
    return `<section class="container section-tight"><article class="panel"><p class="eyebrow">體育預測安全聲明</p><ul>${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></article></section>`;
  }

  function renderSportsDashboard() {
    const events = sportsEvents.filter((event) => sportsState.filter === "全部" || event.sport === sportsState.filter || event.status === sportsState.filter || event.access === sportsState.filter);
    const ranked = (events.length ? events : sportsEvents).slice().sort((a, b) => calculateScore(b) - calculateScore(a));
    const selected = ranked.find((event) => event.id === sportsState.selectedId) || ranked[0];
    const liveStatus = typeof state !== "undefined" && state.atgLive && (state.atgLive.cloudStatus === "已連線" || state.atgLive.localStatus === "已連線") ? "即時同步" : "範例資料";
    return `${pageHero()}<section class="container section-tight"><div class="stats-strip">${stat("追蹤賽事", sportsEvents.length, "棒球、籃球、足球、網球")}${stat("資料狀態", liveStatus, "Sports Feed")}${stat("重點賽事", sportsEvents.filter((event) => event.status === "重點賽事" || event.status === "場中追蹤").length, "可依分類篩選")}${stat("安全模式", "內容參考", "不提供投注或現金兌換")}</div></section>${sourceCards()}${filters()}<section class="container section sports-board"><div class="sports-event-list">${ranked.map((event, index) => eventCard(event, index + 1, selected.id === event.id)).join("")}</div>${eventDetail(selected)}</section>${dataTable(ranked)}${disclaimer()}`;
  }

  function injectSportsStyles() {
    if (document.getElementById("sportsDashboardStyles")) return;
    const style = document.createElement("style");
    style.id = "sportsDashboardStyles";
    style.textContent = `.sports-source-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.sports-source-card{display:grid;gap:8px;min-height:118px;border-radius:18px;padding:16px;background:radial-gradient(circle at 20% 0%,rgba(57,255,20,.18),transparent 34%),rgba(4,12,6,.74)}.sports-source-card span{color:var(--green);font-weight:950;letter-spacing:.08em}.sports-source-card p{margin:0;color:var(--muted);line-height:1.7}.sports-filter-bar{display:flex;flex-wrap:wrap;gap:10px;border-radius:18px;padding:12px;background:rgba(4,10,5,.76)}.sports-filter-bar button{border:1px solid rgba(57,255,20,.24);border-radius:999px;padding:10px 16px;background:rgba(57,255,20,.06);color:var(--soft);box-shadow:none}.sports-filter-bar button.active,.sports-filter-bar button:hover{border-color:rgba(57,255,20,.74);background:linear-gradient(135deg,rgba(0,255,153,.2),rgba(57,255,20,.14));color:var(--text);box-shadow:0 0 26px rgba(57,255,20,.16)}.sports-board{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.52fr);gap:16px;align-items:start}.sports-event-list{display:grid;gap:12px}.sports-event-card{display:grid;gap:12px;border-radius:18px;padding:14px;background:linear-gradient(135deg,rgba(57,255,20,.08),rgba(0,255,153,.05)),rgba(6,14,7,.78)}.sports-event-card.active{background:radial-gradient(circle at 18% 20%,rgba(57,255,20,.18),transparent 36%),linear-gradient(135deg,rgba(57,255,20,.14),rgba(0,255,153,.08)),rgba(5,15,7,.92)}.sports-event-main{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;border:0;padding:0;background:transparent;color:var(--text);box-shadow:none;text-align:left}.sports-event-main:hover{transform:none;box-shadow:none}.sports-rank,.sports-score{display:inline-grid;place-items:center;border-radius:12px;font-weight:950}.sports-rank{width:46px;height:38px;background:rgba(57,255,20,.1);color:var(--cyan)}.sports-score{width:54px;height:42px;color:#041008;background:linear-gradient(135deg,#d9f99d,#39ff14);box-shadow:0 0 20px rgba(57,255,20,.28)}.sports-event-main strong,.sports-event-main small,.sports-detail-score span,.sports-detail-score strong{display:block}.sports-event-main small,.sports-event-footer small{color:var(--muted);font-weight:800}.sports-tags,.sports-event-footer{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}.sports-event-footer span{color:#d0ffd1;font-weight:950}.sports-detail{position:sticky;top:92px;display:grid;gap:14px}.sports-detail h2{margin:0}.sports-detail-score{display:grid;gap:8px;border-radius:16px;padding:14px;background:rgba(57,255,20,.07);border:1px solid rgba(57,255,20,.18)}.sports-detail-score span{color:var(--soft);font-size:13px;font-weight:850}.sports-detail-score strong{font-size:clamp(38px,6vw,64px);line-height:.95;color:var(--green);text-shadow:0 0 24px rgba(57,255,20,.28)}.sports-analysis{border:1px solid rgba(57,255,20,.18);border-radius:16px;padding:14px 16px;background:rgba(0,0,0,.28)}.sports-analysis h3{margin:0 0 8px}.sports-analysis ul{margin:0;padding-left:20px;color:var(--muted);line-height:1.8}.sports-analysis.locked{border-color:rgba(245,158,11,.42);background:rgba(64,35,0,.2)}@media(max-width:1040px){.sports-board,.sports-source-grid{grid-template-columns:1fr 1fr}.sports-detail{position:static}}@media(max-width:680px){.sports-board,.sports-source-grid{grid-template-columns:1fr}.sports-event-main{grid-template-columns:auto minmax(0,1fr)}.sports-score{grid-column:1/-1;width:100%}.sports-filter-bar button{flex:1 1 auto}}`;
    document.head.appendChild(style);
  }

  function isSportsPath() {
    return location.pathname.replace(/\/+$/, "") === "/sports" || location.pathname.replace(/\/+$/, "") === "/atg";
  }

  function patchRender() {
    if (typeof render !== "function" || render.__fullSportsDashboardPatched) return;
    const originalRender = render;
    render = function patchedRender() {
      if (!isSportsPath() || !state || !state.authUser) return originalRender.apply(this, arguments);
      injectSportsStyles();
      if (typeof updateSeo === "function") updateSeo({ slug: "/sports", title: "體育預測即時看板｜黑曜智流 AI", description: "整合賽事資料、數據觀察、風險提醒與預測方向，提供會員即時體育預測內容。" });
      if (typeof updateNav === "function") updateNav("/sports");
      app.innerHTML = (typeof brandText === "function" ? brandText : String)((typeof renderPermissionBar === "function" ? renderPermissionBar() : "") + renderSportsDashboard());
      return undefined;
    };
    render.__fullSportsDashboardPatched = true;
  }

  document.addEventListener("click", (event) => {
    const filter = event.target.closest("[data-sports-filter]");
    if (filter) {
      sportsState.filter = filter.dataset.sportsFilter || "全部";
      render();
      return;
    }
    const selected = event.target.closest("[data-sports-event]");
    if (selected) {
      sportsState.selectedId = selected.dataset.sportsEvent;
      render();
    }
  });

  injectSportsStyles();
  patchRender();
  if (typeof render === "function" && isSportsPath()) render();
})();
