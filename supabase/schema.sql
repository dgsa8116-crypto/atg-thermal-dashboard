create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.normalize_profile_role(p_role text)
returns text
language sql
stable
set search_path = public
as $$
  select case lower(trim(coalesce(p_role, 'member')))
    when 'owner' then 'super_admin'
    when 'super' then 'super_admin'
    when 'superadmin' then 'super_admin'
    when 'super_admin' then 'super_admin'
    when 'admin' then 'admin'
    when 'manager' then 'admin'
    when 'moderator' then 'admin_assistant'
    when 'assistant' then 'admin_assistant'
    when 'admin_assistant' then 'admin_assistant'
    when 'vip' then 'vip'
    else 'member'
  end
$$;

create or replace function public.profile_role_level(p_role text)
returns integer
language sql
stable
set search_path = public
as $$
  select case public.normalize_profile_role(p_role)
    when 'super_admin' then 100
    when 'admin' then 70
    when 'admin_assistant' then 40
    when 'vip' then 10
    else 0
  end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  phone text,
  role text not null default 'member',
  status text not null default 'active',
  level_name text not null default 'Lv.1',
  badge text not null default '新手徽章',
  points integer not null default 100,
  last_checkin_at date,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists phone text,
  add column if not exists status text not null default 'active',
  add column if not exists level_name text not null default 'Lv.1',
  add column if not exists settings jsonb not null default '{}'::jsonb;

update public.profiles
set
  role = public.normalize_profile_role(role),
  status = coalesce(nullif(status, ''), 'active'),
  badge = coalesce(nullif(badge, ''), '新手徽章'),
  points = greatest(0, coalesce(points, 100)),
  settings = coalesce(settings, '{}'::jsonb);

alter table public.profiles enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.normalize_profile_role(coalesce(
    (select role from public.profiles where id = auth.uid() limit 1),
    'member'
  ))
$$;

create or replace function public.current_profile_role_level()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select public.profile_role_level(public.current_profile_role())
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() in ('super_admin', 'admin', 'admin_assistant')
$$;

drop policy if exists profiles_select_scope on public.profiles;
create policy profiles_select_scope
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own_safe on public.profiles;
create policy profiles_update_own_safe
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(coalesce(new.email, 'member'), '@', 1))
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  amount integer not null,
  balance integer not null,
  status text not null default '已完成',
  note text not null default '',
  meta jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.point_ledger enable row level security;

drop policy if exists point_ledger_select_scope on public.point_ledger;
create policy point_ledger_select_scope
on public.point_ledger
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

create table if not exists public.tasks (
  id text primary key,
  task_type text not null default '會員任務',
  title text not null,
  description text not null default '',
  reward_points integer not null default 0,
  review_time text not null default '人工審核',
  external_url text not null default '',
  sort_order integer not null default 100,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks enable row level security;

drop policy if exists tasks_select_public_active on public.tasks;
create policy tasks_select_public_active
on public.tasks
for select
to anon, authenticated
using (active = true or public.is_admin());

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
before update on public.tasks
for each row execute function public.touch_updated_at();

create table if not exists public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null references public.tasks(id) on delete cascade,
  status text not null default '審核中',
  review_note text not null default '',
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id) on delete set null,
  unique (user_id, task_id)
);

alter table public.user_tasks enable row level security;

drop policy if exists user_tasks_select_scope on public.user_tasks;
create policy user_tasks_select_scope
on public.user_tasks
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists user_tasks_insert_own on public.user_tasks;
create policy user_tasks_insert_own
on public.user_tasks
for insert
to authenticated
with check (auth.uid() = user_id);

