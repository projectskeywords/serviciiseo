import { sql, ensureTables } from './db';
import crypto from 'crypto';

export async function createSession(): Promise<string> {
  await ensureTables();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await sql`
    INSERT INTO admin_sessions (token, expires_at)
    VALUES (${token}, ${expiresAt})
  `;

  return token;
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false;
  await ensureTables();

  const rows = await sql`
    SELECT token FROM admin_sessions
    WHERE token = ${token}
      AND expires_at > NOW()
  `;

  return rows.length > 0;
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
}

export async function cleanExpiredSessions(): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE expires_at <= NOW()`;
}
