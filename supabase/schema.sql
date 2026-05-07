create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_role as enum ('salesperson', 'manager', 'admin');
  end if;
end
$$;

create table if not exists public.salesperson_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  email text unique not null,
  display_name text not null,
  salesperson_id text unique not null,
  role public.app_role not null default 'salesperson',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  salesperson_profile_id uuid not null references public.salesperson_profiles (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.foot_traffic_entries (
  id uuid primary key default gen_random_uuid(),
  salesperson_profile_id uuid not null references public.salesperson_profiles (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists salesperson_profiles_set_updated_at on public.salesperson_profiles;
create trigger salesperson_profiles_set_updated_at
before update on public.salesperson_profiles
for each row
execute procedure public.set_updated_at();

alter table public.salesperson_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.foot_traffic_entries enable row level security;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select role
  from public.salesperson_profiles
  where auth_user_id = auth.uid()
    and active = true
  limit 1;
$$;

drop policy if exists "profiles_select_own" on public.salesperson_profiles;
drop policy if exists "profiles_update_self_link" on public.salesperson_profiles;
drop policy if exists "leads_select_visible" on public.leads;
drop policy if exists "leads_insert_self" on public.leads;
drop policy if exists "leads_delete_manager" on public.leads;
drop policy if exists "traffic_select_visible" on public.foot_traffic_entries;
drop policy if exists "traffic_insert_self" on public.foot_traffic_entries;
drop policy if exists "traffic_delete_manager" on public.foot_traffic_entries;

create policy "profiles_select_own"
on public.salesperson_profiles
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or auth_user_id = auth.uid()
);

create policy "profiles_update_self_link"
on public.salesperson_profiles
for update
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or auth_user_id = auth.uid()
)
with check (
  auth_user_id = auth.uid()
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "leads_select_visible"
on public.leads
for select
to authenticated
using (
  public.current_app_role() in ('manager', 'admin')
  or exists (
    select 1
    from public.salesperson_profiles profile
    where profile.id = leads.salesperson_profile_id
      and profile.auth_user_id = auth.uid()
      and profile.active = true
  )
);

create policy "leads_insert_self"
on public.leads
for insert
to authenticated
with check (
  exists (
    select 1
    from public.salesperson_profiles profile
    where profile.id = leads.salesperson_profile_id
      and profile.auth_user_id = auth.uid()
      and profile.active = true
  )
);

create policy "leads_delete_manager"
on public.leads
for delete
to authenticated
using (public.current_app_role() in ('manager', 'admin'));

create policy "traffic_select_visible"
on public.foot_traffic_entries
for select
to authenticated
using (
  public.current_app_role() in ('manager', 'admin')
  or exists (
    select 1
    from public.salesperson_profiles profile
    where profile.id = foot_traffic_entries.salesperson_profile_id
      and profile.auth_user_id = auth.uid()
      and profile.active = true
  )
);

create policy "traffic_insert_self"
on public.foot_traffic_entries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.salesperson_profiles profile
    where profile.id = foot_traffic_entries.salesperson_profile_id
      and profile.auth_user_id = auth.uid()
      and profile.active = true
  )
);

create policy "traffic_delete_manager"
on public.foot_traffic_entries
for delete
to authenticated
using (public.current_app_role() in ('manager', 'admin'));

insert into public.salesperson_profiles (email, display_name, salesperson_id, role)
values
  ('amanda.s@safagoods.com', 'Amanda S.', 'amanda-s', 'salesperson'),
  ('j.miner@safagoods.com', 'J. Miner', 'j-miner', 'salesperson'),
  ('jordan.t@safagoods.com', 'Jordan T.', 'jordan-t', 'salesperson'),
  ('b.burke@safagoods.com', 'B. Burke', 'b-burke', 'salesperson'),
  ('matt@leafdistro.com', 'Matt', 'matt-leafdistro', 'manager'),
  ('tisha.s@safagoods.com', 'Tisha S.', 'tisha-s', 'manager'),
  ('danielle.h@safagoods.com', 'Danielle H.', 'danielle-h', 'salesperson'),
  ('flogert@rocketmail.com', 'Flogert B.', 'flogert', 'admin')
on conflict (email) do update set
  display_name = excluded.display_name,
  salesperson_id = excluded.salesperson_id,
  role = excluded.role,
  active = true;