import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12 antialiased text-ink">
      <Link href="/spaces" className="group mb-6 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-zinc-900">
          ◧
        </span>
        <div>
          <span className="text-base font-bold tracking-tight text-ink">JainSpace</span>
          <p className="text-[10px] text-zinc-400">Campus Reimagined</p>
        </div>
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <p className="mt-6 max-w-xs text-center text-[11px] text-zinc-400">
        Browsing and schedule lookups require no account. Sign in to post check-ins, upvote issues,
        or save spaces.
      </p>
    </div>
  );
}
