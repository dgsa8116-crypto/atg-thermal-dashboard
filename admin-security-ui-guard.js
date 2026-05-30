"use strict";

(function installAdminRoleUiGuard() {
  const SUPER_ADMIN_EMAIL = "set874872@gmail.com";

  function stateRef() {
    try {
      return typeof state === "undefined" ? null : state;
    } catch (_error) {
      return null;
    }
  }

  function currentEmail() {
    const appState = stateRef();
    return String(appState?.authUser?.email || appState?.profile?.email || "").toLowerCase();
  }

  function currentRoleValue() {
    if (currentEmail() === SUPER_ADMIN_EMAIL) return "super_admin";
    try {
      if (typeof currentRole === "function") return currentRole();
    } catch (_error) {
      // Fall back to state profile below.
    }
    const appState = stateRef();
    return appState?.profile?.role_id || appState?.profile?.role || "member";
  }

  function tightenRoleSelects() {
    if (currentRoleValue() !== "admin") return;
    document.querySelectorAll('[data-role-assign-form] select[name="role"]').forEach((select) => {
      select.querySelectorAll('option[value="support"], option[value="manager"], option[value="editor"], option[value="admin"]').forEach((option) => option.remove());
      if (!select.value || select.value === "support" || select.value === "manager" || select.value === "editor" || select.value === "admin") {
        select.value = select.querySelector('option[value="assistant"]') ? "assistant" : select.options[0]?.value || "";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", tightenRoleSelects);
  document.addEventListener("click", () => window.setTimeout(tightenRoleSelects, 0), true);
  document.addEventListener("focusin", tightenRoleSelects, true);
  window.setInterval(tightenRoleSelects, 500);
})();
