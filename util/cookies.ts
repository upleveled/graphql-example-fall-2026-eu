import { cookies } from 'next/headers';

export const secureCookieOptions = {
  // Cookie accessible only by server, not browser JavaScript
  httpOnly: true,
  // Instruct browser to delete cookie after 24 hours, matching session expiry
  maxAge: 60 * 60 * 24,
  // Instruct browser to send cookie with requests to all paths
  path: '/',
  // Prevent browser from sending cookie when another website loads your page as image or frame
  sameSite: 'lax',
  // Prevent browser from sending cookie over HTTP in production
  secure: process.env.NODE_ENV === 'production',
} as const;

export async function getCookie(name: string) {
  return (await cookies()).get(name)?.value;
}
