-- ============================================
-- Crop-Doc: Supabase Migration Script
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  phone text,
  location_district text,
  language_pref text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);


-- 2. SCANS TABLE
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text not null,
  disease_detected text not null,
  crop_name text,
  confidence_score real default 0,
  geo_lat real,
  geo_long real,
  chemical_solution text,
  organic_solution text,
  prevention text,
  created_at timestamptz default now()
);

alter table public.scans enable row level security;

create policy "Users can view their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own scans"
  on public.scans for delete
  using (auth.uid() = user_id);


-- 3. STORAGE BUCKET
-- Create a public 'photos' bucket for scan images
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to photos bucket
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
  );

-- Allow public read access to photos
create policy "Public read access for photos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Allow users to delete their own uploaded photos
create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
