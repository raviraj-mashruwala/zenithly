// Curated finance-related icons from Lucide React
// Organized by category for easy selection

export const FINANCE_ICONS = {
    wallets: [
        { id: 'wallet', name: 'Wallet' },
        { id: 'credit-card', name: 'Credit Card' },
        { id: 'building-2', name: 'Bank' },
        { id: 'banknote', name: 'Cash' },
        { id: 'smartphone', name: 'Digital Wallet' },
        { id: 'landmark', name: 'Institution' },
        { id: 'piggy-bank', name: 'Savings' },
        { id: 'coins', name: 'Coins' },
    ],

    expenses: [
        { id: 'shopping-cart', name: 'Shopping Cart' },
        { id: 'shopping-bag', name: 'Shopping Bag' },
        { id: 'shopping-basket', name: 'Groceries' },
        { id: 'utensils', name: 'Food & Dining' },
        { id: 'coffee', name: 'Coffee' },
        { id: 'car', name: 'Car' },
        { id: 'bus', name: 'Bus' },
        { id: 'train', name: 'Train' },
        { id: 'plane', name: 'Travel' },
        { id: 'home', name: 'Home' },
        { id: 'zap', name: 'Utilities' },
        { id: 'receipt', name: 'Bills' },
        { id: 'heart-pulse', name: 'Healthcare' },
        { id: 'pill', name: 'Medicine' },
        { id: 'dumbbell', name: 'Fitness' },
        { id: 'graduation-cap', name: 'Education' },
        { id: 'book', name: 'Books' },
        { id: 'film', name: 'Entertainment' },
        { id: 'music', name: 'Music' },
        { id: 'gamepad-2', name: 'Gaming' },
        { id: 'shirt', name: 'Clothing' },
        { id: 'sparkles', name: 'Personal Care' },
        { id: 'scissors', name: 'Salon' },
        { id: 'smartphone', name: 'Phone' },
        { id: 'wifi', name: 'Internet' },
        { id: 'tv', name: 'TV' },
        { id: 'repeat', name: 'Subscription' },
        { id: 'shield', name: 'Insurance' },
        { id: 'gift', name: 'Gifts' },
        { id: 'paw-print', name: 'Pets' },
        { id: 'wrench', name: 'Maintenance' },
        { id: 'package', name: 'Package' },
    ],

    income: [
        { id: 'trending-up', name: 'Income' },
        { id: 'dollar-sign', name: 'Money' },
        { id: 'briefcase', name: 'Work' },
        { id: 'percent', name: 'Interest' },
        { id: 'award', name: 'Bonus' },
        { id: 'gift', name: 'Gift' },
        { id: 'undo', name: 'Refund' },
        { id: 'arrow-down-left', name: 'Transfer In' },
        { id: 'plus-circle', name: 'Other Income' },
    ],

    investment: [
        { id: 'trending-up', name: 'Growth' },
        { id: 'trending-down', name: 'Loss' },
        { id: 'bar-chart-3', name: 'Stocks' },
        { id: 'pie-chart', name: 'Portfolio' },
        { id: 'bitcoin', name: 'Crypto' },
        { id: 'landmark', name: 'Bonds' },
    ],

    goals: [
        { id: 'target', name: 'Goal' },
        { id: 'flag', name: 'Milestone' },
        { id: 'star', name: 'Priority' },
        { id: 'trophy', name: 'Achievement' },
    ],

    general: [
        { id: 'circle', name: 'Circle' },
        { id: 'square', name: 'Square' },
        { id: 'triangle', name: 'Triangle' },
        { id: 'star', name: 'Star' },
        { id: 'heart', name: 'Heart' },
        { id: 'bookmark', name: 'Bookmark' },
        { id: 'tag', name: 'Tag' },
        { id: 'folder', name: 'Folder' },
        { id: 'file', name: 'File' },
        { id: 'calendar', name: 'Calendar' },
        { id: 'clock', name: 'Clock' },
        { id: 'map-pin', name: 'Location' },
        { id: 'more-horizontal', name: 'More' },
    ],
};

// Flat list of all icons for search
export const ALL_ICONS = Object.values(FINANCE_ICONS).flat();

// Get icon by ID
export const getIconById = (iconId) => {
    return ALL_ICONS.find(icon => icon.id === iconId);
};

// Search icons by name
export const searchIcons = (query) => {
    if (!query) return ALL_ICONS;
    const lowerQuery = query.toLowerCase();
    return ALL_ICONS.filter(icon =>
        icon.name.toLowerCase().includes(lowerQuery) ||
        icon.id.toLowerCase().includes(lowerQuery)
    );
};
