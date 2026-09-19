import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/spaces" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-accent text-base font-semibold text-white">
          ◧
        </span>
        <span className="text-lg font-semibold tracking-[-0.01em]">JainSpace</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 max-w-xs text-center text-micro text-ink-tertiary">
        Browsing needs no account. Sign in only to check in, report issues or save favourites.
      </p>
    </div>
  );
}
