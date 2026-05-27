# NexaPredict OS｜可直接上架版

這是一套繁體中文「娛樂預測內容後台＋會員點數＋推廣積分系統」，可部署到 GitHub Pages 作為白標 SaaS 展示站，也可串接 Supabase 作為會員、點數、內容、推廣與後台資料庫。

## 產品定位

本系統提供：

- 預測內容管理
- 會員註冊與登入
- 點數錢包
- 點數解鎖內容
- 推廣邀請與積分獎勵
- 任務中心
- 虛擬商品商城
- 後台管理
- SEO 管理
- 白標設定

本系統不處理投注、不提供現金兌換、不保證任何預測結果。

## 前台頁面

- `/` 首頁
- `/predictions` 預測內容頁
- `/predictions/daily-signal` 預測內容詳情頁
- `/shop` 點數商城
- `/wallet` 點數錢包
- `/referral` 推廣中心
- `/tasks` 任務中心
- `/account` 會員中心
- `/faq` FAQ
- `/terms` 條款

## 後台頁面

- `/admin` 後台儀表板
- `/admin/users` 會員管理
- `/admin/predictions` 預測內容管理
- `/admin/categories` 分類管理
- `/admin/products` 商品管理
- `/admin/orders` 訂單管理
- `/admin/points` 點數管理
- `/admin/referrals` 推廣管理
- `/admin/tasks` 任務管理
- `/admin/risk` 風控管理
- `/admin/seo` SEO 管理
- `/admin/settings` 白標設定

## 資料庫

`supabase/schema.sql` 已包含指定資料表：

- `users`
- `roles`
- `permissions`
- `wallets`
- `point_transactions`
- `predictions`
- `prediction_categories`
- `products`
- `orders`
- `payments`
- `referrals`
- `referral_rewards`
- `tasks`
- `task_completions`
- `memberships`
- `risk_flags`
- `audit_logs`
- `site_settings`
- `seo_settings`

另外補充 `prediction_unlocks`，用來記錄會員是否已解鎖內容。

## 點數規則

- `wallets` 只保存錢包快照。
- `point_transactions` 是唯一可信流水帳。
- 點數增加、扣除、凍結、退款、調整都要寫入 `point_transactions`。
- 管理員手動補點或扣點必須填寫原因並寫入 `audit_logs`。
- 付款 webhook 使用 `payments.webhook_event_id` 與 `orders.idempotency_key` 避免重複入帳。

## Supabase 串接順序

1. 到 Supabase 專案的 `SQL Editor`。
2. 貼上 `supabase/schema.sql` 全部內容並執行。
3. 到 `Authentication` 建立你的帳號，或先在網站註冊。
4. 回到 `SQL Editor`，把你的帳號設成超級管理員：

```sql
update public.users
set role_id = 'super_admin'
where email = '你的Email';
```

5. 到 `Project Settings` → `API` 複製 `Project URL` 與 `Publishable key`。
6. 編輯網站第一層 `supabase-config.js`：

```js
window.NEXA_SUPABASE = {
  url: "https://你的專案.supabase.co",
  publishableKey: "你的 publishable key"
};
```

公開網站不要放 `secret key`。

## 上架方式

1. 將本資料夾第一層所有檔案上傳到 GitHub repository 根目錄。
2. 到 GitHub repository 的 `Settings` → `Pages`。
3. Source 選擇 `Deploy from a branch`。
4. Branch 選擇 `main`，資料夾選擇 `/root`。
5. 等 GitHub Pages 完成部署。
6. 若使用自訂網域，確認 `CNAME` 內容為：

```txt
tntlinebotseemyeyes.online
```

## Namecheap DNS 建議

```txt
Type: A Record
Host: @
Value: 185.199.108.153

Type: A Record
Host: @
Value: 185.199.109.153

Type: A Record
Host: @
Value: 185.199.110.153

Type: A Record
Host: @
Value: 185.199.111.153

Type: CNAME Record
Host: www
Value: dgsa8116-crypto.github.io.
```

## 發布前檢查

- `index.html` 存在於第一層
- `404.html` 存在於第一層，可支援 GitHub Pages 子路由
- `CNAME` 存在於第一層
- `sitemap.xml` 與 `robots.txt` 存在於第一層
- `supabase/schema.sql` 已包含資料庫結構、RLS、RPC 與種子資料
- `supabase/API_SPEC.md` 已包含前後端 API 規格
- 不填 Supabase 時可展示完整網站；填完 Supabase 後可接會員與資料庫
