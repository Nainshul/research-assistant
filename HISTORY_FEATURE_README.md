# Restore Scan History Feature

If you want to bring back the Scan History feature in the future, follow these steps:

## 1. Database (Supabase)
Ensure the `scans` table exists with all necessary columns (including the remedy columns):

```sql
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
```

## 2. Restore Page & Routes
- Restore `src/pages/HistoryPage.tsx` from git history or backups.
- In `src/App.tsx`, add the route back:
  ```tsx
  <Route path="/history" element={<RequireVerifiedEmail><HistoryPage /></RequireVerifiedEmail>} />
  ```

## 3. Restore Navigation
- In `src/components/layout/BottomNav.tsx`, add the history item back to `navItems` if desired, or link to it from the Profile page.
- In `src/pages/ProfilePage.tsx`, restore the "Scan History" button and statistics.

## 4. Restore Saving Logic
- In `src/pages/ScanPage.tsx`, restore the `handleSaveToCloud` function and the "Save to History" button in the `result` state.
