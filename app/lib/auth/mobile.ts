import { verifyToken } from "./jwt";
import type { JWTPayload } from "./jwt";

export async function getMobileUser(request: Request): Promise<JWTPayload | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return verifyToken(token);
}
