create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  points integer not null default 100,
  badge text not null default '一般會員',
  role text not null default 'member',
  bound_game_url text,
  last_checkin_at date,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists points integer not null default 100;
alter table public.profiles add column if not exists badge text not null default '一般會員';
alter table public.profiles add column if not exists role text not null default 'member';
alter table public.profiles add column if not exists bound_game_url text;
alter table public.profiles add column if not exists last_checkin_at date;
alter table public.profiles add column if not exists settings jsonb not null default '{}'::jsonb;

update public.profiles
set
  points = coalesce(points, 100),
  badge = coalesce(nullif(badge, ''), '一般會員'),
  role = coalesce(nullif(role, ''), 'member'),
  settings = coalesce(settings, '{}'::jsonb);

update public.profiles
set role = case
  when role = 'owner' then 'super_admin'
  when role = 'moderator' then 'admin_assistant'
  else role
end
where role in ('owner', 'moderator');

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

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
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create table if not exists public.broadcasters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.broadcasters enable row level security;

drop policy if exists broadcasters_select_own on public.broadcasters;
create policy broadcasters_select_own
on public.broadcasters
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.live_snapshots (
  id text primary key default 'main',
  broadcaster_id uuid references auth.users(id) on delete set null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.live_snapshots enable row level security;
alter table public.live_snapshots replica identity full;

drop policy if exists live_snapshots_select_authenticated on public.live_snapshots;
create policy live_snapshots_select_authenticated
on public.live_snapshots
for select
to authenticated
using (true);

drop policy if exists live_snapshots_insert_broadcaster on public.live_snapshots;
create policy live_snapshots_insert_broadcaster
on public.live_snapshots
for insert
to authenticated
with check (
  exists (
    select 1
    from public.broadcasters
    where broadcasters.user_id = auth.uid()
  )
);

drop policy if exists live_snapshots_update_broadcaster on public.live_snapshots;
create policy live_snapshots_update_broadcaster
on public.live_snapshots
for update
to authenticated
using (
  exists (
    select 1
    from public.broadcasters
    where broadcasters.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.broadcasters
    where broadcasters.user_id = auth.uid()
  )
);

drop trigger if exists live_snapshots_touch_updated_at on public.live_snapshots;
create trigger live_snapshots_touch_updated_at
before update on public.live_snapshots
for each row
execute function public.touch_updated_at();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'live_snapshots'
  ) then
    alter publication supabase_realtime add table public.live_snapshots;
  end if;
end $$;

revoke update (points, badge, role, last_checkin_at) on public.profiles from authenticated;
grant update (email, display_name, bound_game_url, settings) on public.profiles to authenticated;

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

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.normalize_profile_role(
    coalesce(
      (
        select role
        from public.profiles
        where id = auth.uid()
        limit 1
      ),
      'member'
    )
  )
$$;

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  display_name text,
  points integer,
  badge text,
  role text,
  bound_game_url text,
  last_checkin_at date,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
begin
  if v_actor_role not in ('super_admin', 'admin', 'admin_assistant') then
    return;
  end if;

  return query
  select
    p.id,
    p.email,
    p.display_name,
    p.points,
    p.badge,
    p.role,
    p.bound_game_url,
    p.last_checkin_at,
    p.created_at,
    p.updated_at
  from public.profiles p
  order by p.created_at desc
  limit 500;
end;
$$;

