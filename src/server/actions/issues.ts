'use server';

import { revalidatePath } from 'next/cache';

import { newIssueSchema, voteIssueSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/server/actions/checkins';

/**
 * Report a maintenance issue. The `issues_audit` trigger writes the 'created'
 * event and `karma_on_issue` awards +25 server-side — the client can neither
 * skip nor fake either.
 */
export async function createIssue(formData: FormData): Promise<ActionResult> {
  const parsed = newIssueSchema.safeParse({
    room_id: formData.get('room_id'),
    category: formData.get('category'),
    title: formData.get('title'),
    description: formData.get('description'),
    urgency: formData.get('urgency') ?? 'medium',
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid report' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sign in to report an issue.', code: 'auth' };
  }

  const { data, error } = await supabase
    .from('issues')
    .insert({ ...parsed.data, reported_by: user.id })
    .select('ref')
    .single();

  if (error) return { ok: false, error: `Could not file the report (${error.code ?? 'unknown'})` };

  revalidatePath('/report');
  revalidatePath('/spaces');
  return { ok: true, ...(data?.ref ? { ref: data.ref } : {}) };
}

export async function upvoteIssue(formData: FormData): Promise<ActionResult> {
  const parsed = voteIssueSchema.safeParse({ issue_id: formData.get('issue_id') });
  if (!parsed.success) return { ok: false, error: 'Invalid issue reference' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in to upvote.', code: 'auth' };

  // Toggle semantics: second click withdraws the vote (RLS allows deleting
  // only one's own row).
  const { data: existing } = await supabase
    .from('issue_votes')
    .select('issue_id')
    .eq('issue_id', parsed.data.issue_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('issue_votes')
      .delete()
      .eq('issue_id', parsed.data.issue_id)
      .eq('user_id', user.id);
    if (error) return { ok: false, error: 'Could not withdraw vote.' };
    revalidatePath('/report');
    return { ok: true };
  }

  const { error } = await supabase
    .from('issue_votes')
    .insert({ issue_id: parsed.data.issue_id, user_id: user.id });

  if (error) return { ok: false, error: 'Could not upvote — try again.' };
  revalidatePath('/report');
  return { ok: true };
}

/**
 * Void wrapper for `<form action={…}>` (no-JS upvoting). React's form action
 * contract is `void | Promise<void>`; the result-returning variant is for
 * client components that render errors inline.
 */
export async function upvoteIssueForm(formData: FormData): Promise<void> {
  await upvoteIssue(formData);
}

export type IssueBoardItem = {
  id: string;
  ref: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  created_at: string;
  room_code: string | null;
  room_slug: string | null;
  vote_count: number;
  reporter_name: string | null;
  voted_by_me: boolean;
};

/** Public board: open + recently-resolved issues with vote counts. */
export async function getIssueBoard(limit = 30): Promise<IssueBoardItem[]> {
  const supabase = await createClient();

  const { data: issues, error } = await supabase
    .from('issues')
    .select(
      `id, ref, title, description, category, urgency, status, created_at,
       rooms ( code, slug ),
       v_public_profiles ( full_name ),
       issue_votes ( user_id )`,
    )
    .in('status', ['open', 'acknowledged', 'assigned', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Issue board query failed: ${error.message}`);

  const { data: { user } } = await supabase.auth.getUser();

  return (issues ?? []).map((i) => {
    type Joined = {
      id: string; ref: string; title: string; description: string;
      category: string; urgency: string; status: string; created_at: string;
      rooms: { code: string | null; slug: string | null } | null;
      v_public_profiles: { full_name: string | null } | null;
      issue_votes: { user_id: string }[];
    };
    const row = i as unknown as Joined;
    return {
      id: row.id,
      ref: row.ref,
      title: row.title,
      description: row.description,
      category: row.category,
      urgency: row.urgency,
      status: row.status,
      created_at: row.created_at,
      room_code: row.rooms?.code ?? null,
      room_slug: row.rooms?.slug ?? null,
      vote_count: row.issue_votes?.length ?? 0,
      reporter_name: row.v_public_profiles?.full_name ?? null,
      voted_by_me: user ? row.issue_votes.some((v) => v.user_id === user.id) : false,
    };
  });
}
