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

// Get hierarchical category breakdown (parent categories with summed children)
export const getHierarchicalCategoryBreakdown = async (userId, startDate, endDate, type = 'Expense') => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
      amount,
      category_id,
      category:categories(id, name, icon_id, type, parent_category_id)
    `)
        .eq('user_id', userId)
        .eq('type', type)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    // First pass: group by individual category with parent info
    const categoryMap = {};
    data.forEach(tx => {
        if (tx.category) {
            const catId = tx.category.id;
            if (!categoryMap[catId]) {
                categoryMap[catId] = {
                    category: tx.category,
                    total: 0,
                    count: 0,
                    parentId: tx.category.parent_category_id,
                };
            }
            categoryMap[catId].total += parseFloat(tx.amount);
            categoryMap[catId].count += 1;
        }
    });

    // Second pass: build hierarchy
    // Parent categories: those without parent_category_id OR have children
    // Child categories: those with parent_category_id
    const parentMap = {};
    const childCategories = [];

    Object.values(categoryMap).forEach(cat => {
        if (cat.parentId) {
            childCategories.push(cat);
        } else {
            // This is a top-level category (parent or standalone)
            parentMap[cat.category.id] = {
                category: cat.category,
                ownTotal: cat.total,
                ownCount: cat.count,
                childrenTotal: 0,
                childrenCount: 0,
                total: cat.total,
                count: cat.count,
                children: [],
            };
        }
    });

    // Assign children to parents
    childCategories.forEach(child => {
        if (parentMap[child.parentId]) {
            parentMap[child.parentId].children.push({
                category: child.category,
                total: child.total,
                count: child.count,
            });
            parentMap[child.parentId].childrenTotal += child.total;
            parentMap[child.parentId].childrenCount += child.count;
            parentMap[child.parentId].total += child.total;
            parentMap[child.parentId].count += child.count;
        } else {
            // Parent not in current data, treat child as standalone
            parentMap[child.category.id] = {
                category: child.category,
                ownTotal: child.total,
                ownCount: child.count,
                childrenTotal: 0,
                childrenCount: 0,
                total: child.total,
                count: child.count,
                children: [],
            };
        }
    });

    // Sort by total descending, then sort children within each parent
    const result = Object.values(parentMap).sort((a, b) => b.total - a.total);
    result.forEach(parent => {
        parent.children.sort((a, b) => b.total - a.total);
    });

    return result;
};
