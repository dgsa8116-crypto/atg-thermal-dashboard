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
