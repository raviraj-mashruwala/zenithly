import { useEffect, useState } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CategoryCard from '../../components/categories/CategoryCard';
import CategoryFormModal from '../../components/categories/CategoryFormModal';
import './CategoriesList.css';

const CATEGORY_TYPES = [
    { value: 'Expense', label: 'Expenses', color: 'expense' },
    { value: 'Income', label: 'Income', color: 'income' },
    { value: 'Debt/Loan', label: 'Debt & Loans', color: 'debt' },
];

export default function CategoriesList() {
    const { user } = useAuthStore();
    const {
        categories,
        isLoading,
        fetchCategories,
        getCategoriesByType,
        getActiveCategories,
        getInactiveCategories,
    } = useCategoryStore();

    const [activeTab, setActiveTab] = useState('Expense');
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user, fetchCategories]);

    const activeCategories = getActiveCategories();
    const inactiveCategories = getInactiveCategories();

    const displayedCategories = showInactive
        ? getCategoriesByType(activeTab)
        : getCategoriesByType(activeTab).filter(c => c.is_active);

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
        const typeCategories = getCategoriesByType(type);
        const active = typeCategories.filter(c => c.is_active).length;
        return { active, total: typeCategories.length };
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
                    <span>{showInactive ? 'Hide' : 'Show'} inactive categories</span>
                </button>
            </div>

            {/* Categories Grid */}
            {displayedCategories.length > 0 ? (
                <div className="categories-grid">
                    {displayedCategories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={() => handleEditCategory(category)}
                        />
                    ))}
                </div>
            ) : (
                <Card padding="xl" className="empty-state">
                    <div className="empty-icon">📁</div>
                    <h3>No {CATEGORY_TYPES.find(t => t.value === activeTab)?.label}</h3>
                    <p className="text-secondary">
                        {showInactive
                            ? `You don't have any ${activeTab.toLowerCase()} categories yet`
                            : `All ${activeTab.toLowerCase()} categories are inactive`}
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
