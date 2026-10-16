import { CardPaymentDetails } from '../types';

/**
 * Fields that may be stored for a subscription checkout.
 * Full card numbers and security codes are never kept.
 */
export function safeCardRecord(
  input?: Partial<CardPaymentDetails> | null
): CardPaymentDetails | undefined {
  if (!input) return undefined;

  const last4 = String(input.last4 || '').replace(/\D/g, '').slice(-4);
  const brand = String(input.brand || 'Card').trim().slice(0, 32);
  const cardholderName = String(input.cardholderName || '').trim().slice(0, 120);
  const expMonth = input.expMonth
    ? String(input.expMonth).replace(/\D/g, '').slice(0, 2)
    : undefined;
  const expYear = input.expYear
    ? String(input.expYear).replace(/\D/g, '').slice(0, 4)
    : undefined;
  const transactionId = String(input.transactionId || '').trim().slice(0, 64);

  if (!last4 && !cardholderName && !transactionId) return undefined;

  return {
    brand: brand || 'Card',
    last4,
    cardholderName,
    expMonth,
    expYear,
    transactionId,
  };
}