create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_role text default null,
  p_badge text default null,
  p_points integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role text := public.current_profile_role();
  v_actor_level integer := public.profile_role_level(public.current_profile_role());
  v_target public.profiles%rowtype;
  v_target_role text;
  v_target_level integer;
  v_requested_role text := nullif(lower(trim(coalesce(p_role, ''))), '');
  v_new_role text := case
    when nullif(lower(trim(coalesce(p_role, ''))), '') is null then null
    else public.normalize_profile_role(p_role)
  end;
  v_new_role_level integer;
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  if v_actor_role not in ('super_admin', 'admin', 'admin_assistant') then
    return jsonb_build_object('ok', false, 'message', '沒有管理權限。');
  end if;

  select *
  into v_target
  from public.profiles
  where profiles.id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到會員。');
  end if;

  v_target_role := public.normalize_profile_role(v_target.role);
  v_target_level := public.profile_role_level(v_target_role);

  if v_new_role is not null then
    if v_requested_role not in (
      'member',
      'vip',
      'assistant',
      'moderator',
      'admin_assistant',
      'manager',
      'admin',
      'super',
      'superadmin',
      'super_admin',
      'owner'
    ) then
      return jsonb_build_object('ok', false, 'message', '角色名稱不允許。');
    end if;

    v_new_role_level := public.profile_role_level(v_new_role);
    if v_new_role not in ('member', 'vip', 'admin_assistant', 'admin', 'super_admin') then
      return jsonb_build_object('ok', false, 'message', '角色名稱不允許。');
    end if;
  end if;

  if v_actor_role <> 'super_admin' and v_target_level >= v_actor_level then
    return jsonb_build_object('ok', false, 'message', '只能調整低於自己權限的帳號。');
  end if;

  if v_actor_role <> 'super_admin' and coalesce(v_new_role_level, 0) >= v_actor_level then
    return jsonb_build_object('ok', false, 'message', '不能授予等於或高於自己的權限。');
  end if;

  if v_actor_role = 'admin_assistant' and v_new_role is not null and v_new_role <> v_target_role then
    return jsonb_build_object('ok', false, 'message', '管理員助理不能調整角色。');
  end if;

  if v_actor_role = 'admin_assistant' and v_target_role not in ('member', 'vip') then
    return jsonb_build_object('ok', false, 'message', '管理員助理只能處理一般會員與 VIP。');
  end if;

  update public.profiles
  set
    role = coalesce(v_new_role, role),
    badge = coalesce(nullif(trim(coalesce(p_badge, '')), ''), badge),
    points = case when p_points is null then points else greatest(0, p_points) end
  where profiles.id = p_user_id
  returning * into v_target;

  return jsonb_build_object(
    'ok', true,
    'message', '會員權限已更新。',
    'id', v_target.id,
    'role', v_target.role,
    'points', v_target.points,
    'badge', v_target.badge
  );
end;
$$;

create or replace function public.admin_set_broadcaster(
  p_user_id uuid,
  p_enabled boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role text := public.current_profile_role();
  v_target_role text;
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有管理權限。');
  end if;

  select public.normalize_profile_role(role)
  into v_target_role
  from public.profiles
  where id = p_user_id;

  if v_actor_role <> 'super_admin' and v_target_role in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '一般管理員不能調整管理帳號的同步權限。');
  end if;

  if p_enabled then
    insert into public.broadcasters (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;
  else
    delete from public.broadcasters
    where user_id = p_user_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'message', case when p_enabled then '已開啟同步推送權限。' else '已關閉同步推送權限。' end
  );
end;
$$;

