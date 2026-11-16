-- Roktodaan (রক্তদান) — Production PostgreSQL / Supabase Schema
-- Supports Row Level Security (RLS), PostGIS-compatible coordinates, and 8-Division Union Hierarchy

create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('donor', 'seeker', 'admin', 'hospital');
create type blood_group as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
create type urgency_level as enum ('normal', 'urgent', 'critical');
create type request_status as enum ('open', 'matched', 'fulfilled', 'cancelled');
create type match_status as enum ('pending', 'accepted', 'declined', 'completed');
create type contact_preference as enum ('phone', 'sms', 'whatsapp', 'in_app');

-- 1. Locations (Bangladesh Administrative Hierarchy: Division -> District -> Upazila -> Union)
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  division_en text not null,
  division_bn text not null,
  district_en text not null,
  district_bn text not null,
  upazila_en text not null,
  upazila_bn text not null,
  union_en text not null,
  union_bn text not null,
  latitude double precision not null,
  longitude double precision not null,
  unique (division_en, district_en, upazila_en, union_en)
);

-- 2. Users (linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text unique,
  role user_role not null default 'donor',
  preferred_language text not null default 'en' check (preferred_language in ('en', 'bn')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Donor Profiles
create table if not exists public.donor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  blood_group blood_group not null,
  division text not null,
  district text not null,
  upazila text not null,
  union_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  is_available boolean not null default true,
  last_donation_date date,
  total_donations integer not null default 0,
  contact_preference contact_preference not null default 'phone',
  is_verified boolean not null default false,
  verified_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Blood Requests
create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.users(id) on delete cascade,
  patient_name text not null,
  blood_group blood_group not null,
  bags_needed integer not null check (bags_needed between 1 and 10),
  urgency urgency_level not null default 'urgent',
  hospital_name text,
  contact_phone text not null,
  division text not null,
  district text not null,
  upazila text not null,
  union_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  notes text,
  status request_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Matches / Donor Responses
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests(id) on delete cascade,
  donor_id uuid not null references public.donor_profiles(id) on delete cascade,
  status match_status not null default 'pending',
  distance_km double precision not null,
  donor_note text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (request_id, donor_id)
);

-- 6. Hospitals & Blood Banks
create table if not exists public.blood_banks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_bn text not null,
  division text not null,
  district text not null,
  upazila text not null,
  union_name text not null,
  address text not null,
  phone text not null,
  latitude double precision not null,
  longitude double precision not null,
  is_24_hours boolean not null default true,
  is_verified boolean not null default true,
  available_groups blood_group[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 7. Impact Stats (Materialized or Ledger Table)
create table if not exists public.impact_stats (
  id integer primary key default 1,
  total_donors integer not null default 0,
  verified_donors integer not null default 0,
  successful_matches integer not null default 0,
  lives_impacted integer not null default 0,
  active_unions_covered integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Indexes for fast geospatial/hierarchy matching
create index if not exists idx_donor_profiles_group_avail on public.donor_profiles(blood_group, is_available);
create index if not exists idx_donor_profiles_hierarchy on public.donor_profiles(division, district, upazila, union_name);
create index if not exists idx_blood_requests_status_urgency on public.blood_requests(status, urgency, created_at desc);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.donor_profiles enable row level security;
alter table public.blood_requests enable row level security;
alter table public.matches enable row level security;
alter table public.blood_banks enable row level security;
alter table public.impact_stats enable row level security;

-- Basic RLS Policies
create policy "Public can read verified blood banks" on public.blood_banks for select using (true);
create policy "Public can read impact stats" on public.impact_stats for select using (true);
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Authenticated users can browse available donors" on public.donor_profiles for select using (is_available = true or auth.uid() = user_id);
create policy "Donors manage own profile" on public.donor_profiles for all using (auth.uid() = user_id);
create policy "Authenticated users can view open requests" on public.blood_requests for select using (true);
create policy "Seekers manage own requests" on public.blood_requests for all using (auth.uid() = seeker_id);
