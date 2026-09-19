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
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full select-none',
        'bg-gradient-to-tr from-accent/20 to-accent/10 text-accent text-micro font-bold',
        'ring-1 ring-inset ring-accent/30 dark:text-accent-hover',
        className,
      )}
      {...props}
    >
      {initials(name) || '?'}
    </span>
  );
});
