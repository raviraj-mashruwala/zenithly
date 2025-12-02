// Currency options for the onboarding wizard
export const CURRENCY_OPTIONS = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
];

// Wallet types
export const WALLET_TYPES = [
    { value: 'Bank', label: 'Bank Account', icon: 'building-2' },
    { value: 'Credit Card', label: 'Credit Card', icon: 'credit-card' },
    { value: 'Cash', label: 'Cash', icon: 'wallet' },
    { value: 'Wallet/UPI', label: 'Digital Wallet / UPI', icon: 'smartphone' },
    { value: 'Investment', label: 'Investment Account', icon: 'trending-up' },
    { value: 'Other', label: 'Other', icon: 'circle' },
];

// Default currency
export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_LOCALE = 'en-IN';
