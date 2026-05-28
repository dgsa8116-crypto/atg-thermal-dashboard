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

create table if not exists public.roles (
  id text primary key,
  name text not null,
  level integer not null default 0,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  role_id text not null references public.roles(id) on delete cascade,
  resource text not null,
  action text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (role_id, resource, action)
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  line_id text unique,
  display_name text,
  avatar_url text,
  phone text,
  role_id text not null default 'member' references public.roles(id),
  status text not null default 'active',
  referral_code text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  registered_ip inet,
  registered_device_hash text,
  email_verified boolean not null default false,
  login_count integer not null default 0,
  current_login_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (referral_code)
);

alter table public.users add column if not exists line_id text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists login_count integer not null default 0;
alter table public.users add column if not exists current_login_at timestamptz;
alter table public.users add column if not exists last_login_at timestamptz;

create table if not exists public.login_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'password',
  line_id text,
  display_name text,
  avatar_url text,
  role_id text,
  status text not null default 'success',
  user_agent text,
  ip inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  check (status in ('success', 'failed', 'blocked'))
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  balance integer not null default 0,
  pending_balance integer not null default 0,
  frozen_balance integer not null default 0,
  expiring_balance integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  check (balance >= 0),
  check (pending_balance >= 0),
  check (frozen_balance >= 0),
  check (expiring_balance >= 0)
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  transaction_type text not null,
  source text not null,
  amount integer not null,
  status text not null default 'posted',
  balance_after integer,
  frozen_amount integer not null default 0,
  idempotency_key text,
  reference_table text,
  reference_id text,
  note text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (idempotency_key),
  check (transaction_type in ('purchase', 'referral', 'task', 'unlock_content', 'redeem_product', 'admin_adjust', 'refund', 'freeze', 'unfreeze', 'expire')),
  check (status in ('pending', 'posted', 'rejected', 'frozen', 'refunded', 'expired'))
);

create table if not exists public.prediction_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.prediction_categories(id) on delete set null,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  full_content text not null default '',
  reference_data jsonb not null default '[]'::jsonb,
  data_observation jsonb not null default '[]'::jsonb,
  risk_notice text not null default '本內容僅供娛樂與資料參考，不保證結果，不構成投注、投資或獲利建議。',
  access_type text not null default 'points',
  unlock_points integer not null default 0,
  vip_only boolean not null default false,
  status text not null default 'draft',
  result_status text not null default 'unsettled',
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (access_type in ('free', 'points', 'vip')),
  check (status in ('draft', 'published', 'expired', 'archived')),
  check (result_status in ('unsettled', 'correct', 'wrong', 'void'))
);

