import { MoreVertical, Edit, Power, PowerOff, Trash2, Wallet } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../stores/categoryStore';
import Card from '../ui/Card';
import './CategoryCard.css';

// Helper to render icon from icon ID
const renderIconFromId = (iconId, size = 24) => {
    if (!iconId) return <LucideIcons.Tag size={size} />;

    const iconName = iconId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={size} /> : <LucideIcons.Tag size={size} />;
};

export default function CategoryCard({ category, onEdit }) {
    const [showMenu, setShowMenu] = useState(false);
    const [activationCount, setActivationCount] = useState(0);
    const {
        deactivateCategory,
        activateCategory,
        deleteCategory,
        getActivationCount,
        getCategoryDisplayName
    } = useCategoryStore();

    // Fetch activation count on mount and when category is updated
    useEffect(() => {
        const fetchActivationCount = async () => {
            try {
                const count = await getActivationCount(category.id);
                setActivationCount(count);
            } catch (error) {
                console.error('Failed to fetch activation count:', error);
            }
        };
        fetchActivationCount();
    }, [category.id, category.updated_at, getActivationCount]);

    const handleDeactivate = async () => {
        try {
            await deactivateCategory(category.id);
            toast.success('Category deactivated globally');
            setShowMenu(false);
        } catch (error) {
            toast.error(error.message || 'Failed to deactivate category');
        }
    };

    const handleActivate = async () => {
        try {
            await activateCategory(category.id);
            toast.success('Category activated');
            setShowMenu(false);
        } catch (error) {
            toast.error(error.message || 'Failed to activate category');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteCategory(category.id);
            toast.success('Category deleted');
        } catch (error) {
            toast.error(error.message || 'Failed to delete category');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Expense':
                return 'expense';
            case 'Income':
                return 'income';
            case 'Debt/Loan':
                return 'debt';
            default:
                return 'expense';
        }
    };

    const typeColor = getTypeColor(category.type);
    const isActive = category.is_active_global;
    const displayName = getCategoryDisplayName(category);
    const hasParent = category.parent !== null && category.parent !== undefined;

    return (
        <Card
            className={`category-card ${!isActive ? 'inactive' : ''}`}
            hover={isActive}
        >
            <div className="category-header">
                <div className={`category-icon ${typeColor}`}>
                    {renderIconFromId(category.icon_id)}
                </div>

                <div className="category-menu">
                    <button
                        className="menu-trigger"
                        onClick={() => setShowMenu(!showMenu)}
                        aria-label="Category options"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                            <div className="menu-dropdown">
                                <button className="menu-item" onClick={() => { onEdit(); setShowMenu(false); }}>
                                    <Edit size={16} />
                                    <span>Edit</span>
                                </button>

                                {isActive ? (
                                    <button className="menu-item" onClick={handleDeactivate}>
                                        <PowerOff size={16} />
                                        <span>Archive</span>
                                    </button>
                                ) : (
                                    <button className="menu-item" onClick={handleActivate}>
                                        <Power size={16} />
                                        <span>Restore</span>
                                    </button>
                                )}

                                <div className="menu-divider" />

                                <button className="menu-item danger" onClick={handleDelete}>
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="category-content">
                {/* Parent category hierarchy display */}
                {hasParent && (
                    <div className="category-parent-label">
                        {category.parent.name}
                    </div>
                )}

                <div className="category-name">{category.name}</div>

                <div className="category-meta">
                    <div className={`category-type-badge ${typeColor}`}>
                        {category.type}
                    </div>

                    {/* Wallet activation count */}
                    {isActive && activationCount > 0 && (
                        <div className="category-wallet-count">
                            <Wallet size={12} />
                            <span>Active in {activationCount} {activationCount === 1 ? 'wallet' : 'wallets'}</span>
                        </div>
                    )}
                </div>

                {!isActive && (
                    <div className="inactive-badge">Archived</div>
                )}
            </div>
        </Card>
    );
}
