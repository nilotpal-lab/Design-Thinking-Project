'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

/**
 * Live layer. Two mechanisms, one component:
 *
 * 1. Realtime — postgres_changes INSERTs on check_ins/issues trigger a
 *    debounced router.refresh(), so open pages re-render with fresh server
 *    data within a few hundred ms. check_ins pushes reach signed-in users
 *    (the table is deliberately not anon-readable); issues reach everyone.
 *
 * 2. Polling fallback — a visibility-aware 45s timer covers anonymous
 *    visitors (who receive no check_ins pushes) and missed events.
 *    refresh() is cheap: only changed server components re-render.
 */
export function LiveRefresher({ signedIn = false }: { signedIn?: boolean }) {
  const router = useRouter();
  const refreshRef = useRef<() => void>(() => {});
  refreshRef.current = () => router.refresh();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;

    const scheduleRefresh = () => {
      if (timer) return; // debounce bursts (e.g. seed inserts)
      timer = setTimeout(() => {
        timer = null;
        refreshRef.current();
      }, 400);
    };

    const supabase = createClient();

    const checkIns = supabase
      .channel('checkins-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'check_ins' },
        scheduleRefresh,
      )
      .subscribe();

    const issues = supabase
      .channel('issues-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issues' },
        scheduleRefresh,
      )
      .subscribe();

    // Polling fallback only when the tab is actually visible.
    const startPoll = () => {
      if (poll || document.visibilityState !== 'visible') return;
      poll = setInterval(() => refreshRef.current(), 45_000);
    };
    const stopPoll = () => {
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
    };
    const onVisibility = () => (document.visibilityState === 'visible' ? startPoll() : stopPoll());

    if (!signedIn) startPoll();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stopPoll();
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(checkIns);
      void supabase.removeChannel(issues);
    };
  }, [signedIn]);

  return null;
}
