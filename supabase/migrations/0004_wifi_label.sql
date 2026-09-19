-- JainSpace — 0004_wifi_label
-- The legacy dataset records wifi quality qualitatively ('Ultra-fast (6GHz)',
-- 'Excellent', 'Good'). Only the first names a frequency band, so `wifi_band`
-- is NULL where the source is silent (10 of 52 rooms). This column preserves
-- the original label verbatim so no source information is lost in the rebuild.

begin;

alter table public.room_infrastructure
  add column if not exists wifi_label_raw text;

comment on column public.room_infrastructure.wifi_label_raw is
  'Qualitative label from the source dataset (Ultra-fast (6GHz) / Excellent / Good). Kept verbatim; wifi_band only carries what the source actually names.';

commit;