create table if not exists public.products (
  id text primary key,
  category text not null default '會員道具',
  name text not null,
  art_code text not null default 'PP',
  description text not null default '',
  cost_points integer not null default 0,
  valid_days integer,
  use_limit text not null default '依商品規則使用',
  refundable boolean not null default false,
  tags text[] not null default '{}'::text[],
  member_only boolean not null default false,
  limited boolean not null default false,
  ending_soon boolean not null default false,
  newest boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.products enable row level security;

drop policy if exists products_select_public_active on public.products;
create policy products_select_public_active
on public.products
for select
to anon, authenticated
using (active = true or public.is_admin());

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  source text not null default '商城兌換',
  status text not null default 'available',
  expires_at timestamptz,
  used_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.inventory_items enable row level security;

drop policy if exists inventory_items_select_scope on public.inventory_items;
create policy inventory_items_select_scope
on public.inventory_items
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop trigger if exists inventory_items_touch_updated_at on public.inventory_items;
create trigger inventory_items_touch_updated_at
before update on public.inventory_items
for each row execute function public.touch_updated_at();

create table if not exists public.predictions (
  id text primary key,
  group_name text not null default '今日挑戰',
  title text not null,
  required_item text not null default '預測挑戰券',
  status_label text not null default '進行中',
  result_text text not null default '尚未結束',
  participant_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.predictions enable row level security;

drop policy if exists predictions_select_public_active on public.predictions;
create policy predictions_select_public_active
on public.predictions
for select
to anon, authenticated
using (active = true or public.is_admin());

drop trigger if exists predictions_touch_updated_at on public.predictions;
create trigger predictions_touch_updated_at
before update on public.predictions
for each row execute function public.touch_updated_at();

create table if not exists public.prediction_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prediction_id text references public.predictions(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  record_text text not null default '已參與',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.prediction_entries enable row level security;

drop policy if exists prediction_entries_select_scope on public.prediction_entries;
create policy prediction_entries_select_scope
on public.prediction_entries
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid references auth.users(id) on delete set null,
  invite_code text not null,
  status text not null default '審核中',
  reward_points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

alter table public.referrals enable row level security;

drop policy if exists referrals_select_scope on public.referrals;
create policy referrals_select_scope
on public.referrals
for select
to authenticated
using (auth.uid() = inviter_id or auth.uid() = invitee_id or public.is_admin());

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'manual',
  provider_ref text,
  points integer not null default 0,
  amount_label text not null default '',
  status text not null default 'pending',
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.payments enable row level security;

drop policy if exists payments_select_scope on public.payments;
create policy payments_select_scope
on public.payments
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

create table if not exists public.risk_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  severity text not null default 'medium',
  category text not null,
  message text not null,
  status text not null default 'open',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.risk_alerts enable row level security;

drop policy if exists risk_alerts_select_admin on public.risk_alerts;
create policy risk_alerts_select_admin
on public.risk_alerts
for select
to authenticated
using (public.is_admin());

drop trigger if exists risk_alerts_touch_updated_at on public.risk_alerts;
create trigger risk_alerts_touch_updated_at
before update on public.risk_alerts
for each row execute function public.touch_updated_at();

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text not null default '',
  target_id text not null default '',
  before_data jsonb,
  after_data jsonb,
  reason text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_audit_logs enable row level security;

drop policy if exists admin_audit_logs_select_admin on public.admin_audit_logs;
create policy admin_audit_logs_select_admin
on public.admin_audit_logs
for select
to authenticated
using (public.is_admin());

create table if not exists public.site_settings (
  id text primary key default 'main',
  restricted_terms text[] not null default '{}'::text[],
  legal_notice text not null default '本平台為娛樂型網站，積分與虛擬商品依站內規則使用。',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_settings enable row level security;

drop policy if exists site_settings_select_public on public.site_settings;
create policy site_settings_select_public
on public.site_settings
for select
to anon, authenticated
using (true);

insert into public.site_settings (id, restricted_terms)
values ('main', '{}'::text[])
on conflict (id) do update
set restricted_terms = '{}'::text[],
    updated_at = timezone('utc', now());

create table if not exists public.monitor_devices (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  label text,
  pair_token_hash text not null,
  write_token_hash text not null,
  status text not null default 'waiting',
  claimed_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.monitor_devices enable row level security;

drop policy if exists monitor_devices_select_scope on public.monitor_devices;
create policy monitor_devices_select_scope
on public.monitor_devices
for select
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop trigger if exists monitor_devices_touch_updated_at on public.monitor_devices;
create trigger monitor_devices_touch_updated_at
before update on public.monitor_devices
for each row execute function public.touch_updated_at();

create table if not exists public.monitor_device_snapshots (
  device_id text primary key references public.monitor_devices(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.monitor_device_snapshots enable row level security;
alter table public.monitor_device_snapshots replica identity full;

drop policy if exists monitor_device_snapshots_select_scope on public.monitor_device_snapshots;
create policy monitor_device_snapshots_select_scope
on public.monitor_device_snapshots
for select
to authenticated
using (
  exists (
    select 1
    from public.monitor_devices d
    where d.id = monitor_device_snapshots.device_id
      and (d.owner_id = auth.uid() or public.is_admin())
  )
);

drop trigger if exists monitor_device_snapshots_touch_updated_at on public.monitor_device_snapshots;
create trigger monitor_device_snapshots_touch_updated_at
before update on public.monitor_device_snapshots
for each row execute function public.touch_updated_at();

create or replace function public.token_hash(p_token text)
returns text
language sql
stable
as $$
  select encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create or replace function public.audit_admin_action(
  p_action text,
  p_table text,
  p_target_id text,
  p_before jsonb default null,
  p_after jsonb default null,
  p_reason text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_audit_logs (actor_id, action, target_table, target_id, before_data, after_data, reason)
  values (auth.uid(), p_action, coalesce(p_table, ''), coalesce(p_target_id, ''), p_before, p_after, coalesce(p_reason, ''));
end;
$$;

create or replace function public.claim_daily_checkin()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (timezone('Asia/Taipei', now()))::date;
  v_balance integer;
  v_last date;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  insert into public.profiles (id, email, display_name)
  values (
    v_user,
    coalesce((select email from auth.users where id = v_user), ''),
    split_part(coalesce((select email from auth.users where id = v_user), 'member'), '@', 1)
  )
  on conflict (id) do nothing;

  select last_checkin_at into v_last
  from public.profiles
  where id = v_user
  for update;

  if v_last = v_today then
    select points into v_balance from public.profiles where id = v_user;
    return jsonb_build_object('ok', true, 'message', '今日已完成簽到。', 'points', v_balance);
  end if;

  update public.profiles
  set points = points + 20,
      last_checkin_at = v_today
  where id = v_user
  returning points into v_balance;

  insert into public.point_ledger (user_id, source, amount, balance, status, note, meta)
  values (v_user, '每日簽到', 20, v_balance, '已入帳', '每日任務', jsonb_build_object('kind', 'checkin'));

  return jsonb_build_object('ok', true, 'message', '簽到完成，積分已入帳。', 'points', v_balance);
end;
$$;

create or replace function public.start_task(p_task_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_task public.tasks%rowtype;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id and active = true;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到可參加的任務。');
  end if;

  insert into public.user_tasks (user_id, task_id, status, review_note)
  values (v_user, p_task_id, '審核中', '等待系統或人工審核')
  on conflict (user_id, task_id) do update
  set submitted_at = timezone('utc', now()),
      status = case when public.user_tasks.status = '已失敗' then '審核中' else public.user_tasks.status end;

  insert into public.point_ledger (user_id, source, amount, balance, status, note, meta)
  select v_user, v_task.title, v_task.reward_points, points, '待審核', '任務完成條件驗證中', jsonb_build_object('task_id', p_task_id)
  from public.profiles
  where id = v_user;

  return jsonb_build_object('ok', true, 'message', '任務已送出，狀態改為審核中。');
end;
$$;

create or replace function public.redeem_product(p_product_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_product public.products%rowtype;
  v_points integer;
  v_balance integer;
  v_expires timestamptz;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  select * into v_product
  from public.products
  where id = p_product_id and active = true;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到可兌換的商品。');
  end if;

  select points into v_points
  from public.profiles
  where id = v_user
  for update;

  if coalesce(v_points, 0) < v_product.cost_points then
    return jsonb_build_object('ok', false, 'message', '目前積分不足。', 'points', coalesce(v_points, 0));
  end if;

  v_expires := case
    when v_product.valid_days is null then null
    else timezone('utc', now()) + make_interval(days => v_product.valid_days)
  end;

  update public.profiles
  set points = points - v_product.cost_points
  where id = v_user
  returning points into v_balance;

  insert into public.inventory_items (user_id, product_id, product_name, source, status, expires_at)
  values (v_user, v_product.id, v_product.name, '商城兌換', 'available', v_expires);

  insert into public.point_ledger (user_id, source, amount, balance, status, note, meta)
  values (v_user, '兌換 ' || v_product.name, -v_product.cost_points, v_balance, '已完成', '虛擬商城', jsonb_build_object('product_id', p_product_id));

  return jsonb_build_object('ok', true, 'message', '兌換成功，已加入我的背包。', 'points', v_balance);
end;
$$;

create or replace function public.use_inventory_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  update public.inventory_items
  set status = 'used',
      used_at = timezone('utc', now())
  where id = p_item_id
    and user_id = v_user
    and status = 'available'
    and (expires_at is null or expires_at > timezone('utc', now()));

  if not found then
    return jsonb_build_object('ok', false, 'message', '商品不可使用或已過期。');
  end if;

  return jsonb_build_object('ok', true, 'message', '商品已使用。');
end;
$$;

create or replace function public.admin_list_profiles()
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select *
  from public.profiles
  where public.is_admin()
  order by created_at desc
  limit 500
$$;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_new_role text := public.normalize_profile_role(p_role);
begin
  if v_actor_role <> 'super_admin' then
    return jsonb_build_object('ok', false, 'message', '只有超級管理員可以指派管理權限。');
  end if;

  if v_new_role not in ('member', 'vip', 'admin_assistant', 'admin', 'super_admin') then
    return jsonb_build_object('ok', false, 'message', '角色不合法。');
  end if;

  update public.profiles
  set role = v_new_role
  where id = p_user_id;

  perform public.audit_admin_action('admin_set_user_role', 'profiles', p_user_id::text, null, jsonb_build_object('role', v_new_role), 'role assignment');
  return jsonb_build_object('ok', true, 'message', '角色已更新。');
end;
$$;

create or replace function public.admin_update_profile(p_user_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
begin
  if v_actor_role not in ('super_admin', 'admin', 'admin_assistant') then
    return jsonb_build_object('ok', false, 'message', '沒有會員管理權限。');
  end if;

  update public.profiles
  set
    display_name = coalesce(nullif(p_payload->>'display_name', ''), display_name),
    status = coalesce(nullif(p_payload->>'status', ''), status),
    badge = coalesce(nullif(p_payload->>'badge', ''), badge),
    level_name = coalesce(nullif(p_payload->>'level_name', ''), level_name)
  where id = p_user_id;

  perform public.audit_admin_action('admin_update_profile', 'profiles', p_user_id::text, null, p_payload, 'profile update');
  return jsonb_build_object('ok', true, 'message', '會員資料已更新。');
end;
$$;

create or replace function public.admin_adjust_points(p_user_id uuid, p_amount integer, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_balance integer;
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有積分調整權限。');
  end if;

  update public.profiles
  set points = greatest(0, points + coalesce(p_amount, 0))
  where id = p_user_id
  returning points into v_balance;

  insert into public.point_ledger (user_id, source, amount, balance, status, note)
  values (p_user_id, '管理員調整', coalesce(p_amount, 0), v_balance, '已完成', coalesce(p_reason, ''));

  perform public.audit_admin_action('admin_adjust_points', 'profiles', p_user_id::text, null, jsonb_build_object('amount', p_amount, 'balance', v_balance), coalesce(p_reason, ''));
  return jsonb_build_object('ok', true, 'message', '積分已調整。', 'points', v_balance);
end;
$$;

create or replace function public.admin_review_user_task(p_user_task_id uuid, p_approved boolean, p_note text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_task_row public.user_tasks%rowtype;
  v_task public.tasks%rowtype;
  v_balance integer;
begin
  if v_actor_role not in ('super_admin', 'admin', 'admin_assistant') then
    return jsonb_build_object('ok', false, 'message', '沒有任務審核權限。');
  end if;

  select * into v_task_row
  from public.user_tasks
  where id = p_user_task_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到任務紀錄。');
  end if;

  select * into v_task
  from public.tasks
  where id = v_task_row.task_id;

  update public.user_tasks
  set status = case when p_approved then '已完成' else '已失敗' end,
      review_note = coalesce(p_note, ''),
      reviewed_at = timezone('utc', now()),
      reviewer_id = auth.uid()
  where id = p_user_task_id;

  if p_approved and v_task_row.status <> '已完成' then
    update public.profiles
    set points = points + v_task.reward_points
    where id = v_task_row.user_id
    returning points into v_balance;

    insert into public.point_ledger (user_id, source, amount, balance, status, note, meta)
    values (v_task_row.user_id, v_task.title, v_task.reward_points, v_balance, '已入帳', coalesce(p_note, ''), jsonb_build_object('task_id', v_task.id));
  end if;

  perform public.audit_admin_action('admin_review_user_task', 'user_tasks', p_user_task_id::text, null, jsonb_build_object('approved', p_approved), coalesce(p_note, ''));
  return jsonb_build_object('ok', true, 'message', '任務審核已更新。');
end;
$$;

create or replace function public.admin_upsert_task(
  p_task_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_id text := coalesce(nullif(p_task_id, ''), 'task_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有任務管理權限。');
  end if;

  insert into public.tasks (id, task_type, title, description, reward_points, review_time, external_url, sort_order, active)
  values (
    v_id,
    coalesce(nullif(p_payload->>'task_type', ''), '會員任務'),
    coalesce(nullif(p_payload->>'title', ''), '未命名任務'),
    coalesce(p_payload->>'description', ''),
    greatest(0, coalesce(nullif(p_payload->>'reward_points', '')::integer, 0)),
    coalesce(nullif(p_payload->>'review_time', ''), '人工審核'),
    coalesce(p_payload->>'external_url', ''),
    coalesce(nullif(p_payload->>'sort_order', '')::integer, 100),
    coalesce(nullif(p_payload->>'active', '')::boolean, true)
  )
  on conflict (id) do update
  set task_type = excluded.task_type,
      title = excluded.title,
      description = excluded.description,
      reward_points = excluded.reward_points,
      review_time = excluded.review_time,
      external_url = excluded.external_url,
      sort_order = excluded.sort_order,
      active = excluded.active;

  perform public.audit_admin_action('admin_upsert_task', 'tasks', v_id, null, p_payload, 'task upsert');
  return jsonb_build_object('ok', true, 'message', '任務已儲存。', 'id', v_id);
end;
$$;

create or replace function public.admin_set_task_active(p_task_id text, p_active boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有任務上下架權限。');
  end if;
  update public.tasks set active = coalesce(p_active, true) where id = p_task_id;
  perform public.audit_admin_action('admin_set_task_active', 'tasks', p_task_id, null, jsonb_build_object('active', p_active), 'task active');
  return jsonb_build_object('ok', true, 'message', '任務狀態已更新。');
end;
$$;

create or replace function public.admin_upsert_product(
  p_product_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_id text := coalesce(nullif(p_product_id, ''), 'product_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有商品管理權限。');
  end if;

  insert into public.products (id, category, name, art_code, description, cost_points, valid_days, use_limit, refundable, tags, member_only, limited, ending_soon, newest, active, sort_order)
  values (
    v_id,
    coalesce(nullif(p_payload->>'category', ''), '會員道具'),
    coalesce(nullif(p_payload->>'name', ''), '未命名商品'),
    coalesce(nullif(p_payload->>'art_code', ''), 'PP'),
    coalesce(p_payload->>'description', ''),
    greatest(0, coalesce(nullif(p_payload->>'cost_points', '')::integer, 0)),
    nullif(p_payload->>'valid_days', '')::integer,
    coalesce(nullif(p_payload->>'use_limit', ''), '依商品規則使用'),
    coalesce(nullif(p_payload->>'refundable', '')::boolean, false),
    coalesce((select array_agg(value) from jsonb_array_elements_text(coalesce(p_payload->'tags', '[]'::jsonb))), '{}'::text[]),
    coalesce(nullif(p_payload->>'member_only', '')::boolean, false),
    coalesce(nullif(p_payload->>'limited', '')::boolean, false),
    coalesce(nullif(p_payload->>'ending_soon', '')::boolean, false),
    coalesce(nullif(p_payload->>'newest', '')::boolean, false),
    coalesce(nullif(p_payload->>'active', '')::boolean, true),
    coalesce(nullif(p_payload->>'sort_order', '')::integer, 100)
  )
  on conflict (id) do update
  set category = excluded.category,
      name = excluded.name,
      art_code = excluded.art_code,
      description = excluded.description,
      cost_points = excluded.cost_points,
      valid_days = excluded.valid_days,
      use_limit = excluded.use_limit,
      refundable = excluded.refundable,
      tags = excluded.tags,
      member_only = excluded.member_only,
      limited = excluded.limited,
      ending_soon = excluded.ending_soon,
      newest = excluded.newest,
      active = excluded.active,
      sort_order = excluded.sort_order;

  perform public.audit_admin_action('admin_upsert_product', 'products', v_id, null, p_payload, 'product upsert');
  return jsonb_build_object('ok', true, 'message', '商品已儲存。', 'id', v_id);
end;
$$;

create or replace function public.admin_set_product_active(p_product_id text, p_active boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有商品上下架權限。');
  end if;
  update public.products set active = coalesce(p_active, true) where id = p_product_id;
  perform public.audit_admin_action('admin_set_product_active', 'products', p_product_id, null, jsonb_build_object('active', p_active), 'product active');
  return jsonb_build_object('ok', true, 'message', '商品狀態已更新。');
end;
$$;

create or replace function public.register_monitor_device(
  p_device_id text,
  p_pair_token text,
  p_write_token text,
  p_label text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(coalesce(p_device_id, '')) < 12
    or length(coalesce(p_pair_token, '')) < 24
    or length(coalesce(p_write_token, '')) < 24 then
    return jsonb_build_object('ok', false, 'message', '裝置參數不足。');
  end if;

  insert into public.monitor_devices (id, label, pair_token_hash, write_token_hash, status, last_seen_at)
  values (p_device_id, nullif(p_label, ''), public.token_hash(p_pair_token), public.token_hash(p_write_token), 'waiting', timezone('utc', now()))
  on conflict (id) do update
  set label = coalesce(nullif(excluded.label, ''), public.monitor_devices.label),
      last_seen_at = timezone('utc', now()),
      status = case when public.monitor_devices.owner_id is null then 'waiting' else 'active' end;

  return jsonb_build_object('ok', true, 'message', '監測裝置已註冊。');
end;
$$;

create or replace function public.claim_monitor_device(p_device_id text, p_pair_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_device public.monitor_devices%rowtype;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  select * into v_device
  from public.monitor_devices
  where id = p_device_id
  for update;

  if not found or v_device.pair_token_hash <> public.token_hash(p_pair_token) then
    return jsonb_build_object('ok', false, 'message', '裝置配對資料不正確。');
  end if;

  if v_device.owner_id is not null and v_device.owner_id <> v_user then
    return jsonb_build_object('ok', false, 'message', '裝置已綁定其他帳號。');
  end if;

  update public.monitor_devices
  set owner_id = v_user,
      status = 'active',
      claimed_at = coalesce(claimed_at, timezone('utc', now())),
      last_seen_at = timezone('utc', now())
  where id = p_device_id;

  return jsonb_build_object('ok', true, 'message', '裝置已綁定。');
end;
$$;

create or replace function public.publish_monitor_snapshot(
  p_device_id text,
  p_write_token text,
  p_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device public.monitor_devices%rowtype;
begin
  select * into v_device
  from public.monitor_devices
  where id = p_device_id
  for update;

  if not found or v_device.write_token_hash <> public.token_hash(p_write_token) then
    return jsonb_build_object('ok', false, 'message', '裝置寫入權杖不正確。');
  end if;

  update public.monitor_devices
  set status = case when owner_id is null then 'waiting' else 'active' end,
      last_seen_at = timezone('utc', now())
  where id = p_device_id;

  insert into public.monitor_device_snapshots (device_id, snapshot, updated_at)
  values (p_device_id, coalesce(p_snapshot, '{}'::jsonb), timezone('utc', now()))
  on conflict (device_id) do update
  set snapshot = excluded.snapshot,
      updated_at = excluded.updated_at;

  return jsonb_build_object('ok', true, 'message', '監測資料已同步。');
end;
$$;

insert into public.tasks (id, task_type, title, description, reward_points, review_time, sort_order, active)
values
  ('daily-checkin', '每日簽到', '完成每日簽到', '每日登入會員中心完成簽到。', 20, '即時入帳', 10, true),
  ('partner-register', '合作網站註冊任務', '完成合作網站註冊', '依合作頁面要求完成註冊並等待驗證。', 180, '1 至 3 個工作天', 20, true),
  ('referral-verify', '好友邀請任務', '邀請好友完成驗證', '好友完成指定驗證或任務後才進入獎勵審核。', 120, '約 24 小時', 30, true),
  ('event-streak', '限時活動任務', '完成三日任務連續紀錄', '活動期間連續三日完成任務中心指定項目。', 240, '活動結束後統一審核', 40, true)
on conflict (id) do update
set task_type = excluded.task_type,
    title = excluded.title,
    description = excluded.description,
    reward_points = excluded.reward_points,
    review_time = excluded.review_time,
    sort_order = excluded.sort_order,
    active = excluded.active;

insert into public.products (id, category, name, art_code, description, cost_points, valid_days, use_limit, refundable, tags, member_only, limited, ending_soon, newest, sort_order, active)
values
  ('challenge-ticket', '挑戰券', '預測挑戰券', 'TK', '參與站內娛樂型預測挑戰使用。', 120, 30, '每場挑戰通常使用 1 張。', true, array['熱門'], false, false, false, false, 10, true),
  ('hint-card', '提示卡', '資料提示卡', 'HT', '查看站內挑戰的資料提示與摘要。', 180, 14, '每個挑戰最多使用 2 張。', false, array['熱門', '最新'], false, false, false, true, 20, true),
  ('badge-neon', '徽章', '霓光徽章', 'NB', '展示於會員中心與排行榜。', 260, null, '每個帳號限兌換一次。', false, array['會員限定'], true, false, false, false, 30, true),
  ('avatar-frame', '頭像框', '星軌頭像框', 'AF', '裝飾會員頭像與個人頁展示。', 220, 60, '兌換後可套用於個人資料。', false, array['熱門'], false, false, false, false, 40, true),
  ('season-pass', '通行證', '賽季通行證', 'SP', '參與賽季活動與限定任務。', 520, 45, '賽季期間有效。', false, array['限時'], false, true, true, false, 50, true)
on conflict (id) do update
set category = excluded.category,
    name = excluded.name,
    art_code = excluded.art_code,
    description = excluded.description,
    cost_points = excluded.cost_points,
    valid_days = excluded.valid_days,
    use_limit = excluded.use_limit,
    refundable = excluded.refundable,
    tags = excluded.tags,
    member_only = excluded.member_only,
    limited = excluded.limited,
    ending_soon = excluded.ending_soon,
    newest = excluded.newest,
    sort_order = excluded.sort_order,
    active = excluded.active;

insert into public.predictions (id, group_name, title, required_item, status_label, result_text, participant_count, starts_at, ends_at, active)
values
  ('daily-pattern', '今日挑戰', '今日趨勢觀察挑戰', '預測挑戰券', '進行中', '尚未結束', 1284, timezone('utc', now()), timezone('utc', now()) + interval '8 hours', true),
  ('night-run', '即將開始', '夜間資料判讀挑戰', '預測挑戰券', '即將開始', '尚未開始', 642, timezone('utc', now()) + interval '1 day', timezone('utc', now()) + interval '1 day 3 hours', true),
  ('archive-review', '已結束', '歷史樣本回顧挑戰', '資料提示卡', '已結束', '結果已公布', 2110, timezone('utc', now()) - interval '1 day', timezone('utc', now()) - interval '20 hours', true),
  ('hot-week', '熱門挑戰', '週榜熱度挑戰', '賽季通行證', '熱門', '尚未結束', 5200, timezone('utc', now()) + interval '2 days', timezone('utc', now()) + interval '4 days', true)
on conflict (id) do update
set group_name = excluded.group_name,
    title = excluded.title,
    required_item = excluded.required_item,
    status_label = excluded.status_label,
    result_text = excluded.result_text,
    participant_count = excluded.participant_count,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    active = excluded.active;

grant usage on schema public to anon, authenticated;
grant select on public.tasks, public.products, public.predictions, public.site_settings to anon, authenticated;
revoke update on public.profiles from authenticated;
grant select, insert on public.profiles to authenticated;
grant update (email, display_name, phone, settings) on public.profiles to authenticated;
grant select on public.point_ledger, public.user_tasks, public.inventory_items, public.prediction_entries, public.referrals, public.payments, public.risk_alerts, public.admin_audit_logs, public.monitor_devices, public.monitor_device_snapshots to authenticated;
revoke insert on public.user_tasks from authenticated;
grant execute on function public.normalize_profile_role(text) to anon, authenticated;
grant execute on function public.profile_role_level(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_role_level() to authenticated;
grant execute on function public.claim_daily_checkin() to authenticated;
grant execute on function public.start_task(text) to authenticated;
grant execute on function public.redeem_product(text) to authenticated;
grant execute on function public.use_inventory_item(uuid) to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_update_profile(uuid, jsonb) to authenticated;
grant execute on function public.admin_adjust_points(uuid, integer, text) to authenticated;
grant execute on function public.admin_review_user_task(uuid, boolean, text) to authenticated;
grant execute on function public.admin_upsert_task(text, jsonb) to authenticated;
grant execute on function public.admin_set_task_active(text, boolean) to authenticated;
grant execute on function public.admin_upsert_product(text, jsonb) to authenticated;
grant execute on function public.admin_set_product_active(text, boolean) to authenticated;
grant execute on function public.register_monitor_device(text, text, text, text) to anon, authenticated;
grant execute on function public.claim_monitor_device(text, text) to authenticated;
grant execute on function public.publish_monitor_snapshot(text, text, jsonb) to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'monitor_device_snapshots'
    ) then
      alter publication supabase_realtime add table public.monitor_device_snapshots;
    end if;
  end if;
end $$;

notify pgrst, 'reload schema';
