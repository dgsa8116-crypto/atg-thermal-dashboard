# PulsePlay 積分商城｜可直接上架版

這是一個可直接部署到 GitHub Pages 的繁體中文靜態網站，主題為「娛樂型預測遊戲積分商城」。

## 已包含頁面

- `/` 首頁
- `/earn-points` 積分任務頁
- `/shop` 虛擬商城頁
- `/shop/challenge-ticket` 商品詳情頁
- `/shop/hint-card` 商品詳情頁
- `/inventory` 我的背包頁
- `/predictions` 預測挑戰頁
- `/wallet` 積分錢包頁
- `/referral` 邀請好友頁
- `/leaderboard` 排行榜頁
- `/account` 會員中心
- `/faq` FAQ
- `/terms` 使用條款與隱私權
- `/admin-plan` 後台管理介面規劃
- `/seo-plan` SEO 與轉換率規劃

## 已包含資料庫

- `supabase/schema.sql`：完整 Supabase schema、RLS 權限、RPC 函式與種子資料
- `supabase/README.md`：資料庫建立順序
- `supabase-config.js`：公開前端設定檔，只填 Supabase URL 與 publishable key
- `database.js`：前端資料庫連線層

已包含的資料表：

- `profiles` 會員資料、角色、狀態與積分
- `point_ledger` 積分流水
- `tasks` 任務
- `user_tasks` 任務送審與審核
- `products` 虛擬商品
- `inventory_items` 我的背包
- `predictions` 預測挑戰
- `prediction_entries` 參與紀錄
- `referrals` 邀請好友
- `payments` 點數購買紀錄
- `risk_alerts` 風控警示
- `admin_audit_logs` 後台操作紀錄
- `monitor_devices` 外接監測端配對
- `monitor_device_snapshots` 外接監測端即時資料
- `site_settings` 網站設定

## Supabase 串接順序

1. 到 Supabase 專案的 `SQL Editor`。
2. 貼上 `supabase/schema.sql` 全部內容並執行。
3. 到 `Authentication` 建立你的帳號，或先在網站註冊。
4. 回到 `SQL Editor`，把你的帳號設成超級管理員：

```sql
update public.profiles
set role = 'super_admin'
where email = '你的Email';
```

5. 到 `Project Settings` → `API` 複製 `Project URL` 與 `Publishable key`。
6. 編輯網站第一層 `supabase-config.js`：

```js
window.PULSEPLAY_SUPABASE = {
  url: "https://你的專案.supabase.co",
  publishableKey: "你的 publishable key"
};
```

公開網站不要放 `secret key`。

## 權限設計

- `super_admin`：100% 權限，可在資料庫與後台 RPC 指派其他角色。
- `admin`：管理會員、任務、商品、積分與審核。
- `admin_assistant`：查看資料與處理基礎審核。
- `member`：一般會員。

## 禁用字設定

資料庫已解禁禁用文字。`site_settings.restricted_terms` 預設為空陣列，代表不封鎖指定文字。日後若要重新限制，可自行在 Supabase 更新該欄位。

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

若要使用裸網域 `tntlinebotseemyeyes.online`，Namecheap DNS 建議設定：

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

## 重要聲明

本平台為娛樂型預測遊戲與虛擬商品服務。所有積分與虛擬商品僅限站內使用，不具現金價值，不可轉售，不可兌換現金；平台不提供投資、金錢型競猜或結果承諾服務。

## 發布前檢查

- `index.html` 存在於第一層
- `404.html` 存在於第一層，可支援 GitHub Pages 子路由
- `CNAME` 存在於第一層
- `sitemap.xml` 與 `robots.txt` 存在於第一層
- 不填 Supabase 時可展示完整網站；填完 Supabase 後會讀取資料庫
- `supabase/schema.sql` 已包含會員、任務、商品、背包、錢包、權限與外接監測資料表
- 不需要安裝擴充即可瀏覽網站
