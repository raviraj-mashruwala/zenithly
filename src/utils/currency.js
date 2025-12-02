// Format currency amount with symbol
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Format currency without symbol (just the number)
export const formatAmount = (amount, locale = 'en-IN') => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Parse currency string to number
export const parseCurrency = (currencyString) => {
    if (typeof currencyString === 'number') return currencyString;

    // Remove all non-numeric characters except decimal point and minus sign
    const cleaned = currencyString.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
};

// Get currency symbol
export const getCurrencySymbol = (currency = 'INR', locale = 'en-IN') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    })
        .formatToParts(0)
        .find(part => part.type === 'currency')?.value || currency;
};

// Format compact currency (e.g., 1.5K, 2.3M)
export const formatCompactCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    if (Math.abs(amount) < 1000) {
        return formatCurrency(amount, currency, locale);
    }

    const symbol = getCurrencySymbol(currency, locale);
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 10000000) { // 10M+ -> Crore
        return `${sign}${symbol}${(absAmount / 10000000).toFixed(1)}Cr`;
    } else if (absAmount >= 100000) { // 100K+ -> Lakh
        return `${sign}${symbol}${(absAmount / 100000).toFixed(1)}L`;
    } else if (absAmount >= 1000) { // 1K+
        return `${sign}${symbol}${(absAmount / 1000).toFixed(1)}K`;
    }

    return formatCurrency(amount, currency, locale);
};
