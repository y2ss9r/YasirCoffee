/**
 * Formats a price number with the correct currency symbol.
 * @param {number} price
 * @param {'TRY'|'USD'} currency
 * @returns {string}
 */
export const formatPrice = (price, currency = 'TRY') => {
    const amount = Number(price).toFixed(2);
    return currency === 'USD' ? `$${amount}` : `₺${amount}`;
};
