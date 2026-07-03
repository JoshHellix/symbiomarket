-- Prevent duplicate content URL claims (RFB6 registry integrity)
create unique index if not exists symbio_creators_feed_url_unique
  on public.symbio_creators (feed_url);
