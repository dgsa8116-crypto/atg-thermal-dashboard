-- Admin security upgrade for 黑曜智流 AI.
-- Run this file in Supabase SQL Editor after the base schema.

insert into public.roles (id, name, level, description)
values
  ('super_admin', '最高管理員', 100, '全系統最高權限，固定管理信箱 set874872@gmail.com'),
  ('admin', '一般管理員', 80, '一般管理員，可指派小助理並管理營運資料'),
  ('assistant', '小助理', 50, '協作與查詢權限，不可指派管理員'),
  ('member', '一般會員', 0, '前台會員')
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
    case when lower(coalesce(u.email, '')) = 'set874872@gmail.com' then 'super_admin' else u.role_id end as role_id,
    u.status,
    u.current_login_at,
    u.last_login_at,
    u.login_count
  from public.users u
  left join public.roles r on r.id = u.role_id
  order by
    case when lower(coalesce(u.email, '')) = 'set874872@gmail.com' then 100 else coalesce(r.level, 0) end desc,
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
    return jsonb_build_object('ok', false, 'message', '變更權限必須填寫原因。');
  end if;

  select * into v_role from public.roles where id = p_role_id;
  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到指定角色。');
  end if;

  if p_role_id = 'super_admin' then
    return jsonb_build_object('ok', false, 'message', '最高管理員固定由系統信箱保護，不能透過面板指派。');
  end if;

  if v_actor_role <> 'super_admin' and p_role_id not in ('assistant', 'support', 'member', 'user') then
    return jsonb_build_object('ok', false, 'message', '一般管理員只能指派小助理或會員權限。');
  end if;

  select * into v_target
  from public.users
  where lower(coalesce(email, '')) = v_email
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到目標帳號，請確認對方已註冊並登入過一次。');
  end if;

  if lower(coalesce(v_target.email, '')) = 'set874872@gmail.com' then
    return jsonb_build_object('ok', false, 'message', '最高管理員帳號不可降級或改派。');
  end if;

  if v_target.id = v_actor then
    return jsonb_build_object('ok', false, 'message', '不能變更自己的帳號權限。');
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
    'message', '帳號權限已更新為「' || v_role.name || '」。',
    'target_email', v_target.email,
    'role_id', p_role_id
  );
end;
$$;

grant execute on function public.admin_list_role_users() to authenticated;
grant execute on function public.admin_assign_role_by_email(text, text, text) to authenticated;

notify pgrst, 'reload schema';
