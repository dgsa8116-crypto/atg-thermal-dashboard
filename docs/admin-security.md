# 最高管理員與安全設定

## 最高管理員

- 固定信箱：`set874872@gmail.com`
- 固定角色：`super_admin`
- 最高管理員擁有全系統最高權限。
- 最高管理員可進入 `/admin/roles` 專屬權限控管面板。
- 最高管理員可指派一般管理員、營運主管、小助理、客服、內容編輯與會員角色。
- 最高管理員信箱由資料庫 trigger `enforce_primary_super_admin()` 強制保護，不能透過前台降級。

## 一般管理員

- 角色：`admin`
- 可進入管理後台。
- 可指派小助理、客服與會員角色。
- 不可建立或指派最高管理員。

## 小助理

- 角色：`assistant`
- 可作為協作與查詢權限使用。
- 不可指派管理員。
- 不可調整最高權限。

## 後端權限規則

正式權限變更必須呼叫 Supabase RPC：

```sql
public.admin_assign_role_by_email(p_target_email, p_role_id, p_reason)
```

後端會檢查：

- 操作者是否已登入。
- 操作者是否為最高管理員或一般管理員。
- 一般管理員只能指派小助理、客服、會員或一般使用者。
- 最高管理員帳號 `set874872@gmail.com` 不可降級或改派。
- 每次變更必須填寫原因。
- 每次變更都會寫入 `audit_logs`。

## 部署 SQL

若是新資料庫，執行 `supabase/schema.sql`。

若是既有資料庫，執行：

```txt
supabase/admin_security_upgrade.sql
```

## 密碼修改

會員中心 `/account` 已新增安全設定與修改密碼表單。

- Email 登入帳號建議輸入目前密碼後再修改。
- 新密碼至少 8 碼。
- 兩次新密碼必須一致。
- 密碼更新走 Supabase Auth `updateUser({ password })`。
