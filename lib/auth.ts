import db from './db';
import crypto from 'crypto';

export function createSession(): string {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)
  `).run(token, expiresAt);

  return token;
}

export function validateSession(token: string): boolean {
  if (!token) return false;

  const row = db.prepare(`
    SELECT token FROM admin_sessions
    WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
  `).get(token) as { token: string } | undefined;

  return !!row;
}

export function deleteSession(token: string): void {
  db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token);
}

export function cleanExpiredSessions(): void {
  db.prepare(`DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP`).run();
}
