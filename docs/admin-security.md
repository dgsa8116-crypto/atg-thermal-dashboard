# 最高管理員與 Supabase 權限部署

## 正式 Supabase 專案

- 專案名稱：`atg-thermal-auth`
- Project ref：`tmqssmdgdambgvnghqzb`
- Project URL：`https://tmqssmdgdambgvnghqzb.supabase.co`
- 最高管理員信箱：`set874872@gmail.com`

## 權限規則

- `set874872@gmail.com` 會被 trigger 強制維持為 `super_admin`。
- 最高管理員可指派一般管理員、營運主管、小助理、客服、內容編輯與會員。
- 一般管理員可指派小助理，並可將帳號降回一般會員。
- 小助理不可指派權限。
- 所有權限變更必須填寫原因並寫入 `audit_logs`。

## 需要部署的 SQL

既有資料庫請執行：

```sql
-- supabase/admin_security_upgrade.sql
```

全新資料庫請先執行 `supabase/schema.sql`，再確認 `supabase/admin_security_upgrade.sql` 已套用。

## 前端入口

- 權限控管面板：`/admin/roles`
- 會員安全設定：`/account`
- 登入頁：`/login`
