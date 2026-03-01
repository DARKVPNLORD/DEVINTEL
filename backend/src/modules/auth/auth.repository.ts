import { query, queryOne } from '../../config/database';
import { User, OAuthAccount, RefreshToken } from './auth.types';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE username = $1', [username]);
  }

  async findUserById(id: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
  }

  async createUser(data: {
    email: string;
    username: string;
    password_hash?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    is_email_verified?: boolean;
  }): Promise<User> {
    const result = await queryOne<User>(
      `INSERT INTO users (email, username, password_hash, display_name, avatar_url, bio, location, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.email,
        data.username,
        data.password_hash ?? null,
        data.display_name ?? null,
        data.avatar_url ?? null,
        data.bio ?? null,
        data.location ?? null,
        data.is_email_verified ?? false,
      ]
    );
    return result!;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
  }

  // OAuth
  async findOAuthAccount(provider: string, providerUserId: string): Promise<OAuthAccount | null> {
    return queryOne<OAuthAccount>(
      'SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2',
      [provider, providerUserId]
    );
  }

  async findOAuthByUserId(userId: string, provider: string): Promise<OAuthAccount | null> {
    return queryOne<OAuthAccount>(
      'SELECT * FROM oauth_accounts WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );
  }

  async createOAuthAccount(data: {
    user_id: string;
    provider: string;
    provider_user_id: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: Date;
    provider_username?: string;
    provider_email?: string;
    provider_avatar_url?: string;
    raw_profile?: Record<string, any>;
  }): Promise<OAuthAccount> {
    const result = await queryOne<OAuthAccount>(
      `INSERT INTO oauth_accounts (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at, provider_username, provider_email, provider_avatar_url, raw_profile)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.user_id,
        data.provider,
        data.provider_user_id,
        data.access_token,
        data.refresh_token ?? null,
        data.token_expires_at ?? null,
        data.provider_username ?? null,
        data.provider_email ?? null,
        data.provider_avatar_url ?? null,
        JSON.stringify(data.raw_profile ?? {}),
      ]
    );
    return result!;
  }

  async updateOAuthToken(id: string, accessToken: string): Promise<void> {
    await query('UPDATE oauth_accounts SET access_token = $1, updated_at = NOW() WHERE id = $2', [accessToken, id]);
  }

  // Refresh Tokens
  async createRefreshToken(data: {
    user_id: string;
    token_hash: string;
    device_info?: string;
    ip_address?: string;
    expires_at: Date;
  }): Promise<RefreshToken> {
    const result = await queryOne<RefreshToken>(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.user_id, data.token_hash, data.device_info ?? null, data.ip_address ?? null, data.expires_at]
    );
    return result!;
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return queryOne<RefreshToken>(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
      [tokenHash]
    );
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
  }
}