create or replace function public.admin_list_tasks()
returns table (
  id text,
  title text,
  description text,
  reward_points integer,
  url text,
  sort_order integer,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
begin
  if v_actor_role not in ('super_admin', 'admin', 'admin_assistant') then
    return;
  end if;

  return query
  select
    t.id,
    t.title,
    t.description,
    t.reward_points,
    t.url,
    t.sort_order,
    t.active,
    t.created_at,
    t.updated_at
  from public.portal_tasks t
  order by t.active desc, t.sort_order asc, t.created_at desc;
end;
$$;

create or replace function public.admin_upsert_task(
  p_task_id text default null,
  p_title text default '',
  p_description text default '',
  p_reward_points integer default 0,
  p_url text default '',
  p_sort_order integer default 100,
  p_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_id text := nullif(trim(coalesce(p_task_id, '')), '');
  v_title text := trim(coalesce(p_title, ''));
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有任務管理權限。');
  end if;

  if v_title = '' then
    return jsonb_build_object('ok', false, 'message', '任務名稱不能空白。');
  end if;

  if v_id is null then
    v_id := 'task_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  end if;

  insert into public.portal_tasks (id, title, description, reward_points, url, sort_order, active)
  values (
    v_id,
    v_title,
    trim(coalesce(p_description, '')),
    greatest(0, coalesce(p_reward_points, 0)),
    trim(coalesce(p_url, '')),
    coalesce(p_sort_order, 100),
    coalesce(p_active, true)
  )
  on conflict (id) do update
  set
    title = excluded.title,
    description = excluded.description,
    reward_points = excluded.reward_points,
    url = excluded.url,
    sort_order = excluded.sort_order,
    active = excluded.active;

  return jsonb_build_object('ok', true, 'message', '任務已儲存。', 'id', v_id);
end;
$$;

create or replace function public.admin_set_task_active(
  p_task_id text,
  p_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有任務管理權限。');
  end if;

  update public.portal_tasks
  set active = coalesce(p_active, true)
  where id = p_task_id;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到任務。');
  end if;

  return jsonb_build_object('ok', true, 'message', case when coalesce(p_active, true) then '任務已啟用。' else '任務已停用。' end);
end;
$$;

create or replace function public.admin_list_rewards()
returns table (
  id text,
  title text,
  description text,
  cost_points integer,
  sort_order integer,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
begin
  if v_actor_role not in ('super_admin', 'admin', 'admin_assistant') then
    return;
  end if;

  return query
  select
    r.id,
    r.title,
    r.description,
    r.cost_points,
    r.sort_order,
    r.active,
    r.created_at,
    r.updated_at
  from public.rewards r
  order by r.active desc, r.sort_order asc, r.created_at desc;
end;
$$;

create or replace function public.admin_upsert_reward(
  p_reward_id text default null,
  p_title text default '',
  p_description text default '',
  p_cost_points integer default 0,
  p_sort_order integer default 100,
  p_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
  v_id text := nullif(trim(coalesce(p_reward_id, '')), '');
  v_title text := trim(coalesce(p_title, ''));
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有商品管理權限。');
  end if;

  if v_title = '' then
    return jsonb_build_object('ok', false, 'message', '商品名稱不能空白。');
  end if;

  if v_id is null then
    v_id := 'reward_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  end if;

  insert into public.rewards (id, title, description, cost_points, sort_order, active)
  values (
    v_id,
    v_title,
    trim(coalesce(p_description, '')),
    greatest(0, coalesce(p_cost_points, 0)),
    coalesce(p_sort_order, 100),
    coalesce(p_active, true)
  )
  on conflict (id) do update
  set
    title = excluded.title,
    description = excluded.description,
    cost_points = excluded.cost_points,
    sort_order = excluded.sort_order,
    active = excluded.active;

  return jsonb_build_object('ok', true, 'message', '商品已儲存。', 'id', v_id);
end;
$$;

create or replace function public.admin_set_reward_active(
  p_reward_id text,
  p_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text := public.current_profile_role();
begin
  if v_actor_role not in ('super_admin', 'admin') then
    return jsonb_build_object('ok', false, 'message', '沒有商品管理權限。');
  end if;

  update public.rewards
  set active = coalesce(p_active, true)
  where id = p_reward_id;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到商品。');
  end if;

  return jsonb_build_object('ok', true, 'message', case when coalesce(p_active, true) then '商品已啟用。' else '商品已停用。' end);
end;
$$;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.normalize_profile_role(text) to authenticated;
grant execute on function public.profile_role_level(text) to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_update_profile(uuid, text, text, integer) to authenticated;
grant execute on function public.admin_set_broadcaster(uuid, boolean) to authenticated;
grant execute on function public.admin_list_tasks() to authenticated;
grant execute on function public.admin_upsert_task(text, text, text, integer, text, integer, boolean) to authenticated;
grant execute on function public.admin_set_task_active(text, boolean) to authenticated;
grant execute on function public.admin_list_rewards() to authenticated;
grant execute on function public.admin_upsert_reward(text, text, text, integer, integer, boolean) to authenticated;
grant execute on function public.admin_set_reward_active(text, boolean) to authenticated;

create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  amount integer not null,
  balance integer not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.point_ledger enable row level security;

drop policy if exists point_ledger_select_own on public.point_ledger;
create policy point_ledger_select_own
on public.point_ledger
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.portal_tasks (
  id text primary key,
  title text not null,
  description text not null default '',
  reward_points integer not null default 0,
  url text not null default '',
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.portal_tasks enable row level security;

drop policy if exists portal_tasks_select_active on public.portal_tasks;
create policy portal_tasks_select_active
on public.portal_tasks
for select
to authenticated
using (active = true);

drop trigger if exists portal_tasks_touch_updated_at on public.portal_tasks;
create trigger portal_tasks_touch_updated_at
before update on public.portal_tasks
for each row
execute function public.touch_updated_at();

create table if not exists public.task_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null references public.portal_tasks(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, task_id)
);

alter table public.task_completions enable row level security;

drop policy if exists task_completions_select_own on public.task_completions;
create policy task_completions_select_own
on public.task_completions
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.rewards (
  id text primary key,
  title text not null,
  description text not null default '',
  cost_points integer not null default 0,
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.rewards enable row level security;

drop policy if exists rewards_select_active on public.rewards;
create policy rewards_select_active
on public.rewards
for select
to authenticated
using (active = true);

drop trigger if exists rewards_touch_updated_at on public.rewards;
create trigger rewards_touch_updated_at
before update on public.rewards
for each row
execute function public.touch_updated_at();

create table if not exists public.reward_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id text references public.rewards(id) on delete set null,
  reward_title text not null,
  card_number text not null,
  cost_points integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.reward_orders enable row level security;

drop policy if exists reward_orders_select_own on public.reward_orders;
create policy reward_orders_select_own
on public.reward_orders
for select
to authenticated
using (auth.uid() = user_id);

insert into public.portal_tasks (id, title, description, reward_points, url, sort_order, active)
values
  ('daily_monitor_review', '完成今日監控檢查', '確認房間資料已完成讀取，檢查爆破可能、高爆點數與免費遊戲週期。', 20, '', 10, true),
  ('bind_source_url', '綁定監測來源', '把常用遊戲網址保存到會員資料，方便每次開啟監控流程。', 30, '', 20, true),
  ('cloud_sync_check', '檢查雲端同步', '確認雲端快照可被其他登入帳號即時讀取。', 40, '', 30, true)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  reward_points = excluded.reward_points,
  url = excluded.url,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.rewards (id, title, description, cost_points, sort_order, active)
values
  ('thermal_badge', '熱能柔光稱號', '兌換後會在會員中心顯示專屬稱號。', 120, 10, true),
  ('priority_card', '高爆觀察卡', '產生一組專屬卡號，方便紀錄高回報房間觀察批次。', 220, 20, true),
  ('archive_card', '快照封存卡', '產生一組封存卡號，標記雲端快照紀錄用途。', 320, 30, true)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  cost_points = excluded.cost_points,
  sort_order = excluded.sort_order,
  active = excluded.active;

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
  v_last_checkin date;
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

  select last_checkin_at
  into v_last_checkin
  from public.profiles
  where id = v_user
  for update;

  if v_last_checkin = v_today then
    select points into v_balance from public.profiles where id = v_user;
    return jsonb_build_object('ok', true, 'message', '今日已簽到。', 'points', v_balance);
  end if;

  update public.profiles
  set points = coalesce(points, 0) + 20,
      last_checkin_at = v_today
  where id = v_user
  returning points into v_balance;

  insert into public.point_ledger (user_id, action, amount, balance, meta)
  values (v_user, '每日簽到', 20, v_balance, jsonb_build_object('source', 'checkin'));

  return jsonb_build_object('ok', true, 'message', '簽到完成。', 'points', v_balance);
end;
$$;

create or replace function public.claim_task(p_task_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_task public.portal_tasks%rowtype;
  v_balance integer;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  select *
  into v_task
  from public.portal_tasks
  where id = p_task_id
    and active = true;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到任務。');
  end if;

  if exists (
    select 1
    from public.task_completions
    where user_id = v_user
      and task_id = p_task_id
  ) then
    select points into v_balance from public.profiles where id = v_user;
    return jsonb_build_object('ok', true, 'message', '任務已完成。', 'points', v_balance);
  end if;

  insert into public.task_completions (user_id, task_id)
  values (v_user, p_task_id);

  update public.profiles
  set points = coalesce(points, 0) + coalesce(v_task.reward_points, 0)
  where id = v_user
  returning points into v_balance;

  insert into public.point_ledger (user_id, action, amount, balance, meta)
  values (
    v_user,
    '完成任務：' || v_task.title,
    coalesce(v_task.reward_points, 0),
    v_balance,
    jsonb_build_object('task_id', p_task_id)
  );

  return jsonb_build_object('ok', true, 'message', '任務完成。', 'points', v_balance);
end;
$$;

create or replace function public.redeem_reward(p_reward_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_reward public.rewards%rowtype;
  v_points integer;
  v_balance integer;
  v_card text;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  select *
  into v_reward
  from public.rewards
  where id = p_reward_id
    and active = true;

  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到兌換項目。');
  end if;

  select coalesce(points, 0)
  into v_points
  from public.profiles
  where id = v_user
  for update;

  if coalesce(v_points, 0) < coalesce(v_reward.cost_points, 0) then
    return jsonb_build_object('ok', false, 'message', '積分不足。', 'points', coalesce(v_points, 0));
  end if;

  v_card := 'ATG-' ||
    upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' ||
    upper(substr(md5(random()::text || v_user::text), 1, 4)) || '-' ||
    upper(substr(md5(clock_timestamp()::text), 1, 4));

  update public.profiles
  set points = coalesce(points, 0) - coalesce(v_reward.cost_points, 0),
      badge = case when p_reward_id = 'thermal_badge' then '熱能柔光稱號' else badge end
  where id = v_user
  returning points into v_balance;

  insert into public.reward_orders (user_id, reward_id, reward_title, card_number, cost_points)
  values (v_user, p_reward_id, v_reward.title, v_card, v_reward.cost_points);

  insert into public.point_ledger (user_id, action, amount, balance, meta)
  values (
    v_user,
    '兌換：' || v_reward.title,
    -coalesce(v_reward.cost_points, 0),
    v_balance,
    jsonb_build_object('reward_id', p_reward_id, 'card_number', v_card)
  );

  return jsonb_build_object('ok', true, 'message', '兌換完成。', 'points', v_balance, 'card_number', v_card);
end;
$$;

grant execute on function public.claim_daily_checkin() to authenticated;
grant execute on function public.claim_task(text) to authenticated;
grant execute on function public.redeem_reward(text) to authenticated;

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

drop policy if exists monitor_devices_select_own on public.monitor_devices;
create policy monitor_devices_select_own
on public.monitor_devices
for select
to authenticated
using (owner_id = auth.uid());

drop trigger if exists monitor_devices_touch_updated_at on public.monitor_devices;
create trigger monitor_devices_touch_updated_at
before update on public.monitor_devices
for each row
execute function public.touch_updated_at();

create table if not exists public.monitor_device_snapshots (
  device_id text primary key references public.monitor_devices(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.monitor_device_snapshots enable row level security;
alter table public.monitor_device_snapshots replica identity full;

drop policy if exists monitor_device_snapshots_select_own on public.monitor_device_snapshots;
create policy monitor_device_snapshots_select_own
on public.monitor_device_snapshots
for select
to authenticated
using (
  exists (
    select 1
    from public.monitor_devices
    where monitor_devices.id = monitor_device_snapshots.device_id
      and monitor_devices.owner_id = auth.uid()
  )
);

drop trigger if exists monitor_device_snapshots_touch_updated_at on public.monitor_device_snapshots;
create trigger monitor_device_snapshots_touch_updated_at
before update on public.monitor_device_snapshots
for each row
execute function public.touch_updated_at();

create or replace function public.token_hash(p_token text)
returns text
language sql
stable
as $$
  select encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
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
declare
  v_existing public.monitor_devices%rowtype;
begin
  if length(coalesce(p_device_id, '')) < 12
    or length(coalesce(p_pair_token, '')) < 24
    or length(coalesce(p_write_token, '')) < 24 then
    return jsonb_build_object('ok', false, 'message', '監測端憑證格式不正確。');
  end if;

  select *
  into v_existing
  from public.monitor_devices
  where id = p_device_id
  for update;

  if found and v_existing.write_token_hash <> public.token_hash(p_write_token) then
    return jsonb_build_object('ok', false, 'message', '監測端已存在。');
  end if;

  insert into public.monitor_devices (id, label, pair_token_hash, write_token_hash, status, last_seen_at)
  values (
    p_device_id,
    nullif(p_label, ''),
    public.token_hash(p_pair_token),
    public.token_hash(p_write_token),
    'waiting',
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    label = coalesce(nullif(excluded.label, ''), public.monitor_devices.label),
    last_seen_at = timezone('utc', now()),
    status = case when public.monitor_devices.owner_id is null then 'waiting' else 'active' end;

  return jsonb_build_object('ok', true, 'message', '監測端已準備。');
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

  select *
  into v_device
  from public.monitor_devices
  where id = p_device_id
  for update;

  if not found or v_device.pair_token_hash <> public.token_hash(p_pair_token) then
    return jsonb_build_object('ok', false, 'message', '監測端配對失敗。');
  end if;

  if v_device.owner_id is not null and v_device.owner_id <> v_user then
    return jsonb_build_object('ok', false, 'message', '監測端已綁定其他帳號。');
  end if;

  update public.monitor_devices
  set owner_id = v_user,
      status = 'active',
      claimed_at = coalesce(claimed_at, timezone('utc', now())),
      last_seen_at = timezone('utc', now())
  where id = p_device_id;

  return jsonb_build_object('ok', true, 'message', '監測端已綁定。');
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
  select *
  into v_device
  from public.monitor_devices
  where id = p_device_id
  for update;

  if not found or v_device.write_token_hash <> public.token_hash(p_write_token) then
    return jsonb_build_object('ok', false, 'message', '監測端未授權。');
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

  return jsonb_build_object('ok', true, 'message', '監測資料已更新。');
end;
$$;

grant execute on function public.register_monitor_device(text, text, text, text) to anon, authenticated;
grant execute on function public.claim_monitor_device(text, text) to authenticated;
grant execute on function public.publish_monitor_snapshot(text, text, jsonb) to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'monitor_device_snapshots'
  ) then
    alter publication supabase_realtime add table public.monitor_device_snapshots;
  end if;
end $$;
