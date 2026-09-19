import { ArrowBigUp, Flag, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { NewIssueForm } from '@/components/reports/new-issue-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIssueBoard, upvoteIssueForm } from '@/server/actions/issues';
import { getLiveRooms } from '@/server/queries/rooms';
import { roomHref, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campus Facility Reports' };

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
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Crowdsourced Facilities</span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
          Campus Issue Board
        </h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Broken power sockets, malfunctioning ACs, or Wi-Fi dead zones — reported by students,
          upvoted by the community, fixed by facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[400px_1fr]">
        {/* Sticky Report Form */}
        <Card className="h-fit rounded-3xl p-6 shadow-e2 lg:sticky lg:top-24 dark:border-white/10 dark:bg-[#121215]">
          <div className="mb-4 flex items-center gap-2 border-b border-line/60 pb-3 dark:border-white/[0.06]">
            <Flag className="h-5 w-5 text-accent" />
            <h2 className="text-base font-bold text-ink">File a New Report</h2>
          </div>
          <NewIssueForm
            rooms={rooms.map((r) => ({ id: r.room_id, code: r.code, name: r.name }))}
          />
        </Card>

        {/* Public Board */}
        <section aria-label="Issue board" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Active Issues ({board.length})</h2>
            <span className="text-micro font-semibold uppercase tracking-wider text-ink-tertiary">
              Live Feed
            </span>
          </div>

          {board.length === 0 && (
            <Card className="rounded-3xl border-dashed p-10 text-center">
              <p className="text-[15px] font-semibold text-ink">All facilities in working order</p>
              <p className="mt-1 text-[13px] text-ink-secondary">
                No active issues reported right now. When something needs repair, file it to notify
                the facilities team.
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {board.map((issue) => (
              <Card
                key={issue.id}
                className="rounded-2xl p-5 shadow-e1 transition-all duration-base hover:border-accent/40 hover:shadow-e2 dark:border-white/10"
              >
                <div className="flex items-start gap-4">
                  {/* Upvote Button with Tactile Physics */}
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
                        'flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-instant ease-spring active:scale-90 ' +
                        (issue.voted_by_me
                          ? 'bg-accent text-white shadow-sm shadow-accent/20'
                          : 'border border-line/80 bg-surface text-ink-secondary hover:border-line-strong hover:bg-surface-sunken hover:text-ink dark:border-white/10')
                      }
                    >
                      <ArrowBigUp className="h-6 w-6" aria-hidden />
                      <span className="font-mono text-xs font-bold">{issue.vote_count}</span>
                    </button>
                  </form>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12px] font-bold text-accent dark:text-accent-hover">
                        {issue.ref}
                      </span>
                      <Badge variant={URGENCY_VARIANT[issue.urgency as keyof typeof URGENCY_VARIANT] ?? 'neutral'}>
                        {issue.urgency}
                      </Badge>
                      <Badge variant="neutral">
                        {STATUS_LABEL[issue.status as keyof typeof STATUS_LABEL] ?? issue.status}
                      </Badge>
                      <span className="font-mono text-micro text-ink-tertiary">
                        {timeAgo(issue.created_at)}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-base font-bold text-ink">
                      {issue.room_code && (
                        <Link
                          href={roomHref(issue.room_slug ?? '')}
                          className="mr-2 font-mono text-[13px] font-bold text-accent hover:underline dark:text-accent-hover"
                        >
                          {issue.room_code}
                        </Link>
                      )}
                      {issue.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-secondary">
                      {issue.description}
                    </p>
                    <p className="mt-2 text-micro text-ink-tertiary">
                      Reported by {issue.reporter_name ? issue.reporter_name : 'Student'} · Category: {issue.category}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
