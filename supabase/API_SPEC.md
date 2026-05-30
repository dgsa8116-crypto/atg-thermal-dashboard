# 黑曜智流 AI API 規格

本文件描述前端應呼叫的主要資料與 RPC 行為。正式資料庫為 Supabase 專案 `atg-thermal-auth`。

## 1. 身份驗證

| 功能 | Supabase / RPC | 權限 | 說明 |
|---|---|---|---|
| Email 註冊 | `auth.signUp()` | 訪客 | 建立 Auth 使用者，資料表 trigger 會建立 `users` 與 `wallets`。 |
| Email 登入 | `auth.signInWithPassword()` | 訪客 | 登入後進入主控台。 |
| LINE 快速登入 | `auth.signInWithOAuth({ provider: 'line' })` | 訪客 | 登入後保存 LINE 識別碼、顯示名稱與頭像。 |
| 登出 | `auth.signOut()` | 已登入 | 清除登入狀態並返回登入頁。 |
| 登入紀錄 | `record_login_event()` | 已登入 | 更新最後登入時間並寫入 `login_records`。 |
| 修改密碼 | `auth.updateUser({ password })` | 已登入 | 會員中心安全設定使用。 |

## 2. 會員與權限

| 功能 | RPC / Table | 權限 | 說明 |
|---|---|---|---|
| 讀取自己資料 | `users` | 已登入 | 會員基本資料、角色、帳號狀態。 |
| 檢查角色等級 | `current_role_level()` | 已登入 | 後端權限判斷用。 |
| 權限列表 | `admin_list_role_users()` | 一般管理員以上 | `/admin/roles` 顯示帳號權限列表。 |
| 指派角色 | `admin_assign_role_by_email(email, role, reason)` | 一般管理員以上 | 最高管理員可指派一般管理員；一般管理員可指派小助理。 |
| 稽核紀錄 | `audit_logs` | 管理員 | 權限變更與手動操作都必須寫入。 |

## 3. 體育預測內容

| 功能 | RPC / Table | 權限 | 說明 |
|---|---|---|---|
| 賽事列表 | `predictions` / sports data | 已登入 | 顯示今日、明日、熱門與最新賽事。 |
| 內容詳情 | `predictions` | 已登入 | 未解鎖只能看摘要。 |
| 解鎖勝率 | `unlock_prediction(prediction_id)` | 已登入且點數足夠 | 扣點後建立 `prediction_unlocks`。 |
| 後台管理內容 | `predictions` | 編輯以上 | 新增、編輯、上下架與結算。 |

## 4. 點數與訂單

| 功能 | RPC / Table | 權限 | 說明 |
|---|---|---|---|
| 錢包查詢 | `wallets` | 已登入 | 顯示餘額、待入帳、凍結與即將到期點數。 |
| 點數流水 | `point_transactions` | 已登入 | 所有點數異動都必須寫流水。 |
| 建立訂單 | `create_order(product_id)` | 已登入 | 建立點數包、VIP 或虛擬商品訂單。 |
| 兌換商品 | `redeem_product(product_id)` | 已登入 | 依商品規則扣點或建立兌換紀錄。 |
| 管理員調整點數 | `admin_adjust_points(user_id, amount, reason)` | 管理員 | 必須填寫原因並寫入 audit log。 |

## 5. 推廣與任務

| 功能 | RPC / Table | 權限 | 說明 |
|---|---|---|---|
| 推廣資料 | `referrals` | 已登入 | 顯示邀請碼、下線與獎勵狀態。 |
| 推廣獎勵審核 | `admin_review_referral_reward(id, approved, reason)` | 管理員 | 狀態為 `pending`、`approved`、`rejected`。 |
| 任務列表 | `tasks` | 已登入 | 顯示每日、驗證、推廣與活動任務。 |
| 送出任務 | `submit_task(task_id)` | 已登入 | 建立 `task_completions`。 |

## 6. 後台安全原則

- 未登入不可存取主系統。
- 前端需隱藏無權限功能，但後端 RPC 必須再次驗證。
- `service_role` 或 secret key 不可放在前端。
- 權限、點數、訂單、推廣審核與手動調整都必須留下 `audit_logs`。
- Webhook 必須使用 idempotency key，避免重複入帳。
