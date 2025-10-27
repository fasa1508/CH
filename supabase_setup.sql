-- supabase_setup.sql
-- Run this script in Supabase SQL editor to create tables and RLS policies.

-- Enable extension for UUID generation (if needed)
create extension if not exists "pgcrypto";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text,
  created_at timestamptz default now()
);

-- Users (profiles) - linked to auth.users via id
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'user',
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  category text,
  image_url text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_products_category on products(category);

-- Row Level Security: allow public select on products
alter table products enable row level security;

-- Allow anyone to SELECT products (public catalog)
create policy "public_select" on products for select using (true);

-- Allow authenticated users to insert products (owner becomes auth.uid())
create policy "insert_authenticated" on products for insert using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Allow update/delete only by owner or admin role
create policy "modify_own" on products for update using (owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')) with check (owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "delete_own" on products for delete using (owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Categories RLS: public select, admin insert
alter table categories enable row level security;
create policy "categories_public_select" on categories for select using (true);
create policy "categories_admin_modify" on categories for insert, update, delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Note: Make sure to create a Storage bucket named 'images' and set public access if you want simple public URLs.
