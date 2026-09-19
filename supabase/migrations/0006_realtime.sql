-- ============================================================================
-- JainSpace — 0006_realtime
-- Broadcast inserts to open browsers so the UI updates without a refresh.
--
-- RLS interplay: postgres_changes delivers rows only to clients whose JWT
-- passes the table's SELECT policy.
--   check_ins → authenticated-only policy → pushes reach signed-in users;
--   anonymous visitors stay on the polling fallback (check_ins are
--   deliberately not anon-readable).
--   issues    → anon-readable            → pushes reach everyone.
-- ============================================================================

begin;

do $$ begin
  alter publication supabase_realtime add table public.check_ins;
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.issues;
exception
  when duplicate_object then null;
end $$;

commit;
