# Supabase 資料庫安裝順序

1. 開啟 Supabase 專案。
2. 進入 `SQL Editor`。
3. 新增 Query。
4. 貼上 `schema.sql` 全部內容。
5. 按 `Run`。
6. 到 `Authentication` 建立你的管理員帳號，或先在網站註冊。
7. 回到 `SQL Editor`，把你的 Email 改成超級管理員：

```sql
update public.users
set role_id = 'super_admin'
where email = '你的Email';
```

8. 到 `Project Settings` → `API` 複製：

- Project URL
- Publishable key

9. 將網站第一層的 `supabase-config.js` 改成：

```js
window.NEXA_SUPABASE = {
  url: "https://你的專案.supabase.co",
  publishableKey: "你的 publishable key"
};
```

不要把 `secret key` 放進 GitHub Pages。公開網站只需要 `publishable key`。

## 權限結構

- `super_admin`：全系統與白標管理權限。
- `admin`：營運管理權限。
- `editor`：內容與 SEO 權限。
- `support`：會員、訂單與客服查詢權限。
- `agent`：推廣報表與下線管理。
- `member`：一般會員。

## 核心規則

- 點數以 `point_transactions` 為唯一可信流水。
- `wallets` 只保存餘額快照。
- Webhook 必須使用 `webhook_event_id` 防止重複處理。
- 管理員手動操作必須寫入 `audit_logs`。
- 推廣獎勵狀態為 `pending`、`approved`、`rejected`。
- 未解鎖內容不可查看 `full_content`，前端與 API 都要檢查權限。
