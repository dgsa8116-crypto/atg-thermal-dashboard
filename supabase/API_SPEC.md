# NexaPredict OS API 規格（A1）

## 1. Auth 與會員

| Method | Path | 說明 |
|---|---|---|
| POST | `/api/auth/register` | 註冊會員，建立 `users`、`wallets` |
| POST | `/api/auth/login` | 會員登入 |
| POST | `/api/auth/logout` | 會員登出 |
| GET | `/api/me` | 取得會員資訊、VIP、錢包摘要 |
| PATCH | `/api/me/profile` | 更新暱稱、頭像、聯絡方式 |
| POST | `/api/me/password` | 修改密碼 |
| POST | `/api/me/email/verify` | 重發驗證信 |

## 2. 前台內容與商城

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/predictions` | 取得今日、熱門、最新、VIP 內容 |
| GET | `/api/predictions/:id` | 未解鎖回摘要，已解鎖回完整內容 |
| POST | `/api/predictions/:id/unlock` | 點數或 VIP 權限解鎖內容 |
| GET | `/api/products` | 取得點數包、VIP、虛擬商品 |
| POST | `/api/orders` | 建立金流訂單（點數包或方案） |
| POST | `/api/products/:id/redeem` | 點數兌換虛擬商品（`redeem_product` RPC） |
| GET | `/api/orders/:id` | 查詢訂單 |
| GET | `/api/wallet` | 錢包摘要、待入帳、已消耗、即將到期 |
| GET | `/api/wallet/transactions` | 點數流水（支援分頁與篩選） |
| GET | `/api/referrals` | 推廣碼、邀請連結、獎勵狀態、下線列表 |
| GET | `/api/tasks` | 任務清單與進度 |
| POST | `/api/tasks/:id/submit` | 提交任務（自動或人工審核） |

## 3. 金流與 Webhook

| Method | Path | 說明 |
|---|---|---|
| POST | `/api/payments/webhook` | 支付回調，使用 `payments.webhook_event_id` 做 idempotency |
| POST | `/api/orders/:id/mark-abnormal` | 管理員標記異常訂單 |
| POST | `/api/orders/:id/refund` | 退款流程（退款後需寫點數反向流水） |

## 4. 後台 API

### 4.1 儀表板

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/dashboard` | 今日註冊、銷售、點數購買/消耗、解鎖數、推廣數、風控提醒 |

### 4.2 會員管理

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/users` | 搜尋會員、分頁查詢 |
| GET | `/api/admin/users/:id` | 會員詳情、錢包、訂單、推廣 |
| PATCH | `/api/admin/users/:id` | 停權、角色調整、VIP 到期時間 |

### 4.3 內容管理

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/predictions` | 內容列表、分類與狀態篩選 |
| POST | `/api/admin/predictions` | 新增內容 |
| PATCH | `/api/admin/predictions/:id` | 編輯、上下架、狀態調整 |
| DELETE | `/api/admin/predictions/:id` | 封存或刪除 |
| GET | `/api/admin/categories` | 分類列表 |
| POST | `/api/admin/categories` | 新增分類 |
| PATCH | `/api/admin/categories/:id` | 編輯排序與上下架 |

### 4.4 商品與訂單

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/products` | 商品列表 |
| POST | `/api/admin/products` | 新增商品 |
| PATCH | `/api/admin/products/:id` | 編輯價格、點數、庫存、上架狀態 |
| GET | `/api/admin/orders` | 訂單列表 |
| PATCH | `/api/admin/orders/:id` | 狀態更新、異常標記、退款狀態 |

### 4.5 點數、推廣、任務

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/points/transactions` | 查詢全站點數流水 |
| POST | `/api/admin/points/adjust` | 手動補點/扣點（原因必填） |
| POST | `/api/admin/points/freeze` | 凍結點數 |
| POST | `/api/admin/points/unfreeze` | 解凍點數 |
| GET | `/api/admin/referrals` | 推廣清單與獎勵審核 |
| POST | `/api/admin/referrals/:rewardId/review` | 審核推廣獎勵 |
| GET | `/api/admin/tasks` | 任務列表 |
| POST | `/api/admin/tasks` | 新增任務 |
| PATCH | `/api/admin/tasks/:id` | 編輯任務 |

### 4.6 風控、SEO、白標

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/risk` | 風控標記查詢 |
| PATCH | `/api/admin/risk/:id` | 標記已處理 |
| GET | `/api/admin/seo` | SEO 設定列表 |
| PATCH | `/api/admin/seo/:path` | 更新頁面 SEO |
| GET | `/api/admin/settings` | 白標設定 |
| PATCH | `/api/admin/settings` | 更新站名、Logo、品牌色、客服資訊、功能開關 |

## 5. 權限分層

- `super_admin`：全權限（含白標設定、角色管理、風控處置）。
- `admin`：會員、商品、訂單、點數、推廣、任務、風控。
- `editor`：內容、分類、SEO。
- `support`：會員與訂單查詢、客服處理。
- `agent`：僅能查自己的推廣資料。
- `member`：前台會員 API。

## 6. 點數與稽核規則

- 所有點數異動必須寫入 `point_transactions`，不可只改 `wallets.balance`。
- 必填欄位：`user_id`、`wallet_id`、`transaction_type`、`source`、`amount`、`status`、`balance_after`、`idempotency_key`、`reference_table`、`reference_id`。
- `transaction_type` 包含：`purchase`、`referral`、`task`、`unlock_content`、`redeem_product`、`admin_adjust`、`refund`、`freeze`、`unfreeze`、`expire`。
- 管理員手動操作、退款、推廣審核、內容上下架皆需寫入 `audit_logs`。
