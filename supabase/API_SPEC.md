# NexaPredict OS API 規格

## Auth

| Method | Path | 說明 |
|---|---|---|
| POST | `/api/auth/register` | 註冊會員並建立錢包 |
| POST | `/api/auth/login` | 會員登入 |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/me` | 取得會員、錢包、會員權益 |

## Frontend

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/predictions` | 取得可見內容列表 |
| GET | `/api/predictions/:id` | 未解鎖回傳摘要，已解鎖回傳完整內容 |
| POST | `/api/predictions/:id/unlock` | 使用點數或權限解鎖內容 |
| GET | `/api/products` | 取得商品與方案 |
| POST | `/api/orders` | 建立商品或點數包訂單 |
| GET | `/api/wallet` | 取得錢包摘要與點數流水 |
| GET | `/api/referrals` | 取得推廣中心資料 |
| POST | `/api/tasks/:id/submit` | 提交任務 |

## Payment

| Method | Path | 說明 |
|---|---|---|
| POST | `/api/payments/webhook` | 付款通知，使用 `webhook_event_id` 防止重複處理 |
| GET | `/api/orders/:id` | 查詢訂單 |
| POST | `/api/orders/:id/mark-abnormal` | 管理員標記異常訂單 |

## Admin

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/dashboard` | 後台儀表板 |
| GET | `/api/admin/users` | 搜尋會員 |
| PATCH | `/api/admin/users/:id` | 停權、等級、VIP 到期時間 |
| GET | `/api/admin/predictions` | 內容列表 |
| POST | `/api/admin/predictions` | 新增內容 |
| PATCH | `/api/admin/predictions/:id` | 編輯內容與上下架 |
| DELETE | `/api/admin/predictions/:id` | 刪除或封存內容 |
| POST | `/api/admin/points/adjust` | 手動補點或扣點，原因必填 |
| POST | `/api/admin/referrals/:rewardId/review` | 審核推廣獎勵 |
| GET | `/api/admin/risk` | 風控列表 |
| PATCH | `/api/admin/risk/:id` | 標記已處理 |
| PATCH | `/api/admin/seo/:path` | 更新 SEO |
| PATCH | `/api/admin/settings` | 更新白標設定 |

## 權限

- `super_admin`：全部 API。
- `admin`：營運、會員、點數、訂單、推廣、任務、風控。
- `editor`：內容、分類、SEO。
- `support`：會員與訂單查詢、客服處理。
- `agent`：自身推廣資料。
- `member`：前台會員 API。

## 點數流水

所有點數 API 都必須寫入 `point_transactions`。

必要欄位：

- `user_id`
- `wallet_id`
- `transaction_type`
- `source`
- `amount`
- `status`
- `balance_after`
- `idempotency_key`
- `reference_table`
- `reference_id`
- `note`

管理員調整、退款、凍結與解凍必須寫入 `audit_logs`。
