import { useEffect, useState, useMemo } from 'react';
import { Plus, Eye, EyeOff, CornerDownRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CategoryFormModal from '../../components/categories/CategoryFormModal';
import './CategoriesList.css';

const CATEGORY_TYPES = [
    { value: 'Expense', label: 'Expenses', color: 'expense' },
    { value: 'Income', label: 'Income', color: 'income' },
    { value: 'Debt/Loan', label: 'Debt & Loans', color: 'debt' },
];

// Helper to render icon from icon ID
const renderIconFromId = (iconId, size = 20) => {
    if (!iconId) return <LucideIcons.Tag size={size} />;

    const iconName = iconId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={size} /> : <LucideIcons.Tag size={size} />;
};

export default function CategoriesList() {
    const { user } = useAuthStore();
    const {
        categories,
        isLoading,
        fetchCategories,
        getActivationCount,
    } = useCategoryStore();

    const [activeTab, setActiveTab] = useState('Expense');
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activationCounts, setActivationCounts] = useState({});

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user, fetchCategories]);

    // Fetch activation counts for all categories
    useEffect(() => {
        const fetchCounts = async () => {
            const counts = {};
            for (const cat of categories) {
                try {
                    counts[cat.id] = await getActivationCount(cat.id);
                } catch (error) {
                    counts[cat.id] = 0;
                }
            }
            setActivationCounts(counts);
        };
        if (categories.length > 0) {
            fetchCounts();
        }
    }, [categories, getActivationCount]);

    // Use useMemo to ensure proper reactivity when categories load
    const activeCategories = useMemo(() =>
        categories.filter(c => c.is_active_global),
        [categories]
    );

    const inactiveCategories = useMemo(() =>
        categories.filter(c => !c.is_active_global),
        [categories]
    );

    const displayedCategories = useMemo(() => {
        const typeCategories = categories.filter(c => c.type === activeTab);
        return showInactive
            ? typeCategories
            : typeCategories.filter(c => c.is_active_global);
    }, [categories, activeTab, showInactive]);

    // Group categories by parent (hierarchical structure)
    const hierarchicalCategories = useMemo(() => {
        const parents = displayedCategories.filter(c => !c.parent_category_id);
        const children = displayedCategories.filter(c => c.parent_category_id);

        // Build hierarchy
        const hierarchy = parents.map(parent => ({
            ...parent,
            children: children.filter(child => child.parent_category_id === parent.id)
        }));

        // Also include orphan children (parents not in current view due to filtering)
        const orphanChildren = children.filter(child =>
            !parents.some(p => p.id === child.parent_category_id)
        );

        return { hierarchy, orphanChildren };
    }, [displayedCategories]);

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSuccess = () => {
        fetchCategories();
        handleCloseModal();
        toast.success(editingCategory ? 'Category updated' : 'Category created');
    };

    const getTabCounts = (type) => {
        const typeCategories = categories.filter(c => c.type === type);
        const active = typeCategories.filter(c => c.is_active_global).length;
        return { active, total: typeCategories.length };
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Expense': return 'expense';
            case 'Income': return 'income';
            case 'Debt/Loan': return 'debt';
            default: return 'expense';
        }
    };

    const typeColor = getTypeColor(activeTab);

    // Render a single category row
    const renderCategoryRow = (category, isChild = false) => {
        const isActive = category.is_active_global;
        const walletCount = activationCounts[category.id] || 0;

        return (
            <div
                key={category.id}
                className={`category-row ${isChild ? 'child' : 'parent'} ${!isActive ? 'inactive' : ''}`}
                onClick={() => handleEditCategory(category)}
            >
                {isChild && (
                    <div className="child-connector">
                        <CornerDownRight size={16} />
                    </div>
                )}
                <div className={`category-row-icon ${typeColor}`}>
                    {renderIconFromId(category.icon_id, 20)}
                </div>
                <div className="category-row-info">
                    <span className="category-row-name">{category.name}</span>
                    {isActive && walletCount > 0 && (
                        <span className="category-row-wallets">
                            Active in {walletCount} {walletCount === 1 ? 'wallet' : 'wallets'}
                        </span>
                    )}
                </div>
                {!isActive && (
                    <span className="category-row-badge inactive">Archived</span>
                )}
            </div>
        );
    };

    if (isLoading && categories.length === 0) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container categories-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="font-display">Categories</h1>
                    <p className="text-secondary">Organize your transactions with categories</p>
                </div>
                <Button onClick={handleAddCategory} leftIcon={<Plus />}>
                    Add Category
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <Card padding="md" className="stat-card">
                    <div className="stat-value">{activeCategories.length}</div>
                    <div className="stat-label text-secondary">Active Categories</div>
                </Card>
                <Card padding="md" className="stat-card">
                    <div className="stat-value">{inactiveCategories.length}</div>
                    <div className="stat-label text-secondary">Inactive Categories</div>
                </Card>
                <Card padding="md" className="stat-card">
                    <div className="stat-value">{categories.length}</div>
                    <div className="stat-label text-secondary">Total Categories</div>
                </Card>
            </div>

            {/* Category Type Tabs */}
            <div className="category-tabs">
                {CATEGORY_TYPES.map((type) => {
                    const counts = getTabCounts(type.value);
                    return (
                        <button
                            key={type.value}
                            className={`category-tab ${activeTab === type.value ? 'active' : ''} ${type.color}`}
                            onClick={() => setActiveTab(type.value)}
                        >
                            <span className="tab-label">{type.label}</span>
                            <span className="tab-count">{counts.active}</span>
                        </button>
                    );
                })}
            </div>

            {/* Show Inactive Toggle */}
            <div className="filter-bar">
                <button
                    className="toggle-inactive"
                    onClick={() => setShowInactive(!showInactive)}
                >
                    {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span>{showInactive ? 'Hide' : 'Show'} archived categories</span>
                </button>
            </div>

            {/* Categories List (Hierarchical) */}
            {displayedCategories.length > 0 ? (
                <div className="categories-list">
                    {/* Parent categories with their children */}
                    {hierarchicalCategories.hierarchy.map((parent) => (
                        <div key={parent.id} className="category-group">
                            {renderCategoryRow(parent, false)}
                            {parent.children.length > 0 && (
                                <div className="category-children">
                                    {parent.children.map(child => renderCategoryRow(child, true))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Orphan children (parent not visible) */}
                    {hierarchicalCategories.orphanChildren.map(child => (
                        <div key={child.id} className="category-group orphan">
                            {renderCategoryRow(child, true)}
                        </div>
                    ))}
                </div>
            ) : (
                <Card padding="xl" className="empty-state">
                    <div className="empty-icon">📁</div>
                    <h3>No {CATEGORY_TYPES.find(t => t.value === activeTab)?.label}</h3>
                    <p className="text-secondary">
                        {showInactive
                            ? `You don't have any ${activeTab.toLowerCase()} categories yet`
                            : `All ${activeTab.toLowerCase()} categories are archived`}
                    </p>
                    <Button onClick={handleAddCategory} leftIcon={<Plus />}>
                        Add {activeTab} Category
                    </Button>
                </Card>
            )}

            {/* Category Form Modal */}
            {isModalOpen && (
                <CategoryFormModal
                    category={editingCategory}
                    defaultType={activeTab}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
