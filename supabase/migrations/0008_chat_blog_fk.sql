-- Link chat messages to blog posts.
-- When a post is deleted, its chat messages stay but lose the FK reference.

alter table public.chat_messages
  add column blog_post_id uuid references public.blog_posts(id) on delete set null;

create index chat_messages_blog_post_idx
  on public.chat_messages (blog_post_id)
  where blog_post_id is not null;
