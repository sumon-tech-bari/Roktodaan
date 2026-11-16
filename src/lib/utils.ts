import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(isoDate: string, lang: 'en' | 'bn'): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) {
    return lang === 'bn' ? `${diffMinutes} মি. আগে` : `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return lang === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return lang === 'bn' ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
}

export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 5)}••••${phone.slice(-3)}`;
}
