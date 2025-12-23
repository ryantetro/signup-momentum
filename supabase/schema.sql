-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique,
  is_paid boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  website text,
  baseline_total_signups integer default 0 not null,
  launch_date date,
  signup_source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily_signup_entries table
create table public.daily_signup_entries (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  date text not null, -- YYYY-MM-DD
  count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, date)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.daily_signup_entries enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Products policies
create policy "Users can view own products" on public.products
  for select using (auth.uid() = user_id);

create policy "Users can insert own products" on public.products
  for insert with check (auth.uid() = user_id);

create policy "Users can update own products" on public.products
  for update using (auth.uid() = user_id);

create policy "Users can delete own products" on public.products
  for delete using (auth.uid() = user_id);

-- Entries policies
create policy "Users can view entries for own products" on public.daily_signup_entries
  for select using (
    exists (
      select 1 from public.products
      where public.products.id = daily_signup_entries.product_id
      and public.products.user_id = auth.uid()
    )
  );

create policy "Users can insert entries for own products" on public.daily_signup_entries
  for insert with check (
    exists (
      select 1 from public.products
      where public.products.id = daily_signup_entries.product_id
      and public.products.user_id = auth.uid()
    )
  );

create policy "Users can update entries for own products" on public.daily_signup_entries
  for update using (
    exists (
      select 1 from public.products
      where public.products.id = daily_signup_entries.product_id
      and public.products.user_id = auth.uid()
    )
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
