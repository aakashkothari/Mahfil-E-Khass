create index if not exists likes_post_idx on public.likes (post_id);

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
