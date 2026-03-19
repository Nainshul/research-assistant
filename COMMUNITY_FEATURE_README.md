# Community Feature — Re-adding Guide

This document describes how to re-add the community/forum feature that was removed from Crop-Doc.

## What Was Removed

| File | Purpose |
|------|---------|
| `src/pages/CommunityPage.tsx` | Main forum page with post listing, search, create post |
| `src/hooks/useForum.ts` | Hook for CRUD on posts/comments/likes + Supabase Realtime |
| `src/components/forum/PostCard.tsx` | Card component displaying a single post |
| `src/components/forum/CreatePostDialog.tsx` | Dialog for creating new posts (with optional image) |
| `src/components/forum/EditPostDialog.tsx` | Dialog for editing existing posts |
| `src/components/forum/CommentSection.tsx` | Comment thread under a post |

## Database Tables Needed

Run this SQL in your Supabase SQL Editor:

```sql
-- POSTS TABLE
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  image_url text,
  crop_type text,
  author_name text,
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Anyone can read posts" on public.posts for select using (true);
create policy "Authenticated users can create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

-- COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  author_name text,
  is_expert_answer boolean default false,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Authenticated users can create comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- LIKES TABLE
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Anyone can read likes" on public.likes for select using (true);
create policy "Authenticated users can create likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes" on public.likes for delete using (auth.uid() = user_id);

-- ENABLE REALTIME
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
```

## Re-integration Steps

1. **Recreate the files** listed above (or check git history to restore them)
2. **Run the SQL** above in Supabase
3. **Re-add the route** in `App.tsx`:
   ```tsx
   import CommunityPage from "./pages/CommunityPage";
   // Inside <Routes>:
   <Route path="/community" element={
     <RequireVerifiedEmail><CommunityPage /></RequireVerifiedEmail>
   } />
   ```
4. **Re-add BottomNav item** in `BottomNav.tsx`:
   ```tsx
   { icon: MessageCircle, label: 'Community', path: '/community' },
   ```
5. **Re-add "My Posts" tab** in `ProfilePage.tsx` (import `useForum`, `PostCard`, `Tabs`)
6. **Re-add community card** on homepage `Index.tsx`

## Key Dependencies

- `@supabase/supabase-js` (already installed)
- `sonner` for toast notifications
- `@tanstack/react-query` for data fetching
- `framer-motion` for animations
