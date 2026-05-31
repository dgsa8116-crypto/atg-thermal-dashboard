# Supabase 串接與部署說明

本專案正式 Supabase 專案為：

- 專案名稱：`atg-thermal-auth`
- Project ref：`tmqssmdgdambgvnghqzb`
- Region：`ap-northeast-1`
- Project URL：`https://tmqssmdgdambgvnghqzb.supabase.co`

## 部署順序

1. 到 Supabase Dashboard 開啟 `atg-thermal-auth`。
2. 進入 `SQL Editor`。
3. 全新資料庫請先執行 `supabase/schema.sql`。
4. 既有資料庫只需要補上最高管理員與權限控管時，執行 `supabase/admin_security_upgrade.sql`。
5. 需要任務人工審核時，執行 `supabase/task_review_workflow.sql`。
6. 到 `Authentication` 建立或登入 `set874872@gmail.com`。
7. 系統會自動把 `set874872@gmail.com` 鎖定為 `super_admin`，不可被前台降級。

## 前端設定

網站第一層的 `supabase-config.js` 應保持：

```js
window.NEXA_SUPABASE = {
  url: "https://tmqssmdgdambgvnghqzb.supabase.co",
  publishableKey: "sb_publishable_OIpT-pRIgaqFIr-NfFjqEQ_3LyP5sAH"
};
```

注意：GitHub Pages 前端只能放 publishable key，不可放 service role 或 secret key。

## LINE Login 設定

1. 到 LINE Developers 建立 LINE Login Channel。
2. 在 LINE Login callback URL 加入正式網站登入網址，例如：`https://你的網域/login`。
3. 到 Supabase `Authentication` → `Providers` 啟用 LINE。
4. 填入 LINE Channel ID 與 Channel Secret。
5. 使用者 LINE 登入後，`record_login_event()` 會保存 LINE 識別碼、顯示名稱、頭像、登入時間與登入紀錄。

## 角色與權限

- `super_admin`：最高管理員，固定信箱 `set874872@gmail.com`，可指派一般管理員、小助理與其他營運角色。
- `admin`：一般管理員，可指派小助理，並可將帳號降回一般會員。
- `assistant`：小助理，可協助查詢與處理指定資料，不可指派管理員。
- `member` / `user`：一般會員，只能使用前台功能。

## 後端安全規則

- 權限變更必須透過 `admin_assign_role_by_email()`。
- 權限列表必須透過 `admin_list_role_users()`。
- 任務審核必須透過 `admin_review_task_completion()`。
- 所有正式權限變更都會寫入 `audit_logs`。
- `set874872@gmail.com` 由 trigger `users_primary_super_admin` 強制維持最高管理員。
- 前端隱藏無權限功能，後端 RPC 也會再次驗證權限。
- 一般會員不能透過任務、推廣、VIP、點數或前台操作自動晉升管理員。