create table if not exists public.prediction_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prediction_id uuid not null references public.predictions(id) on delete cascade,
  unlock_method text not null default 'points',
  point_transaction_id uuid references public.point_transactions(id) on delete set null,
  unlocked_at timestamptz not null default timezone('utc', now()),
  unique (user_id, prediction_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_type text not null,
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_amount numeric(12, 2) not null default 0,
  price_currency text not null default 'TWD',
  points_amount integer not null default 0,
  cost_points integer not null default 0,
  valid_days integer,
  stock integer,
  member_only boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (product_type in ('point_pack', 'vip', 'prediction_card', 'pass', 'badge', 'limited_content', 'virtual_item'))
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default 'ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  item_name text not null,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'TWD',
  points_amount integer not null default 0,
  status text not null default 'pending',
  refund_status text not null default 'none',
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (idempotency_key),
  check (status in ('pending', 'paid', 'failed', 'cancelled', 'abnormal')),
  check (refund_status in ('none', 'requested', 'refunded', 'rejected'))
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  webhook_event_id text not null,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'TWD',
  status text not null default 'received',
  raw_payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (webhook_event_id),
  unique (provider, provider_payment_id)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid references public.users(id) on delete set null,
  referral_code text not null,
  level integer not null default 1,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz,
  rejected_at timestamptz,
  check (status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  referrer_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid references public.users(id) on delete set null,
  reward_points integer not null default 0,
  status text not null default 'pending',
  review_note text not null default '',
  point_transaction_id uuid references public.point_transactions(id) on delete set null,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  check (status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  task_type text not null,
  title text not null,
  description text not null default '',
  reward_points integer not null default 0,
  condition_json jsonb not null default '{}'::jsonb,
  audit_mode text not null default 'manual',
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (task_type in ('daily_login', 'verification', 'referral', 'campaign')),
  check (audit_mode in ('auto', 'manual'))
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  progress integer not null default 0,
  status text not null default 'pending',
  proof_data jsonb not null default '{}'::jsonb,
  point_transaction_id uuid references public.point_transactions(id) on delete set null,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  unique (task_id, user_id),
  check (status in ('available', 'pending', 'completed', 'failed'))
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_type text not null,
  source_order_id uuid references public.orders(id) on delete set null,
  starts_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  check (plan_type in ('weekly', 'monthly', 'vip', 'agent'))
);

create table if not exists public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  risk_type text not null,
  severity text not null default 'medium',
  message text not null,
  status text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  handled_by uuid references public.users(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  check (severity in ('low', 'medium', 'high')),
  check (status in ('open', 'reviewing', 'resolved', 'dismissed'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  resource text not null,
  resource_id text,
  before_data jsonb,
  after_data jsonb,
  reason text not null default '',
  ip inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.atg_room_snapshots (
  room_key text primary key,
  room_name text not null,
  provider text not null default 'ATG',
  game_url text,
  status text not null default 'waiting',
  score numeric not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id text primary key default 'main',
  site_name text not null default '黑曜智流 AI',
  logo_url text,
  brand_color text not null default '#39ff14',
  support_email text,
  footer_text text not null default '本系統僅提供預測內容管理、會員點數、推廣積分與虛擬商品功能。',
  domain text,
  home_copy jsonb not null default '{}'::jsonb,
  registration_enabled boolean not null default true,
  referral_enabled boolean not null default true,
  point_purchase_enabled boolean not null default true,
  restricted_terms text[] not null default '{}'::text[],
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  seo_title text not null,
  meta_description text not null,
  og_title text,
  og_image text,
  canonical_url text,
  faq_schema jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_point_transactions_user_created on public.point_transactions(user_id, created_at desc);
create index if not exists idx_predictions_status_category on public.predictions(status, category_id);
create index if not exists idx_referral_rewards_status on public.referral_rewards(status);
create index if not exists idx_risk_flags_status_severity on public.risk_flags(status, severity);
create index if not exists idx_login_records_user_created on public.login_records(user_id, created_at desc);
create unique index if not exists idx_users_line_id_unique on public.users(line_id) where line_id is not null;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at before update on public.users for each row execute function public.touch_updated_at();
drop trigger if exists categories_touch_updated_at on public.prediction_categories;
create trigger categories_touch_updated_at before update on public.prediction_categories for each row execute function public.touch_updated_at();
drop trigger if exists predictions_touch_updated_at on public.predictions;
create trigger predictions_touch_updated_at before update on public.predictions for each row execute function public.touch_updated_at();
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders for each row execute function public.touch_updated_at();
drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at before update on public.tasks for each row execute function public.touch_updated_at();
drop trigger if exists seo_touch_updated_at on public.seo_settings;
create trigger seo_touch_updated_at before update on public.seo_settings for each row execute function public.touch_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_wallet_id uuid;
  v_line_id text;
  v_display_name text;
  v_avatar_url text;
begin
  select coalesce(
    new.raw_user_meta_data ->> 'provider_id',
    new.raw_user_meta_data ->> 'sub',
    new.raw_user_meta_data ->> 'user_id'
  ) into v_line_id;

  select coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'display_name',
    split_part(coalesce(new.email, 'member'), '@', 1)
  ) into v_display_name;

  select coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  ) into v_avatar_url;

  insert into public.users (id, email, line_id, display_name, avatar_url)
  values (new.id, new.email, v_line_id, v_display_name, v_avatar_url)
  on conflict (id) do update
  set email = excluded.email,
      line_id = coalesce(public.users.line_id, v_line_id),
      display_name = coalesce(public.users.display_name, excluded.display_name),
      avatar_url = coalesce(public.users.avatar_url, v_avatar_url)
  returning id into v_user_id;

  insert into public.wallets (user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing
  returning id into v_wallet_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_role_level()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select r.level from public.users u join public.roles r on r.id = u.role_id where u.id = auth.uid()), 0)
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_level() >= 40
$$;

create or replace function public.has_role(p_min_level integer)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_level() >= p_min_level
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select status = 'active' from public.users where id = auth.uid()), false)
$$;

create or replace function public.record_login_event()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_auth auth.users%rowtype;
  v_identity jsonb;
  v_provider text := 'password';
  v_line_id text;
  v_display_name text;
  v_avatar_url text;
  v_role text;
  v_headers jsonb := '{}'::jsonb;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '尚未登入。');
  end if;

  select * into v_auth from auth.users where id = v_user;

  select identity_data into v_identity
  from auth.identities
  where user_id = v_user and provider = 'line'
  order by created_at desc
  limit 1;

  if v_identity is not null then
    v_provider := 'line';
  end if;

  v_line_id := coalesce(
    v_identity ->> 'sub',
    v_identity ->> 'user_id',
    v_identity ->> 'provider_id',
    v_auth.raw_user_meta_data ->> 'provider_id',
    v_auth.raw_user_meta_data ->> 'sub',
    v_auth.raw_user_meta_data ->> 'user_id'
  );

  v_display_name := coalesce(
    v_identity ->> 'name',
    v_identity ->> 'displayName',
    v_auth.raw_user_meta_data ->> 'full_name',
    v_auth.raw_user_meta_data ->> 'name',
    v_auth.raw_user_meta_data ->> 'display_name',
    split_part(coalesce(v_auth.email, 'member'), '@', 1)
  );

  v_avatar_url := coalesce(
    v_identity ->> 'avatar_url',
    v_identity ->> 'picture',
    v_auth.raw_user_meta_data ->> 'avatar_url',
    v_auth.raw_user_meta_data ->> 'picture'
  );

  insert into public.users (id, email, line_id, display_name, avatar_url, email_verified)
  values (v_user, v_auth.email, v_line_id, v_display_name, v_avatar_url, v_auth.email_confirmed_at is not null)
  on conflict (id) do update
  set email = excluded.email,
      line_id = coalesce(excluded.line_id, public.users.line_id),
      display_name = coalesce(excluded.display_name, public.users.display_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
      email_verified = public.users.email_verified or excluded.email_verified,
      last_login_at = coalesce(public.users.current_login_at, public.users.last_login_at),
      current_login_at = timezone('utc', now()),
      login_count = coalesce(public.users.login_count, 0) + 1,
      updated_at = timezone('utc', now())
  returning role_id into v_role;

  begin
    v_headers := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  exception when others then
    v_headers := '{}'::jsonb;
  end;

  insert into public.login_records (
    user_id,
    provider,
    line_id,
    display_name,
    avatar_url,
    role_id,
    user_agent,
    ip,
    metadata
  )
  values (
    v_user,
    v_provider,
    v_line_id,
    v_display_name,
    v_avatar_url,
    v_role,
    v_headers ->> 'user-agent',
    nullif(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1), '')::inet,
    jsonb_build_object('auth_provider', v_provider)
  );

  return jsonb_build_object('ok', true, 'message', '登入紀錄已更新。', 'provider', v_provider, 'role', v_role);
