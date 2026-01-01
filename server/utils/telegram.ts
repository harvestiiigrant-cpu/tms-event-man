import * as crypto from 'crypto';

/**
 * Validates Telegram WebApp initData signature
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-from-the-web-app
 */
export function validateInitData(
  initData: string,
  botToken: string
): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    return false;
  }

  // Remove hash from params
  params.delete('hash');

  // Sort parameters alphabetically
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataToCheck = entries.map(([key, value]) => `${key}=${value}`).join('\n');

  // Create HMAC-SHA256 hash
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataToCheck).digest('hex');

  // Compare hashes
  return calculatedHash === hash;
}

/**
 * Parses Telegram WebApp initData and extracts user information
 */
export function parseInitData(initData: string): TelegramUserData | null {
  try {
    const params = new URLSearchParams(initData);

    const userStr = params.get('user');
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr) as TelegramUser;

    return {
      telegram_id: user.id,
      username: user.username || undefined,
      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      language_code: user.language_code || undefined,
    };
  } catch (error) {
    console.error('Error parsing Telegram init data:', error);
    return null;
  }
}

/**
 * Telegram WebApp User Object
 */
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

/**
 * Extracted user data from initData
 */
export interface TelegramUserData {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}
