create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_tier') then
    create type public.user_tier as enum ('NAYA_SHAYAR', 'USTAD', 'MAHFIL_E_KHAS');
  end if;
end $$;

create or replace function public.avatar_initials_from_pen_name(name_text text)
returns text
language sql
immutable
as $$
  select upper(
    left(coalesce(split_part(trim(name_text), ' ', 1), ''), 1) ||
    left(nullif(split_part(trim(name_text), ' ', 2), ''), 1)
  );
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  pen_name text not null unique,
  email text not null unique,
  bio text default '',
  avatar_initials text not null default 'MH',
  stars_total numeric(10,1) not null default 0,
  tier public.user_tier not null default 'NAYA_SHAYAR',
  followers_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  content_roman text not null,
  content_hindi text default '',
  content_transliterated text default '',
  mood_tag text not null default 'umeed',
  language text not null default 'hinglish',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  trending_score numeric(10,2) not null default 0,
  is_spotlight boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (follower_id, following_id),
  constraint follows_not_self check (follower_id <> following_id)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text default '',
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.collection_posts (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (collection_id, post_id)
);

create index if not exists posts_author_created_idx on public.posts (author_id, created_at desc);
create index if not exists posts_trending_idx on public.posts (trending_score desc, created_at desc);
create index if not exists posts_mood_idx on public.posts (mood_tag, created_at desc);
create index if not exists likes_post_idx on public.likes (post_id);
create index if not exists comments_post_created_idx on public.comments (post_id, created_at desc);
create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_following_idx on public.follows (following_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_pen_name text;
begin
  desired_pen_name := coalesce(new.raw_user_meta_data ->> 'pen_name', split_part(new.email, '@', 1));

  insert into public.users (id, pen_name, email, avatar_initials)
  values (
    new.id,
    desired_pen_name,
    new.email,
    coalesce(public.avatar_initials_from_pen_name(desired_pen_name), 'MH')
  )
  on conflict (id) do update set
    pen_name = excluded.pen_name,
    email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create or replace function public.refresh_follow_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.users set following_count = following_count + 1 where id = new.follower_id;
    update public.users set followers_count = followers_count + 1 where id = new.following_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.users set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.users set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists follows_count_refresh on public.follows;
create trigger follows_count_refresh
after insert or delete on public.follows
for each row execute procedure public.refresh_follow_counts();

create or replace function public.calculate_trending_score_db(
  likes_count integer,
  comments_count integer,
  created_at timestamptz
)
returns numeric(10,2)
language sql
stable
as $$
  select round(
    (
      greatest(coalesce(likes_count, 0), 0)
      + (greatest(coalesce(comments_count, 0), 0) * 2)
      + (
        1
        / (
          greatest(
            extract(epoch from (timezone('utc', now()) - coalesce(created_at, timezone('utc', now())))) / 3600,
            0
          ) + 2
        )
      ) * 50
    )::numeric,
    2
  );
$$;

create or replace function public.refresh_post_engagement_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_post_id uuid;
begin
  target_post_id := coalesce(new.post_id, old.post_id);

  if tg_table_name = 'likes' then
    if tg_op = 'INSERT' then
      update public.posts
      set
        likes_count = likes_count + 1,
        trending_score = public.calculate_trending_score_db(likes_count + 1, comments_count, created_at)
      where id = target_post_id;
    elsif tg_op = 'DELETE' then
      update public.posts
      set
        likes_count = greatest(likes_count - 1, 0),
        trending_score = public.calculate_trending_score_db(greatest(likes_count - 1, 0), comments_count, created_at)
      where id = target_post_id;
    end if;
  elsif tg_table_name = 'comments' then
    if tg_op = 'INSERT' then
      update public.posts
      set
        comments_count = comments_count + 1,
        trending_score = public.calculate_trending_score_db(likes_count, comments_count + 1, created_at)
      where id = target_post_id;
    elsif tg_op = 'DELETE' then
      update public.posts
      set
        comments_count = greatest(comments_count - 1, 0),
        trending_score = public.calculate_trending_score_db(likes_count, greatest(comments_count - 1, 0), created_at)
      where id = target_post_id;
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists likes_refresh_post_metrics on public.likes;
create trigger likes_refresh_post_metrics
after insert or delete on public.likes
for each row execute procedure public.refresh_post_engagement_metrics();

drop trigger if exists comments_refresh_post_metrics on public.comments;
create trigger comments_refresh_post_metrics
after insert or delete on public.comments
for each row execute procedure public.refresh_post_engagement_metrics();

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.collections enable row level security;
alter table public.collection_posts enable row level security;

drop policy if exists "users are publicly readable" on public.users;
create policy "users are publicly readable"
on public.users for select
using (true);

drop policy if exists "users can update self" on public.users;
create policy "users can update self"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "posts are publicly readable" on public.posts;
create policy "posts are publicly readable"
on public.posts for select
using (true);

drop policy if exists "authenticated can create own posts" on public.posts;
create policy "authenticated can create own posts"
on public.posts for insert
with check (auth.uid() = author_id);

drop policy if exists "authors can update own posts" on public.posts;
create policy "authors can update own posts"
on public.posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "likes are publicly readable" on public.likes;
create policy "likes are publicly readable"
on public.likes for select
using (true);

drop policy if exists "users can insert own likes" on public.likes;
create policy "users can insert own likes"
on public.likes for insert
with check (auth.uid() = user_id);

drop policy if exists "users can delete own likes" on public.likes;
create policy "users can delete own likes"
on public.likes for delete
using (auth.uid() = user_id);

drop policy if exists "comments are publicly readable" on public.comments;
create policy "comments are publicly readable"
on public.comments for select
using (true);

drop policy if exists "users can insert own comments" on public.comments;
create policy "users can insert own comments"
on public.comments for insert
with check (auth.uid() = author_id);

drop policy if exists "users can delete own comments" on public.comments;
create policy "users can delete own comments"
on public.comments for delete
using (auth.uid() = author_id);

drop policy if exists "follows are publicly readable" on public.follows;
create policy "follows are publicly readable"
on public.follows for select
using (true);

drop policy if exists "users can insert own follows" on public.follows;
create policy "users can insert own follows"
on public.follows for insert
with check (auth.uid() = follower_id);

drop policy if exists "users can delete own follows" on public.follows;
create policy "users can delete own follows"
on public.follows for delete
using (auth.uid() = follower_id);

drop policy if exists "public collections are readable" on public.collections;
create policy "public collections are readable"
on public.collections for select
using (is_public = true or auth.uid() = owner_id);

drop policy if exists "owners can manage collections" on public.collections;
create policy "owners can manage collections"
on public.collections for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "collection posts follow parent visibility" on public.collection_posts;
create policy "collection posts follow parent visibility"
on public.collection_posts for select
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_posts.collection_id
      and (c.is_public = true or c.owner_id = auth.uid())
  )
);

drop policy if exists "owners can manage collection posts" on public.collection_posts;
create policy "owners can manage collection posts"
on public.collection_posts for all
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_posts.collection_id
      and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_posts.collection_id
      and c.owner_id = auth.uid()
  )
);
