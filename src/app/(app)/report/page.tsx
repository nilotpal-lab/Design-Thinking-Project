import { ArrowBigUp, Flag } from 'lucide-react';

import { NewIssueForm } from '@/components/reports/new-issue-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIssueBoard, upvoteIssueForm } from '@/server/actions/issues';
import { getLiveRooms } from '@/server/queries/rooms';
import { roomHref, timeAgo } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const URGENCY_VARIANT = {
  low: 'neutral',
  medium: 'soon',
  high: 'busy',
  critical: 'busy',
} as const;

const STATUS_LABEL = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  assigned: 'Assigned',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
} as const;

export default async function ReportPage() {
  const [rooms, board] = await Promise.all([getLiveRooms(), getIssueBoard()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]">Reports</h1>
        <p className="mt-0.5 text-[13px] text-ink-secondary">
          Broken sockets, dead ACs, missing chairs — filed, tracked, resolved in the open.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-4 w-4" aria-hidden /> File a new report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewIssueForm
              rooms={rooms.map((r) => ({ id: r.room_id, code: r.code, name: r.name }))}
            />
          </CardContent>
        </Card>

        <section aria-label="Issue board" className="space-y-3">
          <h2 className="text-[15px] font-semibold">The board ({board.length} open)</h2>

          {board.length === 0 && (
            <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
              <p className="text-[15px] font-medium">Nothing broken right now</p>
              <p className="mt-1 text-[13px] text-ink-secondary">
                When something in a room stops working, file it here — the board is public and
                facilities-trackable.
              </p>
            </div>
          )}

          {board.map((issue) => (
            <Card key={issue.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Upvote: a plain form + Server Action — works without JS */}
                <form action={upvoteIssueForm}>
                  <input type="hidden" name="issue_id" value={issue.id} />
                  <button
                    type="submit"
                    aria-label={
                      issue.voted_by_me
                        ? 'Withdraw your upvote'
                        : `Upvote issue ${issue.ref} (${issue.vote_count} votes)`
                    }
                    aria-pressed={issue.voted_by_me}
                    className={
                      'flex flex-col items-center rounded px-2 py-1 transition-colors duration-instant ' +
                      (issue.voted_by_me
                        ? 'bg-accent-subtle text-accent'
                        : 'text-ink-tertiary hover:bg-surface-sunken hover:text-ink')
                    }
                  >
                    <ArrowBigUp className="h-5 w-5" aria-hidden />
                    <span className="font-mono-tabular text-[12px] font-semibold">{issue.vote_count}</span>
                  </button>
                </form>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12px] text-ink-tertiary">{issue.ref}</span>
                    <Badge variant={URGENCY_VARIANT[issue.urgency as keyof typeof URGENCY_VARIANT] ?? 'neutral'}>
                      {issue.urgency}
                    </Badge>
                    <Badge variant="neutral">{STATUS_LABEL[issue.status as keyof typeof STATUS_LABEL] ?? issue.status}</Badge>
                    <span className="text-micro text-ink-tertiary">{timeAgo(issue.created_at)}</span>
                  </div>

                  <h3 className="mt-1 text-[15px] font-semibold leading-6">
                    {issue.room_code && (
                      <Link href={roomHref(issue.room_slug ?? '')} className="font-mono text-[13px] text-accent hover:underline">
                        {issue.room_code}
                      </Link>
                    )}{' '}
                    {issue.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-secondary">
                    {issue.description}
                  </p>
                  <p className="mt-1.5 text-micro text-ink-tertiary">
                    {issue.reporter_name ? `by ${issue.reporter_name}` : 'anonymous'} · {issue.category}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
