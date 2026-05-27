# Supabase 資料庫安裝順序

1. 到 Supabase 專案。
2. 進入 `SQL Editor`。
3. 新增 Query。
4. 貼上 `schema.sql` 全部內容。
5. 按 `Run`。
6. 到 `Authentication` → `Users` 建立你的管理員帳號，或先在網站註冊。
7. 回到 `SQL Editor`，把你的 Email 改成超級管理員：

```sql
update public.profiles
set role = 'super_admin'
where email = '你的Email';
```

8. 到 `Project Settings` → `API`，複製：
   - Project URL
   - Publishable key

9. 將網站第一層的 `supabase-config.js` 改成：

```js
window.PULSEPLAY_SUPABASE = {
  url: "https://你的專案.supabase.co",
  publishableKey: "你的 publishable key"
};
```

不要把 `secret key` 放進 GitHub Pages。公開網站只需要 `publishable key`。

## 權限結構

- `super_admin`：100% 權限，可指派管理員與調整核心資料。
- `admin`：可管理會員、任務、商品、積分與審核。
- `admin_assistant`：可查看資料與處理基礎審核，不可指派管理角色。
- `member`：一般會員。

## 已解禁文字限制

`site_settings.restricted_terms` 預設為空陣列，代表網站資料庫不會封鎖特定文字。若日後要重新限制，可自行更新此欄位。
