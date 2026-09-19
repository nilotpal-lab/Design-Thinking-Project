import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      title={name}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        'bg-accent-subtle text-accent text-micro font-semibold select-none',
        'dark:text-[#a5b4fc]',
        className,
      )}
      {...props}
    >
      {initials(name) || '?'}
    </span>
  );
});
