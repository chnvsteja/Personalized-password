
import { BreachInfo } from '../types';

async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

export async function checkPwnedPassword(password: string): Promise<BreachInfo> {
  if (!password) {
    return { isPwned: false, count: 0 };
  }

  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from Pwned Passwords API');
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return { isPwned: true, count: parseInt(count, 10) };
      }
    }

    return { isPwned: false, count: 0 };
  } catch (error) {
    console.error('Error checking pwned password:', error);
    return { isPwned: false, count: 0 };
  }
}
