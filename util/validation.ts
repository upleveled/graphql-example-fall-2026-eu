import type { Route } from 'next';
import z from 'zod';

export function getCombinedErrorMessage(issues: z.core.$ZodIssue[]) {
  return issues.map((issue) => issue.message).join(', ');
}

const returnToSchema = z.string().refine((value) => {
  return (
    !value.startsWith('/login') &&
    !value.startsWith('/logout') &&
    !value.startsWith('/register') &&
    !value.startsWith('//') &&
    !value.includes('returnTo=') &&
    // Regular expression for valid returnTo path:
    // - starts with a slash
    // - until the end of the string, 1 or more:
    //   - numbers
    //   - hash symbols
    //   - forward slashes
    //   - equals signs
    //   - question marks
    //   - lowercase letters
    //   - dashes
    /^\/[\d#/=?a-z-]+$/.test(value)
  );
});

export function getSafeReturnToPath(path: string | string[] | undefined) {
  const result = returnToSchema.safeParse(path);
  if (!result.success) {
    return undefined;
  }
  return result.data as Route;
}
