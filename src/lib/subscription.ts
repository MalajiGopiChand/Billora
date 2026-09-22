import type { Timestamp } from 'firebase/firestore';
import type { Subscription, SubscriptionPlan } from '@/types';

export const PLAN_MONTHS: Record<Extract<SubscriptionPlan, 'monthly' | 'half_yearly' | 'yearly'>, number> = {
  monthly: 1,
  half_yearly: 6,
  yearly: 12,
};

export function toDate(value: Timestamp | Date | { seconds: number } | string | number | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addMonths(start: Date, months: number) {
  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + months);
  return expiry;
}

export function planMonths(planId: string) {
  if (planId === 'monthly' || planId === 'half_yearly' || planId === 'yearly') {
    return PLAN_MONTHS[planId];
  }
  const match = planId.match(/(\d+)\s*m/i);
  if (match) return Number(match[1]);
  return 1;
}

export function isSubscriptionCurrentlyActive(subscription: Subscription | null | undefined, now = new Date()) {
  if (!subscription || subscription.status === 'cancelled') return false;
  const expiresAt = toDate(subscription.expiresAt);
  return Boolean(expiresAt && expiresAt.getTime() > now.getTime());
}

export function computeRenewalExpiry(currentExpiresAt: Date | null | undefined, months: number, now = new Date()) {
  const base = currentExpiresAt && currentExpiresAt.getTime() > now.getTime() ? currentExpiresAt : now;
  return addMonths(base, months);
}

export function formatPlanDate(value: Timestamp | Date | { seconds: number } | null | undefined) {
  const date = toDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
