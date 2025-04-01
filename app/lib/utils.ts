/**
 * Format a number as currency
 * @param amount The amount to format
 * @param abbreviated Whether to show an abbreviated format
 * @returns The formatted currency string
 */
export const formatCurrency = (amount: number, abbreviated: boolean | string = false): string => {
  // Handle undefined, null, or NaN inputs
  if (amount === undefined || amount === null || isNaN(amount)) {
    return abbreviated ? '$0' : '$0.00';
  }
  
  if (abbreviated) {
    if (amount === 0) return '$0';
    if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toFixed(0)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}; 