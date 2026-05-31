"use strict";

(function installSportsOddsTerminal() {
  const STORAGE_PREFIX = "obsidianSportsTerminal";
  const DEFAULT_UNLOCK_COST = 80;
  const DAY_TABS = [
    ["all", "全部"],
    ["today", "今日賽事"],
    ["tomorrow", "明日賽事"]
  ];
  const STATUS_TABS = [
    ["all", "全部"],
    ["live", "進行中"],
    ["upcoming", "即將開始"],
    ["ended", "已結束"]
  ];
  const SPORTS = [
    ["all", "全部"],
    ["football", "足球"],
    ["basketball", "籃球"],
    ["baseball", "棒球"],
    ["tennis", "網球"]
  ];

  const events = [
    {
      id: "npb-lions-eagles",
      ai: "AI 推薦",
      league: "日職",
      sport: "baseball",
      day: "today",
      startsAt: "09-23 02:24",
      status: "ended",
      statusText: "已結束",
      away: "樂天36",
      home: "西武7",
      awayRate: 61.4,
      homeRate: 35.9,
      handicap: "讓分不提供",
      pick: "樂天36",
      pickNote: "推薦",
      liveRate: "即時更新",
      score: "2 : 7",
      cost: 80,
      confidence: 84,
      risk: "已完賽資料僅作模型回測參考。"
    },
    {
      id: "npb-fighters-marines",
      ai: "AI 推薦",
      league: "日職",
      sport: "baseball",
      day: "today",
      startsAt: "09-22 06:24",
      status: "live",
      statusText: "進行中",
      away: "羅德28",
      home: "日本火腿2",
      awayRate: 60.3,
      homeRate: 39.7,
      handicap: "盤口波動中",
      pick: "羅德28",
      pickNote: "推薦",
      liveRate: "每 60 秒更新",
      score: "4 : 3",
      cost: 80,
      confidence: 79,
      risk: "場中波動高，請以風險提示為主。"
    },
    {
      id: "mlb-yankees-redsox",
      ai: "AI 推薦",
      league: "MLB",
      sport: "baseball",
      day: "today",
      startsAt: "09-21 12:03",
      status: "upcoming",
      statusText: "未開始",
      away: "洋基",
      home: "紅襪",
      awayRate: 38.5,
      homeRate: 61.5,
      handicap: "等待開盤",
      pick: "洋基",
      pickNote: "觀察",
      liveRate: "開賽前更新",
      score: "-",
      cost: 80,
      confidence: 72,
      risk: "先發名單未完全確認，模型信心中等。"
    },
    {
      id: "nba-warriors-lakers",
      ai: "AI 推薦",
      league: "NBA",
      sport: "basketball",
      day: "today",
      startsAt: "09-22 22:29",
      status: "upcoming",
      statusText: "未開始",
      away: "勇士",
      home: "湖人",
      awayRate: 54.8,
      homeRate: 45.2,
      handicap: "主隊讓分觀察",
      pick: "勇士",
      pickNote: "推薦",
      liveRate: "開賽前更新",
      score: "-",
      cost: 100,
      confidence: 76,
      risk: "傷兵名單會直接影響勝率。"
    },
    {
      id: "epl-arsenal-chelsea",
      ai: "AI 推薦",
      league: "英超",
      sport: "football",
      day: "tomorrow",
      startsAt: "09-24 01:30",
      status: "upcoming",
      statusText: "未開始",
      away: "切爾西",
      home: "兵工廠",
      awayRate: 33.4,
      homeRate: 66.6,
      handicap: "xG 主隊偏強",
      pick: "兵工廠",
      pickNote: "推薦",
      liveRate: "開賽前更新",
      score: "-",
      cost: 120,
      confidence: 82,
      risk: "足球賽事平局因素高，需搭配盤口變化觀察。"
    },
    {
      id: "cpbl-brothers-monkeys",
      ai: "AI 推薦",
      league: "中職",
      sport: "baseball",
      day: "tomorrow",
      startsAt: "09-24 18:35",
      status: "upcoming",
      statusText: "未開始",
      away: "兄弟",
      home: "樂天桃猿",
      awayRate: 48.1,
      homeRate: 51.9,
      handicap: "盤口接近",
      pick: "樂天桃猿",
      pickNote: "小幅優勢",
      liveRate: "開賽前更新",
      score: "-",
      cost: 80,
      confidence: 68,
      risk: "雙方差距小，不建議單看勝率。"
    },
    {
      id: "atp-final-match",
      ai: "AI 推薦",
      league: "ATP",
      sport: "tennis",
      day: "tomorrow",
      startsAt: "09-24 20:00",
      status: "upcoming",
      statusText: "未開始",
      away: "辛納",
      home: "阿卡拉斯",
      awayRate: 47.2,
      homeRate: 52.8,
      handicap: "盤分接近",
      pick: "阿卡拉斯",
      pickNote: "觀察",
      liveRate: "開賽前更新",
      score: "-",
      cost: 90,
      confidence: 70,
      risk: "網球臨場狀態影響較大。"
    }
  ];

  const runtime = {
    day: readSetting("day", "all"),
    status: readSetting("status", "all"),
    sport: readSetting("sport", "all"),
    selected: readSetting("selected", events[0].id),
    updatedAt: new Date()
  };

  function readSetting(key, fallback) {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}:${key}`) || fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function saveSetting(key, value) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}:${key}`, value);
    } catch (_error) {
      // Ignore storage failures; rendering should continue.
    }
  }

  function appState() {
    try {
      return typeof state === "undefined" ? null : state;
    } catch (_error) {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function message(text) {
    if (typeof showToast === "function") {
      showToast(text);
      return;
    }
    window.alert(text);
  }

  function userKey() {
    const s = appState();
    return s?.authUser?.id || s?.authUser?.email || "guest";
  }

  function unlockStorageKey(eventId) {
    return `${STORAGE_PREFIX}:winrate:${userKey()}:${eventId}`;
  }

  function isUnlocked(event) {
    try {
      return localStorage.getItem(unlockStorageKey(event.id)) === "1";
    } catch (_error) {
      return false;
    }
  }

  function filteredEvents() {
    return events.filter((event) => {
      const dayOk = runtime.day === "all" || event.day === runtime.day;
      const statusOk = runtime.status === "all" || event.status === runtime.status;
      const sportOk = runtime.sport === "all" || event.sport === runtime.sport;
      return dayOk && statusOk && sportOk;
    });
  }

  function selectedEvent(list) {
    return list.find((event) => event.id === runtime.selected) || list[0] || events[0];
  }

  function renderTerminal() {
    const s = appState();
    const app = document.getElementById("app");
    if (!s?.authUser || !app) {
      if (typeof navigate === "function") navigate("/login");
      return true;
    }

    document.body.classList.remove("auth-only");
    document.body.classList.add("sports-terminal-body");
    document.body.dataset.role = typeof currentRole === "function" ? currentRole() : "user";

    if (typeof updateSeo === "function") {
      updateSeo({
        slug: "/sports",
        title: "體育賽事分析｜黑曜智流 AI",
        description: "仿專業運彩分析介面的體育賽事監測儀表板，提供今日與明日賽事、盤口評估、勝率點數解鎖與 AI 分析。"
      });
    }
    if (typeof updateNav === "function") updateNav("/sports");

    const list = filteredEvents();
    const selected = selectedEvent(list);
    const permission = typeof renderPermissionBar === "function" ? renderPermissionBar() : "";
    const html = `${permission}${renderShell(list, selected)}`;
    app.innerHTML = typeof brandText === "function" ? brandText(html) : html;
    return true;
  }

  function renderShell(list, selected) {
    const unlockedCount = events.filter((event) => isUnlocked(event)).length;
    const liveCount = events.filter((event) => event.status === "live").length;
    const balance = Number(appState()?.points || 0).toLocaleString("zh-TW");
    return `
      <section class="sports-ai-terminal">
        <aside class="sports-ai-sidebar">
          <a class="sports-ai-brand" href="/sports" data-link>
            <span class="sports-ai-logo">▰</span>
            <strong>黑曜體育 AI</strong>
          </a>
          ${renderSidebarGroup("黑曜 AI", [["all", "全部", "★"]], runtime.sport)}
          ${renderSidebarGroup("體育賽事", [["football", "足球", "⚽"], ["basketball", "籃球", "🏀"], ["baseball", "棒球", "⚾"], ["tennis", "網球", "🎾"]], runtime.sport)}
          <div class="sports-ai-side-section">
            <p>現場 AI</p>
            <button type="button" data-sai-status="live">即時比分</button>
            <button type="button" data-sai-status="all">盤口評估</button>
            <button type="button" data-sai-status="upcoming">即將開賽</button>
          </div>
          <div class="sports-ai-side-section">
            <p>AI 輔助決策</p>
            <span>策略觀察</span>
            <span>智能推薦</span>
            <span>風險提醒</span>
          </div>
        </aside>

        <div class="sports-ai-main">
          <header class="sports-ai-topbar">
            <div class="sports-ai-top-left">
              <strong>體育 AI</strong>
              <span>建華案業 vs 海盜隊</span>
              <button type="button" data-sai-watch>加入關注</button>
            </div>
            <div class="sports-ai-top-right">
              <span class="sports-ai-dot"></span>
              <span>最後更新：${formatTime(runtime.updatedAt)}</span>
            </div>
          </header>

          <section class="sports-ai-board energy-border">
            <div class="sports-ai-board-head">
              <div>
                <p class="eyebrow">Sports AI Dashboard</p>
                <h1>體育賽事分析</h1>
              </div>
              <div class="sports-ai-actions">
                <button type="button" data-sai-refresh>更新數據</button>
                <span>${list.length} 場賽事</span>
              </div>
            </div>
            <div class="sports-ai-tabs">
              ${renderTabs(DAY_TABS, runtime.day, "day")}
            </div>
            <div class="sports-ai-tabs status-tabs">
              ${renderTabs(STATUS_TABS, runtime.status, "status")}
            </div>
          </section>

          <section class="sports-ai-metrics">
            ${renderMetric("會員點數", balance, "勝率解鎖餘額")}
            ${renderMetric("進行中", String(liveCount), "即時監測")}
            ${renderMetric("已解鎖", String(unlockedCount), "隊伍勝率")}
            ${renderMetric("風險聲明", "已啟用", "不提供投注或出金")}
          </section>

          <section class="sports-ai-table-card energy-border">
            ${renderMatchTable(list)}
          </section>

          ${renderAnalysisPanel(selected)}
        </div>
      </section>
    `;
  }

  function renderSidebarGroup(title, items, activeValue) {
    return `<div class="sports-ai-side-section"><p>${escapeHtml(title)}</p>${items.map(([value, label, icon]) => `
      <button type="button" class="${activeValue === value ? "active" : ""}" data-sai-sport="${escapeHtml(value)}"><span>${escapeHtml(icon)}</span>${escapeHtml(label)}</button>
    `).join("")}</div>`;
  }

  function renderTabs(tabs, activeValue, type) {
    return tabs.map(([value, label]) => `<button type="button" class="${activeValue === value ? "active" : ""}" data-sai-${type}="${escapeHtml(value)}">${escapeHtml(label)}</button>`).join("");
  }

  function renderMetric(label, value, note) {
    return `<article class="sports-ai-metric energy-border"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
  }

  function renderMatchTable(list) {
    if (!list.length) {
      return `<div class="sports-ai-empty"><h2>沒有符合條件的賽事</h2><p>請切換今日、明日、狀態或運動分類。</p></div>`;
    }
    return `
      <div class="sports-ai-table-scroll">
        <table class="sports-ai-table">
          <thead>
            <tr>
              <th>AI判別</th>
              <th>聯賽</th>
              <th>賽事</th>
              <th>客隊/主隊</th>
              <th>勝率評估</th>
              <th>盤口觀察</th>
              <th>推薦方向</th>
              <th>即時狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(renderRow).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRow(event) {
    const unlocked = isUnlocked(event);
    return `
      <tr class="${event.status === "live" ? "is-live" : ""}" data-sai-row="${escapeHtml(event.id)}">
        <td><span class="ai-type"><i></i>${escapeHtml(event.ai)}</span></td>
        <td><strong>${escapeHtml(event.league)}</strong><small>${escapeHtml(labelSport(event.sport))}</small></td>
        <td><strong class="event-time">${escapeHtml(event.startsAt)}</strong><span class="match-status ${event.status}">${escapeHtml(event.statusText)}</span></td>
        <td class="teams-cell"><button type="button" data-sai-select="${escapeHtml(event.id)}"><b>${escapeHtml(event.away)}</b><span>VS</span><b>${escapeHtml(event.home)}</b></button></td>
        <td>${unlocked ? renderRates(event) : renderLocked(event)}</td>
        <td><span class="market-text">${escapeHtml(event.handicap)}</span><small>僅供資料觀察</small></td>
        <td><strong class="pick-text">${escapeHtml(event.pick)}</strong><small>${escapeHtml(event.pickNote)}</small></td>
        <td><span class="live-clock">●</span><small>${escapeHtml(event.liveRate)}</small></td>
        <td><button type="button" class="ai-action" data-sai-analysis="${escapeHtml(event.id)}">${unlocked ? "AI 分析" : `解鎖 ${event.cost}點`}</button></td>
      </tr>
    `;
  }

  function renderRates(event) {
    return `<div class="rate-stack"><span>客隊 <b>${event.awayRate.toFixed(1)}%</b></span><span>主隊 <b>${event.homeRate.toFixed(1)}%</b></span></div>`;
  }

  function renderLocked(event) {
    return `<div class="rate-locked"><span>勝率已鎖定</span><button type="button" data-sai-unlock="${escapeHtml(event.id)}">${event.cost}點開通</button></div>`;
  }

  function renderAnalysisPanel(event) {
    const unlocked = isUnlocked(event);
    return `
      <section class="sports-ai-analysis energy-border">
        <div>
          <p class="eyebrow">AI Match Insight</p>
          <h2>${escapeHtml(event.away)} vs ${escapeHtml(event.home)}</h2>
          <p>模型會綜合近期戰績、主客場、攻守效率、盤口變化與臨場狀態，輸出會員制資料觀察。</p>
        </div>
        <div class="analysis-grid">
          <article><span>模型信心</span><strong>${event.confidence}</strong><small>/100</small></article>
          <article><span>即時比分</span><strong>${escapeHtml(event.score)}</strong><small>${escapeHtml(event.statusText)}</small></article>
          <article><span>勝率狀態</span><strong>${unlocked ? "已開通" : `${event.cost}點`}</strong><small>${unlocked ? "可查看完整勝率" : "需點數解鎖"}</small></article>
        </div>
        <div class="analysis-note ${unlocked ? "" : "locked"}">
          ${unlocked ? `<strong>AI 分析摘要</strong><p>${escapeHtml(event.pick)} 為目前模型優勢方向，${escapeHtml(event.risk)}</p>` : `<strong>勝率尚未開通</strong><p>請使用點數解鎖後查看完整隊伍勝率、模型摘要與風險提醒。</p><button type="button" class="ai-action" data-sai-unlock="${escapeHtml(event.id)}">使用 ${event.cost} 點解鎖</button>`}
        </div>
        <p class="sports-ai-disclaimer">本頁僅提供體育賽事資料整理、預測內容與風險提醒，不提供投注、下單、出金或現金兌換，不保證任何預測結果。</p>
      </section>
    `;
  }

  function labelSport(value) {
    return (SPORTS.find(([key]) => key === value) || [value, value])[1];
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
  }

  function unlockEvent(eventId) {
    const event = events.find((item) => item.id === eventId);
    const s = appState();
    if (!event || !s) return;
    if (!s.authUser) {
      message("請先登入，才能使用點數解鎖隊伍勝率。");
      return;
    }
    if (isUnlocked(event)) {
      runtime.selected = event.id;
      saveSetting("selected", event.id);
      message("此賽事勝率已開通，已切換到 AI 分析摘要。");
      rerender();
      return;
    }
    const cost = Number(event.cost || DEFAULT_UNLOCK_COST);
    const balance = Number(s.points || 0);
    if (balance < cost) {
      message(`點數不足，需要 ${cost} 點才能開通此賽事勝率。`);
      return;
    }
    s.points = balance - cost;
    try {
      localStorage.setItem(unlockStorageKey(event.id), "1");
      const txKey = `${STORAGE_PREFIX}:transactions:${userKey()}`;
      const rows = JSON.parse(localStorage.getItem(txKey) || "[]");
      rows.unshift({ eventId: event.id, title: `${event.away} vs ${event.home}`, cost, createdAt: new Date().toISOString() });
      localStorage.setItem(txKey, JSON.stringify(rows.slice(0, 80)));
    } catch (_error) {
      // Do not block UI if local transaction cache fails.
    }
    runtime.selected = event.id;
    saveSetting("selected", event.id);
    message(`已使用 ${cost} 點開通 ${event.away} vs ${event.home} 隊伍勝率。`);
    rerender();
  }

  function rerender() {
    if (isSportsPath()) renderTerminal();
  }

  function isSportsPath() {
    return location.pathname === "/sports" || location.pathname === "/atg";
  }

  function installRenderPatch() {
    if (typeof render !== "function" || render.__sportsOddsTerminalPatched) return false;
    const previousRender = render;
    render = function sportsOddsTerminalRender() {
      if (isSportsPath()) return renderTerminal();
      return previousRender.apply(this, arguments);
    };
    render.__sportsOddsTerminalPatched = true;
    if (isSportsPath()) renderTerminal();
    return true;
  }

  function injectStyles() {
    if (document.getElementById("sportsOddsTerminalStyles")) return;
    const style = document.createElement("style");
    style.id = "sportsOddsTerminalStyles";
    style.textContent = `
      body.sports-terminal-body{background:#080d12;}
      .sports-ai-terminal{display:grid;grid-template-columns:210px minmax(0,1fr);min-height:calc(100vh - 88px);background:#080d12;color:#edf7ff;border-top:1px solid rgba(84,132,170,.18);}
      .sports-ai-sidebar{position:sticky;top:74px;align-self:start;height:calc(100vh - 74px);overflow:auto;background:#0c1219;border-right:1px solid rgba(84,132,170,.18);box-shadow:inset -1px 0 0 rgba(255,255,255,.03);}
      .sports-ai-brand{display:flex;align-items:center;gap:10px;padding:16px 18px;color:#80c7ff;text-decoration:none;border-bottom:1px solid rgba(84,132,170,.16);font-weight:900;}
      .sports-ai-logo{display:grid;place-items:center;width:24px;height:24px;border:1px solid rgba(56,171,255,.45);border-radius:6px;background:linear-gradient(135deg,#0b3356,#10151c);box-shadow:0 0 18px rgba(42,156,255,.24);}
      .sports-ai-side-section{display:grid;gap:4px;padding:12px 0;border-bottom:1px solid rgba(84,132,170,.12);}
      .sports-ai-side-section p{margin:0 14px 8px;color:#51aef5;font-size:.82rem;font-weight:900;}
      .sports-ai-side-section button,.sports-ai-side-section span{display:flex;align-items:center;gap:10px;width:100%;min-height:38px;padding:9px 16px;border:0;background:transparent;color:#d6e8f7;text-align:left;font-weight:800;cursor:pointer;}
      .sports-ai-side-section button:hover,.sports-ai-side-section button.active{background:linear-gradient(90deg,rgba(50,130,215,.28),rgba(28,68,110,.08));color:#fff;border-left:3px solid #38a6ff;}
      .sports-ai-main{min-width:0;padding:18px 18px 28px;}
      .sports-ai-topbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:-18px -18px 18px;padding:10px 18px;background:#0b1118;border-bottom:1px solid rgba(84,132,170,.18);color:#cfe7fb;}
      .sports-ai-top-left,.sports-ai-top-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
      .sports-ai-top-left strong{color:#64bfff;}.sports-ai-top-left span{padding:5px 10px;border-radius:8px;background:rgba(255,255,255,.05);font-size:.86rem;}
      .sports-ai-top-left button,.sports-ai-actions button{border:0;border-radius:6px;background:#169944;color:#fff;padding:8px 12px;font-weight:900;cursor:pointer;box-shadow:0 0 18px rgba(22,153,68,.25);}
      .sports-ai-dot{width:7px;height:7px;border-radius:999px;background:#17e86a;box-shadow:0 0 12px #17e86a;}
      .sports-ai-board{padding:18px;border-radius:10px;background:#111820;border:1px solid rgba(89,129,165,.24);box-shadow:0 12px 36px rgba(0,0,0,.32);}
      .sports-ai-board-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px;}.sports-ai-board h1{margin:4px 0 0;font-size:1.45rem;}.sports-ai-actions{display:flex;align-items:center;gap:12px;color:#9fb2c4;font-size:.86rem;}
      .sports-ai-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}.sports-ai-tabs button{border:1px solid rgba(98,141,176,.28);border-radius:6px;background:#212a34;color:#dcecf8;padding:8px 15px;font-weight:900;cursor:pointer;}.sports-ai-tabs button.active{background:#1f609d;border-color:#4fb1ff;box-shadow:0 0 18px rgba(79,177,255,.24);}.status-tabs button.active{background:#29313d;}
      .sports-ai-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0;}.sports-ai-metric{padding:14px;border-radius:10px;background:#0f171f;border:1px solid rgba(89,129,165,.22);}.sports-ai-metric span,.sports-ai-metric small{display:block;color:#94aabd;font-size:.82rem;}.sports-ai-metric strong{display:block;margin:6px 0;color:#fff;font-size:1.35rem;}
      .sports-ai-table-card{border-radius:10px;background:#10171f;border:1px solid rgba(89,129,165,.24);overflow:hidden;}.sports-ai-table-scroll{overflow:auto;}.sports-ai-table{width:100%;min-width:1060px;border-collapse:collapse;}.sports-ai-table th{position:sticky;top:0;z-index:1;background:linear-gradient(180deg,#1d2630,#17202a);color:#d9e7f3;font-size:.82rem;text-align:left;padding:13px 14px;}.sports-ai-table td{padding:14px;border-top:1px solid rgba(89,129,165,.11);vertical-align:middle;color:#dce8f2;}.sports-ai-table tr:hover{background:rgba(42,101,153,.08);}.sports-ai-table tr.is-live{background:linear-gradient(90deg,rgba(118,33,33,.16),rgba(16,23,31,.2));}
      .ai-type{display:flex;align-items:center;gap:8px;font-weight:900;}.ai-type i{width:11px;height:11px;border-radius:50%;background:linear-gradient(135deg,#7129ff,#b142ff);box-shadow:0 0 15px rgba(145,62,255,.5);} .sports-ai-table small{display:block;margin-top:4px;color:#7d8e9f;font-size:.76rem;}.event-time{color:#57b7ff;}.match-status{display:block;margin-top:8px;min-width:118px;text-align:center;padding:5px 9px;border-radius:5px;background:#23313d;color:#cbd8e4;font-size:.76rem;font-weight:900;}.match-status.live{background:rgba(169,47,62,.42);color:#ffb8c1;}.match-status.upcoming{background:rgba(25,128,75,.36);color:#44eb98;}.match-status.ended{background:#252d37;color:#c4ced8;}
      .teams-cell button{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;width:100%;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;}.teams-cell b:first-child{color:#4fb1ff;}.teams-cell b:last-child{color:#ffad2f;}.teams-cell span{color:#aab7c4;font-size:.72rem;}.rate-stack{display:grid;gap:4px;min-width:95px;}.rate-stack span{display:flex;justify-content:space-between;gap:8px;color:#cbd8e4;font-size:.78rem;}.rate-stack b{color:#53b8ff;}.rate-stack span:last-child b{color:#f6ad28;}.rate-locked{display:grid;gap:7px;min-width:108px;}.rate-locked span{color:#899bad;font-size:.78rem;}.rate-locked button,.ai-action{border:0;border-radius:6px;background:linear-gradient(135deg,#7d32ff,#a342ff);color:white;padding:8px 12px;font-weight:950;cursor:pointer;box-shadow:0 0 18px rgba(134,54,255,.28);}.market-text{display:block;color:#cfdce8;}.pick-text{color:#22dd75;}.live-clock{color:#96a6b6;}
      .sports-ai-empty{padding:32px;text-align:center;color:#aebfd0;}.sports-ai-analysis{display:grid;grid-template-columns:minmax(0,.9fr) minmax(280px,.8fr) minmax(260px,1fr);gap:16px;margin-top:16px;padding:18px;border-radius:10px;background:#101820;border:1px solid rgba(89,129,165,.24);}.sports-ai-analysis h2{margin:5px 0 8px;}.analysis-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}.analysis-grid article{padding:12px;border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(89,129,165,.14);}.analysis-grid span,.analysis-grid small{display:block;color:#8ea1b4;font-size:.78rem;}.analysis-grid strong{display:block;margin:6px 0;color:#fff;font-size:1.3rem;}.analysis-note{padding:14px;border-radius:9px;background:rgba(22,153,68,.12);border:1px solid rgba(34,221,117,.24);}.analysis-note.locked{background:rgba(125,50,255,.1);border-color:rgba(125,50,255,.28);}.sports-ai-disclaimer{grid-column:1/-1;margin:0;color:#91a5b7;font-size:.86rem;border-top:1px solid rgba(89,129,165,.15);padding-top:12px;}
      @media (max-width:1000px){.sports-ai-terminal{grid-template-columns:1fr}.sports-ai-sidebar{position:relative;top:auto;height:auto;display:flex;overflow:auto;border-right:0;border-bottom:1px solid rgba(84,132,170,.18);}.sports-ai-brand{min-width:170px}.sports-ai-side-section{min-width:160px;border-bottom:0;border-left:1px solid rgba(84,132,170,.12)}.sports-ai-metrics{grid-template-columns:repeat(2,1fr)}.sports-ai-analysis{grid-template-columns:1fr}.analysis-grid{grid-template-columns:repeat(3,1fr)}}
      @media (max-width:640px){.sports-ai-main{padding:12px}.sports-ai-topbar{margin:-12px -12px 12px}.sports-ai-board-head{display:grid}.sports-ai-metrics,.analysis-grid{grid-template-columns:1fr}.sports-ai-tabs button{flex:1 1 auto}.sports-ai-table{min-width:920px}}
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("click", (event) => {
    const day = event.target.closest("[data-sai-day]");
    if (day) {
      runtime.day = day.dataset.saiDay || "all";
      saveSetting("day", runtime.day);
      rerender();
      return;
    }
    const status = event.target.closest("[data-sai-status]");
    if (status) {
      runtime.status = status.dataset.saiStatus || "all";
      saveSetting("status", runtime.status);
      rerender();
      return;
    }
    const sport = event.target.closest("[data-sai-sport]");
    if (sport) {
      runtime.sport = sport.dataset.saiSport || "all";
      saveSetting("sport", runtime.sport);
      rerender();
      return;
    }
    const refresh = event.target.closest("[data-sai-refresh]");
    if (refresh) {
      runtime.updatedAt = new Date();
      message("賽事資料已更新。正式版可接 Supabase Realtime 或資料供應 API。");
      rerender();
      return;
    }
    const watch = event.target.closest("[data-sai-watch]");
    if (watch) {
      message("已加入關注清單。正式版可同步到會員帳號。 ");
      return;
    }
    const select = event.target.closest("[data-sai-select]");
    if (select) {
      runtime.selected = select.dataset.saiSelect || events[0].id;
      saveSetting("selected", runtime.selected);
      rerender();
      return;
    }
    const unlock = event.target.closest("[data-sai-unlock]");
    if (unlock) {
      unlockEvent(unlock.dataset.saiUnlock);
      return;
    }
    const analysis = event.target.closest("[data-sai-analysis]");
    if (analysis) {
      const eventId = analysis.dataset.saiAnalysis;
      const match = events.find((item) => item.id === eventId);
      if (!match) return;
      if (!isUnlocked(match)) {
        unlockEvent(eventId);
        return;
      }
      runtime.selected = eventId;
      saveSetting("selected", eventId);
      message("已切換到完整 AI 分析摘要。");
      rerender();
    }
  });

  injectStyles();
  if (!installRenderPatch()) {
    const timer = window.setInterval(() => {
      if (installRenderPatch()) window.clearInterval(timer);
    }, 30);
    window.setTimeout(() => window.clearInterval(timer), 10000);
  }
})();