end;
$$;

create or replace function public.write_audit_log(
  p_action text,
  p_resource text,
  p_resource_id text default null,
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
  insert into public.audit_logs (actor_id, action, resource, resource_id, before_data, after_data, reason)
  values (auth.uid(), p_action, p_resource, p_resource_id, p_before, p_after, coalesce(p_reason, ''));
end;
$$;

create or replace function public.apply_point_transaction(
  p_user_id uuid,
  p_type text,
  p_source text,
  p_amount integer,
  p_status text default 'posted',
  p_reference_table text default null,
  p_reference_id text default null,
  p_note text default '',
  p_idempotency_key text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets%rowtype;
  v_tx_id uuid;
  v_new_balance integer;
begin
  if p_idempotency_key is not null then
    select id into v_tx_id from public.point_transactions where idempotency_key = p_idempotency_key;
    if v_tx_id is not null then
      return v_tx_id;
    end if;
  end if;

  insert into public.wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select * into v_wallet
  from public.wallets
  where user_id = p_user_id
  for update;

  if p_status = 'posted' then
    v_new_balance := greatest(0, v_wallet.balance + p_amount);
    update public.wallets
    set balance = v_new_balance,
        expiring_balance = case when p_expires_at is not null and p_amount > 0 then expiring_balance + p_amount else expiring_balance end,
        updated_at = timezone('utc', now())
    where id = v_wallet.id;
  elsif p_status = 'pending' then
    v_new_balance := v_wallet.balance;
    update public.wallets
    set pending_balance = greatest(0, pending_balance + greatest(p_amount, 0)),
        updated_at = timezone('utc', now())
    where id = v_wallet.id;
  elsif p_status = 'frozen' then
    v_new_balance := v_wallet.balance;
    update public.wallets
    set frozen_balance = greatest(0, frozen_balance + abs(p_amount)),
        updated_at = timezone('utc', now())
    where id = v_wallet.id;
  else
    v_new_balance := v_wallet.balance;
  end if;

  insert into public.point_transactions (
    user_id,
    wallet_id,
    transaction_type,
    source,
    amount,
    status,
    balance_after,
    idempotency_key,
    reference_table,
    reference_id,
    note,
    metadata,
    expires_at,
    created_by
  )
  values (
    p_user_id,
    v_wallet.id,
    p_type,
    p_source,
    p_amount,
    p_status,
    v_new_balance,
    p_idempotency_key,
    p_reference_table,
    p_reference_id,
    coalesce(p_note, ''),
    coalesce(p_metadata, '{}'::jsonb),
    p_expires_at,
    auth.uid()
  )
  returning id into v_tx_id;

  return v_tx_id;
end;
$$;

create or replace function public.unlock_prediction(p_prediction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_prediction public.predictions%rowtype;
  v_balance integer;
  v_tx uuid;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  if not public.is_active_user() then
    return jsonb_build_object('ok', false, 'message', '帳號狀態無法使用此功能。');
  end if;

  select * into v_prediction
  from public.predictions
  where id = p_prediction_id and status = 'published'
    and (expires_at is null or expires_at > timezone('utc', now()));

  if not found then
    return jsonb_build_object('ok', false, 'message', '內容目前不可解鎖。');
  end if;

  if exists (select 1 from public.prediction_unlocks where user_id = v_user and prediction_id = p_prediction_id) then
    return jsonb_build_object('ok', true, 'message', '內容已解鎖。');
  end if;

  if v_prediction.access_type = 'vip' then
    if not exists (select 1 from public.memberships where user_id = v_user and active = true and plan_type in ('vip', 'monthly', 'weekly') and (expires_at is null or expires_at > timezone('utc', now()))) then
      return jsonb_build_object('ok', false, 'message', '此內容需要有效會員權限。');
    end if;
    insert into public.prediction_unlocks (user_id, prediction_id, unlock_method)
    values (v_user, p_prediction_id, 'vip');
    return jsonb_build_object('ok', true, 'message', '內容已解鎖。');
  end if;

  if v_prediction.access_type = 'free' or v_prediction.unlock_points = 0 then
    insert into public.prediction_unlocks (user_id, prediction_id, unlock_method)
    values (v_user, p_prediction_id, 'free');
    return jsonb_build_object('ok', true, 'message', '內容已解鎖。');
  end if;

  select balance into v_balance from public.wallets where user_id = v_user for update;
  if coalesce(v_balance, 0) < v_prediction.unlock_points then
    return jsonb_build_object('ok', false, 'message', '點數不足。');
  end if;

  v_tx := public.apply_point_transaction(
    v_user,
    'unlock_content',
    v_prediction.title,
    -v_prediction.unlock_points,
    'posted',
    'predictions',
    p_prediction_id::text,
    '內容解鎖',
    'unlock:' || v_user::text || ':' || p_prediction_id::text
  );

  insert into public.prediction_unlocks (user_id, prediction_id, unlock_method, point_transaction_id)
  values (v_user, p_prediction_id, 'points', v_tx);

  return jsonb_build_object('ok', true, 'message', '內容已解鎖。');
end;
$$;

create or replace function public.submit_task(p_task_id uuid)
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

  if not public.is_active_user() then
    return jsonb_build_object('ok', false, 'message', '帳號狀態無法使用此功能。');
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id and active = true
    and (starts_at is null or starts_at <= timezone('utc', now()))
    and (ends_at is null or ends_at > timezone('utc', now()));

  if not found then
    return jsonb_build_object('ok', false, 'message', '任務目前不可提交。');
  end if;

  insert into public.task_completions (task_id, user_id, progress, status)
  values (p_task_id, v_user, 1, case when v_task.audit_mode = 'auto' then 'completed' else 'pending' end)
  on conflict (task_id, user_id) do update
  set progress = greatest(public.task_completions.progress, 1),
      status = case when public.task_completions.status = 'failed' then excluded.status else public.task_completions.status end;

  if v_task.audit_mode = 'auto' then
    perform public.apply_point_transaction(
      v_user,
      'task',
      v_task.title,
      v_task.reward_points,
      'posted',
      'tasks',
      p_task_id::text,
      '任務獎勵',
      'task:' || v_user::text || ':' || p_task_id::text
    );
  end if;

  return jsonb_build_object('ok', true, 'message', case when v_task.audit_mode = 'auto' then '任務已完成。' else '任務已送出審核。' end);
end;
$$;

create or replace function public.create_order(p_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_product public.products%rowtype;
  v_order public.orders%rowtype;
  v_key text;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  if not public.is_active_user() then
    return jsonb_build_object('ok', false, 'message', '帳號狀態無法建立訂單。');
  end if;

  select * into v_product from public.products where id = p_product_id and active = true;
  if not found then
    return jsonb_build_object('ok', false, 'message', '商品目前不可購買。');
  end if;

  v_key := 'order:' || v_user::text || ':' || p_product_id::text || ':' || extract(epoch from date_trunc('second', timezone('utc', now())))::text;

  insert into public.orders (user_id, product_id, item_name, amount, currency, points_amount, idempotency_key)
  values (v_user, p_product_id, v_product.name, v_product.price_amount, v_product.price_currency, v_product.points_amount, v_key)
  returning * into v_order;

  return jsonb_build_object('ok', true, 'message', '訂單已建立。', 'order_id', v_order.id, 'order_no', v_order.order_no);
end;
$$;

create or replace function public.redeem_product(p_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_product public.products%rowtype;
  v_balance integer;
  v_tx uuid;
  v_order public.orders%rowtype;
  v_membership_plan text;
  v_redeem_key text;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', '請先登入。');
  end if;

  if not public.is_active_user() then
    return jsonb_build_object('ok', false, 'message', '帳號狀態無法兌換商品。');
  end if;

  select * into v_product
  from public.products
  where id = p_product_id and active = true
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', '商品目前不可兌換。');
  end if;

  if coalesce(v_product.cost_points, 0) <= 0 then
    return jsonb_build_object('ok', false, 'message', '此商品不支援點數兌換。');
  end if;

  if v_product.member_only then
    if not exists (
      select 1
      from public.memberships
      where user_id = v_user
        and active = true
        and (expires_at is null or expires_at > timezone('utc', now()))
    ) then
      return jsonb_build_object('ok', false, 'message', '此商品僅限會員兌換。');
    end if;
  end if;

  if v_product.stock is not null and v_product.stock <= 0 then
    return jsonb_build_object('ok', false, 'message', '庫存不足。');
  end if;

  select balance into v_balance
  from public.wallets
  where user_id = v_user
  for update;

  if coalesce(v_balance, 0) < v_product.cost_points then
    return jsonb_build_object('ok', false, 'message', '點數不足。');
  end if;

  v_redeem_key := 'redeem:' || v_user::text || ':' || p_product_id::text || ':' || extract(epoch from date_trunc('second', timezone('utc', now())))::text;

  v_tx := public.apply_point_transaction(
    v_user,
    'redeem_product',
    v_product.name,
    -v_product.cost_points,
    'posted',
    'products',
    p_product_id::text,
    '商品兌換',
    v_redeem_key
  );

  insert into public.orders (
    user_id,
    product_id,
    item_name,
    amount,
    currency,
    points_amount,
    status,
    idempotency_key,
    paid_at
  )
  values (
    v_user,
    p_product_id,
    v_product.name,
    0,
    v_product.price_currency,
    v_product.cost_points,
    'paid',
    v_redeem_key,
    timezone('utc', now())
  )
  on conflict (idempotency_key) do update
  set updated_at = timezone('utc', now())
  returning * into v_order;

  if v_product.stock is not null then
    update public.products
    set stock = greatest(0, stock - 1),
        updated_at = timezone('utc', now())
    where id = p_product_id;
  end if;

  if v_product.product_type = 'vip' then
    v_membership_plan := case
      when v_product.slug ilike '%weekly%' then 'weekly'
      when v_product.slug ilike '%monthly%' then 'monthly'
      when v_product.slug ilike '%agent%' then 'agent'
      else 'vip'
    end;

    insert into public.memberships (
      user_id,
      plan_type,
      source_order_id,
      starts_at,
      expires_at,
      active,
      metadata
    )
    values (
      v_user,
      v_membership_plan,
      v_order.id,
      timezone('utc', now()),
      case
        when v_product.valid_days is null then null
        else timezone('utc', now()) + make_interval(days => v_product.valid_days)
      end,
      true,
      jsonb_build_object('product_id', p_product_id, 'source', 'redeem_product')
    );
  end if;

  perform public.write_audit_log(
    'redeem_product',
    'orders',
    v_order.id::text,
    null,
    jsonb_build_object('product_id', p_product_id, 'transaction_id', v_tx),
    '會員點數兌換商品'
  );

  return jsonb_build_object(
    'ok', true,
    'message', '商品兌換成功。',
    'order_id', v_order.id,
    'order_no', v_order.order_no,
    'transaction_id', v_tx
  );
end;
$$;

create or replace function public.admin_adjust_points(p_user_id uuid, p_amount integer, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx uuid;
begin
  if not public.is_staff() then
    return jsonb_build_object('ok', false, 'message', '沒有點數管理權限。');
  end if;

  if coalesce(trim(p_reason), '') = '' then
    return jsonb_build_object('ok', false, 'message', '手動調整必須填寫原因。');
  end if;

  v_tx := public.apply_point_transaction(
    p_user_id,
    'admin_adjust',
    '管理員調整',
    p_amount,
    'posted',
    'users',
    p_user_id::text,
    p_reason,
    'admin_adjust:' || gen_random_uuid()::text
  );

  perform public.write_audit_log('admin_adjust_points', 'point_transactions', v_tx::text, null, jsonb_build_object('user_id', p_user_id, 'amount', p_amount), p_reason);
  return jsonb_build_object('ok', true, 'message', '點數已調整。', 'transaction_id', v_tx);
end;
$$;

create or replace function public.admin_review_referral_reward(p_reward_id uuid, p_approved boolean, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward public.referral_rewards%rowtype;
  v_tx uuid;
begin
  if not public.is_staff() then
    return jsonb_build_object('ok', false, 'message', '沒有推廣審核權限。');
  end if;

  select * into v_reward from public.referral_rewards where id = p_reward_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'message', '找不到獎勵紀錄。');
  end if;

  if v_reward.status <> 'pending' then
    return jsonb_build_object('ok', true, 'message', '獎勵已處理。');
  end if;

  if p_approved then
    v_tx := public.apply_point_transaction(
      v_reward.referrer_id,
      'referral',
      '推廣獎勵',
      v_reward.reward_points,
      'posted',
      'referral_rewards',
      p_reward_id::text,
      coalesce(p_reason, ''),
      'referral_reward:' || p_reward_id::text
    );

    update public.referral_rewards
    set status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = timezone('utc', now()),
        review_note = coalesce(p_reason, ''),
        point_transaction_id = v_tx
    where id = p_reward_id;
  else
    update public.referral_rewards
    set status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = timezone('utc', now()),
        review_note = coalesce(p_reason, '')
    where id = p_reward_id;
  end if;

  perform public.write_audit_log('admin_review_referral_reward', 'referral_rewards', p_reward_id::text, null, jsonb_build_object('approved', p_approved), coalesce(p_reason, ''));
  return jsonb_build_object('ok', true, 'message', '推廣獎勵已更新。');
end;
$$;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.users enable row level security;
alter table public.login_records enable row level security;
alter table public.wallets enable row level security;
alter table public.point_transactions enable row level security;
alter table public.prediction_categories enable row level security;
alter table public.predictions enable row level security;
alter table public.prediction_unlocks enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.memberships enable row level security;
alter table public.risk_flags enable row level security;
alter table public.audit_logs enable row level security;
alter table public.atg_room_snapshots enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo_settings enable row level security;

drop policy if exists public_read_roles on public.roles;
create policy public_read_roles on public.roles for select to anon, authenticated using (true);
drop policy if exists public_read_settings on public.site_settings;
create policy public_read_settings on public.site_settings for select to anon, authenticated using (true);
drop policy if exists public_read_seo on public.seo_settings;
create policy public_read_seo on public.seo_settings for select to anon, authenticated using (true);
drop policy if exists public_read_atg_room_snapshots on public.atg_room_snapshots;
create policy public_read_atg_room_snapshots on public.atg_room_snapshots for select to anon, authenticated using (true);
drop policy if exists staff_manage_atg_room_snapshots on public.atg_room_snapshots;
create policy staff_manage_atg_room_snapshots on public.atg_room_snapshots for all to authenticated using (public.has_role(60)) with check (public.has_role(60));
drop policy if exists public_read_categories on public.prediction_categories;
create policy public_read_categories on public.prediction_categories for select to anon, authenticated using (active = true or public.is_staff());
drop policy if exists public_read_predictions on public.predictions;
create policy public_read_predictions on public.predictions for select to anon, authenticated using (status = 'published' or public.is_staff());
drop policy if exists public_read_products on public.products;
create policy public_read_products on public.products for select to anon, authenticated using (active = true or public.is_staff());
drop policy if exists public_read_tasks on public.tasks;
create policy public_read_tasks on public.tasks for select to anon, authenticated using (active = true or public.is_staff());

drop policy if exists users_self_or_staff on public.users;
create policy users_self_or_staff on public.users for select to authenticated using (id = auth.uid() or public.is_staff());
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users for update to authenticated using (id = auth.uid() or public.is_staff()) with check (id = auth.uid() or public.is_staff());

drop policy if exists login_records_self_or_staff on public.login_records;
create policy login_records_self_or_staff on public.login_records for select to authenticated using (user_id = auth.uid() or public.is_staff());

drop policy if exists wallet_self_or_staff on public.wallets;
create policy wallet_self_or_staff on public.wallets for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists point_transactions_self_or_staff on public.point_transactions;
create policy point_transactions_self_or_staff on public.point_transactions for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists unlocks_self_or_staff on public.prediction_unlocks;
create policy unlocks_self_or_staff on public.prediction_unlocks for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists orders_self_or_staff on public.orders;
create policy orders_self_or_staff on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists payments_staff on public.payments;
create policy payments_staff on public.payments for select to authenticated using (public.is_staff());
drop policy if exists referrals_self_or_staff on public.referrals;
create policy referrals_self_or_staff on public.referrals for select to authenticated using (referrer_id = auth.uid() or referred_user_id = auth.uid() or public.is_staff());
drop policy if exists referral_rewards_self_or_staff on public.referral_rewards;
create policy referral_rewards_self_or_staff on public.referral_rewards for select to authenticated using (referrer_id = auth.uid() or referred_user_id = auth.uid() or public.is_staff());
drop policy if exists task_completions_self_or_staff on public.task_completions;
create policy task_completions_self_or_staff on public.task_completions for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists memberships_self_or_staff on public.memberships;
create policy memberships_self_or_staff on public.memberships for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists risk_flags_staff on public.risk_flags;
create policy risk_flags_staff on public.risk_flags for select to authenticated using (public.is_staff());
drop policy if exists audit_logs_staff on public.audit_logs;
create policy audit_logs_staff on public.audit_logs for select to authenticated using (public.is_staff());

insert into public.roles (id, name, level, description)
values
  ('super_admin', '最高管理員', 100, '全系統與白標管理權限'),
  ('admin', '管理員', 80, '營運管理權限'),
  ('manager', '營運主管', 70, '內容、會員、推廣與營運檢視權限'),
  ('editor', '內容編輯', 60, '內容與 SEO 權限'),
  ('support', '客服人員', 40, '會員、訂單與工單查詢'),
  ('agent', '代理推廣', 20, '推廣報表與下線管理'),
  ('user', '一般使用者', 0, '前台會員'),
  ('member', '一般會員', 0, '前台會員'),
  ('guest', '訪客', -10, '未登入訪客')
on conflict (id) do update
set name = excluded.name,
    level = excluded.level,
    description = excluded.description;

insert into public.prediction_categories (slug, name, description, sort_order, active)
values
  ('today', '今日內容', '每日更新內容', 10, true),
  ('hot', '熱門內容', '熱門解鎖與高互動內容', 20, true),
  ('new', '最新內容', '最新發布內容', 30, true),
  ('vip', 'VIP 內容', '會員限定內容', 40, true),
  ('data', '資料觀察', '資料整理與歷史回顧', 50, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order,
    active = excluded.active;

insert into public.predictions (
  category_id,
  slug,
  title,
  summary,
  full_content,
  reference_data,
  data_observation,
  access_type,
  unlock_points,
  vip_only,
  status,
  result_status,
  published_at,
  expires_at
)
select
  c.id,
  seed.slug,
  seed.title,
  seed.summary,
  seed.full_content,
  seed.reference_data::jsonb,
  seed.data_observation::jsonb,
  seed.access_type,
  seed.unlock_points,
  seed.vip_only,
  'published',
  'unsettled',
  timezone('utc', now()),
  seed.expires_at
from (
  values
    ('today', 'daily-signal', '今日資料節奏觀察', '整理今日資料區間、歷史樣本與內容觀察方向。', '完整內容包含資料波動區間、歷史樣本對照、時間序列觀察、可追蹤指標與後續紀錄方式。', '["近 30 日內容樣本", "會員互動紀錄"]', '["樣本數 1280", "觀察窗 24 小時"]', 'points', 80, false, timezone('utc', now()) + interval '1 day'),
    ('vip', 'vip-weekly', 'VIP 週期內容研判', '提供本週內容節奏、資料組合與會員專屬觀察。', '完整分析拆成內容週期、樣本分層、風險區間、觀察清單與結果紀錄欄位。', '["VIP 內容庫", "週期資料表"]', '["樣本數 4920", "觀察窗 7 日"]', 'vip', 0, true, timezone('utc', now()) + interval '7 days'),
    ('new', 'free-overview', '免費內容總覽', '提供平台內容格式、分析欄位與使用方式示範。', '此免費內容展示摘要、參考資料、資料觀察、風險提醒與免責聲明的完整排版。', '["公開示範資料", "內容模板"]', '["樣本數 320", "觀察窗 示範"]', 'free', 0, false, null)
) as seed(category_slug, slug, title, summary, full_content, reference_data, data_observation, access_type, unlock_points, vip_only, expires_at)
join public.prediction_categories c on c.slug = seed.category_slug
on conflict (slug) do update
set title = excluded.title,
    summary = excluded.summary,
    full_content = excluded.full_content,
    reference_data = excluded.reference_data,
    data_observation = excluded.data_observation,
    access_type = excluded.access_type,
    unlock_points = excluded.unlock_points,
    vip_only = excluded.vip_only,
    status = excluded.status,
    result_status = excluded.result_status,
    published_at = excluded.published_at,
    expires_at = excluded.expires_at;

insert into public.products (product_type, slug, name, description, price_amount, points_amount, cost_points, valid_days, stock, member_only, active, sort_order)
values
  ('point_pack', 'starter-points', '入門點數包', '購買後點數入帳。', 300, 300, 0, null, null, false, true, 10),
  ('point_pack', 'growth-points', '營運測試包', '較大額點數包。', 900, 980, 0, null, null, false, true, 20),
  ('vip', 'monthly-vip', '月度 VIP', '30 天會員內容權益。', 0, 0, 1680, 30, null, false, true, 30),
  ('prediction_card', 'unlock-card', '內容解鎖卡', '可用於指定內容解鎖。', 0, 0, 160, 30, 500, false, true, 40),
  ('badge', 'blue-core-badge', '藍核會員徽章', '會員中心與排行展示。', 0, 0, 260, null, null, true, true, 50)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price_amount = excluded.price_amount,
    points_amount = excluded.points_amount,
    cost_points = excluded.cost_points,
    valid_days = excluded.valid_days,
    stock = excluded.stock,
    member_only = excluded.member_only,
    active = excluded.active,
    sort_order = excluded.sort_order;

insert into public.tasks (slug, task_type, title, description, reward_points, condition_json, audit_mode, active, starts_at, ends_at)
values
  ('daily-login', 'daily_login', '每日登入任務', '每日登入會員中心。', 20, '{"required": "login"}'::jsonb, 'auto', true, null, null),
  ('verify-account', 'verification', '完成驗證任務', '完成 Email 與安全設定。', 60, '{"required": "email_verified"}'::jsonb, 'auto', true, null, null),
  ('invite-friend', 'referral', '推廣好友任務', '好友完成指定條件後審核。', 120, '{"required": "approved_referral"}'::jsonb, 'manual', true, null, null),
  ('campaign-3-actions', 'campaign', '活動任務', '活動期間完成三項內容互動。', 240, '{"required": "three_actions"}'::jsonb, 'manual', true, null, null)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    reward_points = excluded.reward_points,
    condition_json = excluded.condition_json,
    audit_mode = excluded.audit_mode,
    active = excluded.active;

insert into public.site_settings (id, site_name, brand_color, footer_text, registration_enabled, referral_enabled, point_purchase_enabled, restricted_terms)
values ('main', '黑曜智流 AI', '#39ff14', '黑曜智流 AI 僅提供內容管理、會員點數、推廣積分與虛擬商品功能。', true, true, true, '{}'::text[])
on conflict (id) do update
set site_name = excluded.site_name,
    brand_color = excluded.brand_color,
    footer_text = excluded.footer_text,
    registration_enabled = excluded.registration_enabled,
    referral_enabled = excluded.referral_enabled,
    point_purchase_enabled = excluded.point_purchase_enabled,
    restricted_terms = '{}'::text[],
    updated_at = timezone('utc', now());

insert into public.seo_settings (path, seo_title, meta_description, canonical_url, faq_schema)
values
  ('/', '黑曜智流 AI 主控台｜高級黑綠科技感 AI 營運平台', '集中管理帳號、權限、登入紀錄與平台內容。', '/', '[]'::jsonb),
  ('/predictions', '預測內容平台｜點數解鎖與 VIP 內容', '瀏覽今日、熱門、最新與 VIP 內容，使用點數解鎖完整分析。', '/predictions', '[]'::jsonb),
  ('/shop', '點數商城系統｜點數包、VIP 與虛擬商品', '提供點數包、VIP 方案、預測卡、通行證、徽章與限定內容。', '/shop', '[]'::jsonb)
on conflict (path) do update
set seo_title = excluded.seo_title,
    meta_description = excluded.meta_description,
    canonical_url = excluded.canonical_url,
    faq_schema = excluded.faq_schema;

do $$
begin
  alter publication supabase_realtime add table public.atg_room_snapshots;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.roles, public.prediction_categories, public.predictions, public.products, public.tasks, public.site_settings, public.seo_settings, public.atg_room_snapshots to anon, authenticated;
grant select on public.users, public.login_records, public.wallets, public.point_transactions, public.prediction_unlocks, public.orders, public.payments, public.referrals, public.referral_rewards, public.task_completions, public.memberships, public.risk_flags, public.audit_logs to authenticated;
grant execute on function public.has_role(integer) to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.record_login_event() to authenticated;
grant execute on function public.unlock_prediction(uuid) to authenticated;
grant execute on function public.submit_task(uuid) to authenticated;
grant execute on function public.create_order(uuid) to authenticated;
grant execute on function public.redeem_product(uuid) to authenticated;
grant execute on function public.admin_adjust_points(uuid, integer, text) to authenticated;
grant execute on function public.admin_review_referral_reward(uuid, boolean, text) to authenticated;

notify pgrst, 'reload schema';
