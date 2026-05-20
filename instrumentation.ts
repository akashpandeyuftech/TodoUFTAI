/**
 * Runs once per server process startup. Surfaces misconfiguration early in logs.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const jwt = process.env.JWT_SECRET;
  if (!jwt || jwt.length < 32) {
    console.error(
      "[uftech-tasks] JWT_SECRET is missing or shorter than 32 characters. Auth will not work for protected routes."
    );
  }

  if (!process.env.DATABASE_URL) {
    console.error("[uftech-tasks] DATABASE_URL is not set. Database access will fail.");
  }
}
