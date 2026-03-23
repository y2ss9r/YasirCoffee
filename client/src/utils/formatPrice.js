/**
 * Formats a price number with the correct currency symbol.
 * @param {number} price
 * @param {'USD'|'TRY'} currency
 * @returns {string}
 */
export const formatPrice = (price, currency = 'USD') => {
    const amount = Number(price).toFixed(2);
    return currency === 'TRY' ? `₺${amount}` : `$${amount}`;
};
