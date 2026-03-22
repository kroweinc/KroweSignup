# Supabase migrations

Apply SQL files in order using the **Supabase Dashboard → SQL Editor**, or the [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase db push` / linked project).

| File | Description |
|------|-------------|
| [migrations/001_curriculum.sql](migrations/001_curriculum.sql) | `signup_curricula` + `signup_roadmap_progress` tables, triggers, RLS |
| [migrations/002_curriculum_processing_status.sql](migrations/002_curriculum_processing_status.sql) | Adds `processing` to `signup_curricula.status` (Plan B) |

Run **`002_curriculum_processing_status.sql`** after `001` so curriculum rows can use `status = 'processing'` while generation runs.

## Manual verification (after `001_curriculum.sql`)

1. **Confirm tables exist**  
   In SQL Editor:  
   `select table_name from information_schema.tables where table_schema = 'public' and table_name in ('signup_curricula','signup_roadmap_progress');`

2. **Use a real session id**  
   `select id from public.signup_sessions order by created_at desc limit 1;`  
   Copy the `id` as `YOUR_SESSION_ID`.

3. **Insert a minimal curriculum row** (replace `YOUR_SESSION_ID`; `curriculum_version` should match [`lib/curriculum/constants.ts`](../lib/curriculum/constants.ts) — currently `1.0.0`):

```sql
insert into public.signup_curricula (session_id, status, curriculum_version, payload)
values (
  'YOUR_SESSION_ID'::uuid,
  'pending',
  '1.0.0',
  null
);
```

A valid v1 `payload` must satisfy `curriculumPayloadSchema` in [`lib/curriculum/schema.ts`](../lib/curriculum/schema.ts) (six stages, etc.). Use `pending` + `payload = null` for a quick connectivity test; after Plan B you can store a full `ready` payload.

4. **Read it back**

```sql
select id, session_id, status, curriculum_version, payload
from public.signup_curricula
where session_id = 'YOUR_SESSION_ID'::uuid;
```

5. **Roadmap progress default**  
   Insert a progress row and check default `unlocked_stage_max = 1`:

```sql
insert into public.signup_roadmap_progress (session_id)
values ('YOUR_SESSION_ID'::uuid)
on conflict (session_id) do nothing;

select session_id, unlocked_stage_max, completed_task_ids
from public.signup_roadmap_progress
where session_id = 'YOUR_SESSION_ID'::uuid;
```

Expect `unlocked_stage_max` = **1** and `completed_task_ids` = **`[]`**.

6. **Cleanup (optional)**

```sql
delete from public.signup_curricula where session_id = 'YOUR_SESSION_ID'::uuid;
delete from public.signup_roadmap_progress where session_id = 'YOUR_SESSION_ID'::uuid;
```

## Writes in Plan B (next)

API routes that insert/update curriculum should use the same Supabase client pattern as today (`createServerSupabaseClient` with the **anon** key) until you switch to a **service role** client for server-only writes. Service role bypasses RLS; anon relies on the permissive policies in `001_curriculum.sql`.
