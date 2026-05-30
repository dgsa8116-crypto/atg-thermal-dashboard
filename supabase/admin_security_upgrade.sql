-- Admin security upgrade for 黑曜智流 AI.
-- Target Supabase project: atg-thermal-auth (tmqssmdgdambgvnghqzb), ap-northeast-1.
-- Run after the base schema has been deployed.

-- Fail early with a clear message if the base schema has not been installed.
do $$
begin
  if to_regclass('public.roles') is null
     or to_regclass('public.users') is null
     or to_regclass('public.audit_logs') is null then
    raise exception 'Base schema is missing. Deploy supabase/schema.sql before admin_security_upgrade.sql.';
  end if;
end;
$$;

insert into public.roles (id, name, level, description)
values
  ('super_admin', '最高管理員', 100, '全系統最高權限，固定管理信箱 set874872@gmail.com'),
  ('admin', '一般管理員', 80, '一般管理員，可指派小助理並管理營運資料'),
  ('manager', '營運主管', 70, '內容、會員、推廣與營運檢視權限'),
  ('editor', '內容編輯', 60, '內容與 SEO 權限'),
  ('assistant', '小助理', 50, '協作與查詢權限，不可指派管理員'),
  ('support', '客服人員', 40, '會員、訂單與客服查詢'),
  ('agent', '代理推廣', 20, '推廣報表與下線管理'),
  ('user', '一般使用者', 0, '前台會員'),
  ('member', '一般會員', 0, '前台會員'),
  ('guest', '訪客', -10, '未登入訪客')
on conflict (id) do update
set name = excluded.name,
    level = excluded.level,
    description = excluded.description;

create or replace function public.enforce_primary_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) = 'set874872@gmail.com' then
    new.role_id := 'super_admin';
    new.status := 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists users_primary_super_admin on public.users;
create trigger users_primary_super_admin
before insert or update on public.users
for each row execute function public.enforce_primary_super_admin();

-- Ensure the protected admin profile exists when the Auth user already exists.
insert into public.users (id, email, display_name, avatar_url, role_id, status, email_verified)
select
  au.id,
  au.email,
  coalesce(
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'name',
    split_part(coalesce(au.email, 'set874872'), '@', 1)
  ) as display_name,
  coalesce(au.raw_user_meta_data ->> 'avatar_url', au.raw_user_meta_data ->> 'picture') as avatar_url,
  'super_admin' as role_id,
  'active' as status,
  au.email_confirmed_at is not null as email_verified
from auth.users au
where lower(coalesce(au.email, '')) = 'set874872@gmail.com'
on conflict (id) do update
set email = excluded.email,
    display_name = coalesce(public.users.display_name, excluded.display_name),
    avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
    role_id = 'super_admin',
    status = 'active',
    email_verified = public.users.email_verified or excluded.email_verified,
    updated_at = timezone('utc', now());

update public.users
set role_id = 'super_admin',
    status = 'active',
    updated_at = timezone('utc', now())
where lower(coalesce(email, '')) = 'set874872@gmail.com';

create or replace function public.admin_list_role_users()
returns table (
  id uuid,
  email text,
  display_name text,
  role_id text,
  status text,
  current_login_at timestamptz,
  last_login_at timestamptz,
  login_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role_level() < 80 then
    raise exception 'permission denied';
  end if;

  return query
  select
    u.id,
    u.email,
    u.display_name,
    case
      when lower(coalesce(u.email, '')) = 'set874872@gmail.com' then 'super_admin'
      else u.role_id
    end as role_id,
    u.status,
    u.current_login_at,
    u.last_login_at,
    u.login_count
  from public.users u
  left join public.roles r on r.id = u.role_id
  order by
    case
      when lower(coalesce(u.email, '')) = 'set874872@gmail.com' then 100
      else coalesce(r.level, 0)
    end desc,
    u.current_login_at desc nulls last,
    u.email asc;
end;
$$;

create or replace function public.admin_assign_role_by_email(
  p_target_email text,
  p_role_id text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role text;
  v_actor_level integer;
  v_target public.users%rowtype;
  v_target_before jsonb;
  v_role public.roles%rowtype;
  v_email text := lower(trim(coalesce(p_target_email, '')));
  v_reason text := trim(coalesce(p_reason, ''));
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  select u.role_id, r.level
  into v_actor_role, v_actor_level
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = v_actor;

  if v_actor_level is null or v_actor_level < 80 then
    return jsonb_build_object('ok', false, 'message', '你的帳號權限不足，無法指派角色。');
  end if;

  if v_reason = '' then
    return jsonb_build_object('ok', false, 'message', '請填寫權限調整原因。');
  end if;

  select * into v_role from public.roles where id = p_role_id;
  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到指定角色。');
  end if;

  if p_role_id = 'super_admin' then
    return jsonb_build_object('ok', false, 'message', '最高管理員固定由系統信箱保護，不能透過面板指派。');
  end if;

  if v_actor_role <> 'super_admin' and p_role_id not in ('assistant', 'member', 'user') then
    return jsonb_build_object('ok', false, 'message', '一般管理員只能指派小助理或會員權限。');
  end if;

  select * into v_target
  from public.users
  where lower(coalesce(email, '')) = v_email
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到此帳號，請確認對方已完成註冊或至少登入一次。');
  end if;

  if lower(coalesce(v_target.email, '')) = 'set874872@gmail.com' then
    return jsonb_build_object('ok', false, 'message', '最高管理員帳號不可降級或改派。');
  end if;

  if v_target.id = v_actor then
    return jsonb_build_object('ok', false, 'message', '不能調整自己的帳號權限。');
  end if;

  v_target_before := to_jsonb(v_target);

  update public.users
  set role_id = p_role_id,
      updated_at = timezone('utc', now())
  where id = v_target.id;

  perform public.write_audit_log(
    'admin_assign_role',
    'users',
    v_target.id::text,
    v_target_before,
    jsonb_build_object('email', v_target.email, 'role_id', p_role_id),
    v_reason
  );

  return jsonb_build_object(
    'ok', true,
    'message', '帳號權限已更新為：' || v_role.name,
    'target_email', v_target.email,
    'role_id', p_role_id
  );
end;
$$;

-- Lock RPC entrypoints to authenticated users only.
revoke all on function public.enforce_primary_super_admin() from public, anon, authenticated;
revoke all on function public.admin_list_role_users() from public, anon;
revoke all on function public.admin_assign_role_by_email(text, text, text) from public, anon;
grant execute on function public.admin_list_role_users() to authenticated;
grant execute on function public.admin_assign_role_by_email(text, text, text) to authenticated;

notify pgrst, 'reload schema';
