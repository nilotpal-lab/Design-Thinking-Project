/**
 * Username-only auth mapping.
 *
 * Supabase auth fundamentally requires an email/phone identifier, so usernames
 * map to a synthetic `<username>@jainspace.local` address. Users only ever see
 * and type their username — the synthetic domain never reaches the UI.
 */
export const AUTH_EMAIL_DOMAIN = 'jainspace.local';

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

/** Reverse map for display: strips the synthetic domain. Returns null if not synthetic. */
export function emailToUsername(email: string | null | undefined): string | null {
  if (!email) return null;
  const suffix = `@${AUTH_EMAIL_DOMAIN}`;
  return email.toLowerCase().endsWith(suffix) ? email.slice(0, -suffix.length) : null;
}

export const usernameSchema = /^[a-z0-9._-]{3,24}$/;
