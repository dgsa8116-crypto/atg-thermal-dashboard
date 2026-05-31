"use strict";

(function installTaskReviewWorkflow() {
  const REVIEW_KEY = "obsidianTaskReviewQueue:v1";
  const MEMBER_LOCK_TEXT = "任務、推廣、VIP、點數或任何前台操作都不會讓一般會員自動晉升管理員。管理員權限只能由最高管理員或一般管理員在權限控管面板指派。";
  let patched = false;
  let loadingRemote = false;

  function stateRef() {
    try { return typeof state === "undefined" ? null : state; } catch (_error) { return null; }
  }
  function escapeText(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }
  function currentRoleValue() {
    const appState = stateRef();
    const email = String(appState?.authUser?.email || appState?.profile?.email || "").toLowerCase();
    if (email === "set874872@gmail.com") return "super_admin";
    try { if (typeof currentRole === "function") return currentRole(); } catch (_error) {}
    return appState?.profile?.role_id || appState?.profile?.role || "member";
  }
  function canReviewTasks() { return ["super_admin", "admin", "manager", "assistant", "support"].includes(currentRoleValue()); }
  function readQueue() { try { const raw = localStorage.getItem(REVIEW_KEY); return raw ? JSON.parse(raw) : []; } catch (_error) { return []; } }
  function writeQueue(rows) { localStorage.setItem(REVIEW_KEY, JSON.stringify(rows)); }
  function currentUserLabel() { const appState = stateRef(); return appState?.profile?.display_name || appState?.authUser?.email || "目前會員"; }
  function findTaskRow(name) { try { return taskRows.find((row) => row[0] === name) || null; } catch (_error) { return null; } }
  function normalizeTaskText(value) { return String(value ?? "").replace(/Email 與安全設定/g, "Email 驗證"); }

  function addLocalReview(taskName, status) {
    const task = findTaskRow(taskName);
    const rows = readQueue();
    const existing = rows.find((row) => row.taskTitle === taskName && row.status === "pending");
    if (existing) return existing;
    const row = {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      taskTitle: taskName,
      reward: task?.[1] || "-",
      condition: normalizeTaskText(task?.[2] || "會員提交審核"),
      member: currentUserLabel(),
      status: status || "pending",
      source: "local",
      submittedAt: new Date().toISOString()
    };
    rows.unshift(row);
    writeQueue(rows.slice(0, 80));
    return row;
  }

  function patchTaskSubmit() {
    if (typeof completeTask !== "function" || completeTask.__taskReviewPatched) return;
    const originalCompleteTask = completeTask;
    completeTask = function patchedCompleteTask(taskName) {
      const appState = stateRef();
      const currentStatus = appState?.taskStatus?.[taskName];
      if (currentStatus !== "可完成") return originalCompleteTask.apply(this, arguments);
      const task = findTaskRow(taskName);
      addLocalReview(taskName, "pending");
      appState.taskStatus[taskName] = "審核中";
      const db = window.NexaDB;
      if (db?.client && db?.submitTask) submitTaskToBackend(taskName).catch(() => null);
      if (typeof showToast === "function") showToast("任務已送出審核，請等待後台管理員處理。");
      if (typeof render === "function") render();
      return task;
    };
    completeTask.__taskReviewPatched = true;
  }

  async function submitTaskToBackend(taskName) {
    const db = window.NexaDB;
    if (!db?.client || !db?.submitTask) return null;
    const { data, error } = await db.client.from("tasks").select("id,title,audit_mode").eq("title", taskName).maybeSingle();
    if (error || !data?.id) return null;
    const result = await db.submitTask(data.id);
    if (result?.ok && data.audit_mode === "auto") {
      const appState = stateRef();
      if (appState?.taskStatus) appState.taskStatus[taskName] = "已完成";
    }
    return result;
  }

  async function loadRemoteReviews() {
    const db = window.NexaDB;
    const appState = stateRef();
    if (!db?.client || !appState?.authUser || !canReviewTasks() || loadingRemote) return;
    loadingRemote = true;
    try {
      const { data, error } = await db.client.from("task_completions").select("id,status,progress,created_at,user_id,task:tasks(title,reward_points,condition_json,audit_mode),user:users(email,display_name)").eq("status", "pending").order("created_at", { ascending: false }).limit(80);
      if (!error && Array.isArray(data)) {
        appState.taskReviewRows = data.map((row) => ({
          id: row.id,
          taskTitle: row.task?.title || row.task_id || "任務",
          reward: `${row.task?.reward_points ?? 0} 點`,
          condition: row.task?.condition_json?.required || "待管理員審核",
          member: row.user?.display_name || row.user?.email || row.user_id || "會員",
          status: row.status,
          source: "supabase",
          submittedAt: row.created_at
        }));
        if (location.pathname === "/admin/tasks" && typeof render === "function") render();
      }
    } catch (_error) {
      // Local review queue remains available when Supabase relationships are not deployed yet.
    } finally {
      loadingRemote = false;
    }
  }

  function allReviewRows() {
    const remote = stateRef()?.taskReviewRows;
    const local = readQueue();
    return Array.isArray(remote) && remote.length ? remote : local;
  }
  function statusLabel(status) { return ({ pending: "待審核", completed: "已通過", approved: "已通過", failed: "已拒絕", rejected: "已拒絕" })[status] || status || "待審核"; }

  function renderTaskReviewPanel() {
    if (!canReviewTasks()) {
      return `<section class="container section-tight"><article class="panel task-review-panel"><p class="eyebrow">Task Review</p><h2>任務審核</h2><p>你的帳號權限不足，無法審核任務。</p></article></section>`;
    }
    const rows = allReviewRows();
    return `
      <section class="container section">
        <article class="panel task-review-panel energy-border">
          <div class="task-review-head"><div><p class="eyebrow">Task Review</p><h2>待審核任務</h2><p>會員送出需要人工審核的任務後，會進入此清單。審核只會更新任務狀態與點數獎勵，不會變更帳號權限。</p></div><span class="pill">${rows.filter((row) => row.status === "pending").length} 筆待審核</span></div>
          <div class="task-review-table"><table><thead><tr><th>提交時間</th><th>會員</th><th>任務</th><th>條件</th><th>獎勵</th><th>狀態</th><th>審核</th></tr></thead><tbody>${rows.length ? rows.map(renderTaskReviewRow).join("") : `<tr><td colspan="7">目前沒有待審核任務。</td></tr>`}</tbody></table></div>
          <p class="notice">${escapeText(MEMBER_LOCK_TEXT)}</p>
        </article>
      </section>`;
  }

  function renderTaskReviewRow(row) {
    const pending = row.status === "pending";
    const date = row.submittedAt ? new Date(row.submittedAt).toLocaleString("zh-TW") : "-";
    return `<tr data-task-review-row="${escapeText(row.id)}"><td>${escapeText(date)}</td><td>${escapeText(row.member)}</td><td>${escapeText(row.taskTitle)}</td><td>${escapeText(normalizeTaskText(row.condition))}</td><td>${escapeText(row.reward)}</td><td><span class="pill">${escapeText(statusLabel(row.status))}</span></td><td>${pending ? `<div class="task-review-actions"><button type="button" data-task-review-action="approve" data-task-review-id="${escapeText(row.id)}">通過</button><button type="button" class="secondary" data-task-review-action="reject" data-task-review-id="${escapeText(row.id)}">拒絕</button></div>` : "已處理"}</td></tr>`;
  }

  async function reviewTask(id, approved) {
    if (!canReviewTasks()) {
      if (typeof showToast === "function") showToast("你的帳號權限不足，無法審核任務。");
      return;
    }
    const db = window.NexaDB;
    const remoteRows = stateRef()?.taskReviewRows || [];
    const remoteRow = remoteRows.find((row) => row.id === id);
    if (remoteRow && db?.client) {
      try {
        const { data, error } = await db.client.rpc("admin_review_task_completion", { p_completion_id: id, p_approved: approved, p_reason: approved ? "後台審核通過" : "後台審核拒絕" });
        if (!error && (!data || data.ok !== false)) {
          remoteRow.status = approved ? "completed" : "failed";
          if (typeof showToast === "function") showToast(approved ? "任務審核已通過。" : "任務已拒絕。");
          if (typeof render === "function") render();
          return;
        }
      } catch (_error) {}
    }
    const rows = readQueue();
    const row = rows.find((item) => item.id === id);
    if (row) {
      row.status = approved ? "completed" : "failed";
      row.reviewedAt = new Date().toISOString();
      writeQueue(rows);
    }
    if (typeof showToast === "function") showToast(approved ? "任務審核已通過。" : "任務已拒絕。");
    if (typeof render === "function") render();
  }

  function appendTaskNotice() {
    const app = document.getElementById("app");
    if (!app || app.querySelector("[data-member-role-lock]")) return;
    app.insertAdjacentHTML("beforeend", `<section class="container section-tight" data-member-role-lock><article class="notice">${escapeText(MEMBER_LOCK_TEXT)}</article></section>`);
  }
  function injectStyles() {
    if (document.getElementById("taskReviewWorkflowStyles")) return;
    const style = document.createElement("style");
    style.id = "taskReviewWorkflowStyles";
    style.textContent = `.task-review-panel{display:grid;gap:16px}.task-review-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.task-review-table{overflow:auto}.task-review-table table{width:100%;min-width:860px;border-collapse:collapse}.task-review-table th,.task-review-table td{padding:12px;border-bottom:1px solid rgba(86,255,135,.13);text-align:left;vertical-align:top}.task-review-table th{color:#b8ffc8;font-size:.86rem}.task-review-actions{display:flex;gap:8px;flex-wrap:wrap}.task-review-actions button{padding:8px 11px;border-radius:12px}@media (max-width:720px){.task-review-head{display:grid}.task-review-table table{min-width:760px}}`;
    document.head.appendChild(style);
  }
  function patchRender() {
    if (patched || typeof render !== "function") return patched;
    const originalRender = render;
    render = function taskReviewRender() {
      const output = originalRender.apply(this, arguments);
      if (location.pathname === "/admin/tasks") {
        const app = document.getElementById("app");
        if (app && !app.querySelector(".task-review-panel")) app.insertAdjacentHTML("beforeend", typeof brandText === "function" ? brandText(renderTaskReviewPanel()) : renderTaskReviewPanel());
        loadRemoteReviews().catch(() => null);
      }
      if (location.pathname === "/tasks") appendTaskNotice();
      return output;
    };
    render.__taskReviewWorkflowPatched = true;
    patched = true;
    render();
    return true;
  }
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-task-review-action]");
    if (!action) return;
    event.preventDefault();
    reviewTask(action.dataset.taskReviewId, action.dataset.taskReviewAction === "approve");
  });
  injectStyles();
  const timer = window.setInterval(() => { patchTaskSubmit(); injectStyles(); if (patchRender()) window.clearInterval(timer); }, 30);
  window.setTimeout(() => window.clearInterval(timer), 10000);
})();