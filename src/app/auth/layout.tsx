import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12 antialiased ambient-glow">
      <Link href="/spaces" className="group mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-indigo-500 text-lg font-bold text-white shadow-glow-accent transition-transform duration-fast ease-spring group-hover:scale-105 active:scale-95">
          ◧
        </span>
        <div>
          <span className="text-xl font-black tracking-tight text-ink">JainSpace</span>
          <p className="text-[11px] font-semibold text-ink-tertiary">Campus Space Reimagined</p>
        </div>
      </Link>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 max-w-xs text-center text-micro text-ink-tertiary">
        Browsing and schedule lookups require no account. Sign in to post check-ins, upvote issues,
        or save spaces.
      </p>
    </div>
  );
}
