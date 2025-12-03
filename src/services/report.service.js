import { supabase } from '../lib/supabase';

// Get top spending categories for a date range
export const getTopSpendingCategories = async (userId, startDate, endDate, limit = 5) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
      amount,
      category_id,
      category:categories(id, name, icon_id, type)
    `)
        .eq('user_id', userId)
        .eq('type', 'Expense')
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    // Group by category and sum amounts
    const categoryTotals = {};
    data.forEach(tx => {
        if (tx.category) {
            const catId = tx.category.id;
            if (!categoryTotals[catId]) {
                categoryTotals[catId] = {
                    category: tx.category,
                    total: 0,
                };
            }
            categoryTotals[catId].total += parseFloat(tx.amount);
        }
    });

    // Convert to array and sort by total descending
    const topCategories = Object.values(categoryTotals)
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);

    // Calculate total for percentage
    const grandTotal = topCategories.reduce((sum, cat) => sum + cat.total, 0);

    // Add percentage to each category
    return topCategories.map(cat => ({
        ...cat,
        percentage: grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0,
    }));
};

// Get category spending breakdown
export const getCategoryBreakdown = async (userId, startDate, endDate, type = 'Expense') => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
      amount,
      category_id,
      category:categories(id, name, icon_id, type)
    `)
        .eq('user_id', userId)
        .eq('type', type)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    // Group by category
    const categoryMap = {};
    data.forEach(tx => {
        if (tx.category) {
            const catId = tx.category.id;
            if (!categoryMap[catId]) {
                categoryMap[catId] = {
                    category: tx.category,
                    total: 0,
                    count: 0,
                };
            }
            categoryMap[catId].total += parseFloat(tx.amount);
            categoryMap[catId].count += 1;
        }
    });

    return Object.values(categoryMap).sort((a, b) => b.total - a.total);
};
