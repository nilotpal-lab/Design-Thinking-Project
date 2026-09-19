import { ArrowBigUp, Flag } from 'lucide-react';
import Link from 'next/link';

import { NewIssueForm } from '@/components/reports/new-issue-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIssueBoard, upvoteIssueForm } from '@/server/actions/issues';
import { getLiveRooms } from '@/server/queries/rooms';
import { roomHref, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campus Facility Reports' };

const URGENCY_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
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
    <div className="space-y-6">
      {/* Editorial Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Campus Issue Board
          </h1>
          <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            Crowdsourced
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Broken power sockets, malfunctioning ACs, and Wi-Fi issues reported by students and resolved by facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Sticky Report Form */}
        <div className="h-fit rounded-xl border border-line bg-surface p-4 shadow-sm lg:sticky lg:top-20 dark:border-white/[0.08] dark:bg-[#111113]">
          <div className="mb-3.5 flex items-center gap-2 border-b border-line/60 pb-2.5 dark:border-white/[0.06]">
            <Flag className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-ink">File a New Report</h2>
          </div>
          <NewIssueForm
            rooms={rooms.map((r) => ({ id: r.room_id, code: r.code, name: r.name }))}
          />
        </div>

        {/* Public Board */}
        <section aria-label="Issue board" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Active Issues ({board.length})</h2>
            <span className="font-mono text-[11px] text-zinc-400">
              Live Feed
            </span>
          </div>

          {board.length === 0 && (
            <div className="rounded-xl border border-dashed border-line p-8 text-center dark:border-white/[0.08]">
              <p className="text-sm font-semibold text-ink">All facilities in working order</p>
              <p className="mt-1 text-xs text-zinc-400">
                No active issues reported right now.
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            {board.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border border-line bg-surface p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"
              >
                <div className="flex items-start gap-3.5">
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
                        'flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 transition-all duration-instant active:scale-95 ' +
                        (issue.voted_by_me
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'border border-line bg-surface text-zinc-500 hover:text-ink dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-400 dark:hover:text-white')
                      }
                    >
                      <ArrowBigUp className="h-5 w-5" aria-hidden />
                      <span className="font-mono text-xs font-bold">{issue.vote_count}</span>
                    </button>
                  </form>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-ink">
                        {issue.ref}
                      </span>
                      <span className="rounded bg-surface-sunken px-1.5 py-0.2 font-mono text-[10px] uppercase text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                        {issue.urgency}
                      </span>
                      <span className="rounded bg-surface-sunken px-1.5 py-0.2 font-mono text-[10px] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                        {STATUS_LABEL[issue.status as keyof typeof STATUS_LABEL] ?? issue.status}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        · {timeAgo(issue.created_at)}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-bold text-ink">
                      {issue.room_code && (
                        <Link
                          href={roomHref(issue.room_slug ?? '')}
                          className="mr-1.5 font-mono text-xs font-bold text-ink hover:underline dark:text-white"
                        >
                          {issue.room_code}
                        </Link>
                      )}
                      {issue.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {issue.description}
                    </p>
                    <p className="mt-2 text-[10px] text-zinc-400">
                      Reported by {issue.reporter_name ? issue.reporter_name : 'Student'} · Category: {issue.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
