import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown, Wallet, GitMerge, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../stores/categoryStore';
import { useWalletStore } from '../../stores/walletStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import IconPicker from '../ui/IconPicker';
import './CategoryFormModal.css';

const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Name too long'),
    type: z.enum(['Expense', 'Income', 'Debt/Loan']),
});

const CATEGORY_TYPES = [
    { value: 'Expense', label: 'Expense', color: 'expense', defaultIcon: 'shopping-cart' },
    { value: 'Income', label: 'Income', color: 'income', defaultIcon: 'trending-up' },
    { value: 'Debt/Loan', label: 'Debt & Loan', color: 'debt', defaultIcon: 'landmark' },
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

// Get default icon for category type
const getDefaultIconForType = (type) => {
    const typeConfig = CATEGORY_TYPES.find(t => t.value === type);
    return typeConfig?.defaultIcon || 'tag';
};

export default function CategoryFormModal({ category, defaultType = 'Expense', onClose, onSuccess }) {
    const {
        createCategory,
        updateCategory,
        fetchParentCategories,
        fetchWalletActivationsForCategory,
        toggleCategoryForWallet,
        mergeCategories,
        getCategoryTransactionCount,
        categories
    } = useCategoryStore();
    const { wallets } = useWalletStore();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(category?.icon_id || getDefaultIconForType(defaultType));
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [parentCategoryId, setParentCategoryId] = useState(category?.parent_category_id || '');
    const [parentCategories, setParentCategories] = useState([]);
    const [walletActivations, setWalletActivations] = useState([]);
    const [showMergeSection, setShowMergeSection] = useState(false);
    const [mergeTargetId, setMergeTargetId] = useState('');
    const [transactionCount, setTransactionCount] = useState(0);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || '',
            type: category?.type || defaultType,
        },
    });

    const selectedType = watch('type');

    // Fetch parent categories when type changes
    useEffect(() => {
        const loadParentCategories = async () => {
            try {
                const parents = await fetchParentCategories(selectedType);
                // Filter out the current category (can't be its own parent)
                const filtered = category
                    ? parents.filter(p => p.id !== category.id)
                    : parents;
                setParentCategories(filtered);

                // Reset parent if type changed and current parent is different type
                if (parentCategoryId) {
                    const currentParent = filtered.find(p => p.id === parentCategoryId);
                    if (!currentParent) {
                        setParentCategoryId('');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch parent categories:', error);
            }
        };
        loadParentCategories();
    }, [selectedType, category, fetchParentCategories]);

    // Fetch wallet activations for existing category
    useEffect(() => {
        const loadWalletActivations = async () => {
            if (category?.id) {
                try {
                    const activations = await fetchWalletActivationsForCategory(category.id);
                    setWalletActivations(activations);

                    const count = await getCategoryTransactionCount(category.id);
                    setTransactionCount(count);
                } catch (error) {
                    console.error('Failed to fetch wallet activations:', error);
                }
            } else {
                // For new categories, all wallets are active by default
                const activeWallets = wallets.filter(w => w.status === 'Active');
                setWalletActivations(activeWallets.map(w => ({
                    wallet_id: w.id,
                    wallets: w,
                    active: true
                })));
            }
        };
        loadWalletActivations();
    }, [category?.id, wallets, fetchWalletActivationsForCategory, getCategoryTransactionCount]);

    const handleToggleWallet = async (walletId, currentActive) => {
        if (category?.id) {
            try {
                await toggleCategoryForWallet(category.id, walletId, !currentActive);
                setWalletActivations(prev =>
                    prev.map(wa =>
                        wa.wallet_id === walletId
                            ? { ...wa, active: !currentActive }
                            : wa
                    )
                );
                // Touch the category to update its updated_at timestamp so the list refreshes
                await updateCategory(category.id, {
                    updated_at: new Date().toISOString()
                });
                toast.success(`Category ${!currentActive ? 'activated' : 'deactivated'} for wallet`);
            } catch (error) {
                toast.error('Failed to update wallet activation');
            }
        } else {
            // For new categories, just update local state
            setWalletActivations(prev =>
                prev.map(wa =>
                    wa.wallet_id === walletId
                        ? { ...wa, active: !currentActive }
                        : wa
                )
            );
        }
    };

    const handleMerge = async () => {
        if (!mergeTargetId || !category?.id) return;

        if (!confirm(`Are you sure you want to merge "${category.name}" into the selected category? This will move ${transactionCount} transactions and archive this category.`)) {
            return;
        }

        setIsLoading(true);
        try {
            await mergeCategories(category.id, mergeTargetId);
            toast.success('Categories merged successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Failed to merge categories');
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (category) {
                // Update existing category
                await updateCategory(category.id, {
                    name: data.name,
                    type: data.type,
                    icon_id: selectedIcon,
                    parent_category_id: parentCategoryId || null,
                });
            } else {
                // Create new category
                await createCategory({
                    name: data.name,
                    type: data.type,
                    iconId: selectedIcon,
                    parentCategoryId: parentCategoryId || null,
                });
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Failed to save category');
            setIsLoading(false);
        }
    };

    // Get mergeable categories (same type, not self, active)
    const mergeableCategorties = categories.filter(c =>
        c.type === selectedType &&
        c.id !== category?.id &&
        c.is_active_global
    );

    return (
        <Modal onClose={onClose} size="lg">
            <div className="modal-header">
                <h2 className="font-display">{category ? 'Edit Category' : 'Add Category'}</h2>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="category-form">
                {/* Icon Picker Section */}
                <div className="form-group">
                    <label className="form-label">Category Icon</label>
                    <button
                        type="button"
                        className="icon-picker-trigger"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                    >
                        <div className="icon-picker-preview">
                            {renderIconFromId(selectedIcon, 24)}
                            <span className="icon-picker-name">{selectedIcon || 'Choose icon'}</span>
                        </div>
                        <ChevronDown size={16} className={`icon-picker-chevron ${showIconPicker ? 'open' : ''}`} />
                    </button>

                    {showIconPicker && (
                        <div className="icon-picker-dropdown">
                            <IconPicker
                                selectedIcon={selectedIcon}
                                onSelect={(iconId) => {
                                    setSelectedIcon(iconId);
                                    setShowIconPicker(false);
                                }}
                                onClose={() => setShowIconPicker(false)}
                            />
                        </div>
                    )}
                </div>

                <Input
                    {...register('name')}
                    label="Category Name"
                    placeholder="e.g., Groceries, Salary, Home Loan"
                    error={errors.name?.message}
                    fullWidth
                    autoFocus
                />

                <div className="form-group">
                    <label className="form-label">Category Type</label>
                    <div className="category-types-grid">
                        {CATEGORY_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                className={`category-type-btn ${type.color} ${selectedType === type.value ? 'selected' : ''}`}
                                onClick={() => setValue('type', type.value)}
                            >
                                <span className="type-indicator"></span>
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Parent Category Selection */}
                <div className="form-group">
                    <label className="form-label">Parent Category (Optional)</label>
                    <select
                        value={parentCategoryId}
                        onChange={(e) => setParentCategoryId(e.target.value)}
                        className="form-select"
                    >
                        <option value="">No parent (Top-level category)</option>
                        {parentCategories.map(parent => (
                            <option key={parent.id} value={parent.id}>
                                {parent.name}
                            </option>
                        ))}
                    </select>
                    <p className="form-hint">
                        Only top-level categories can be parents. Single-level hierarchy only.
                    </p>
                </div>

                {/* Wallet Activation Section - Only show for existing categories */}
                {category && (
                    <div className="form-section">
                        <div className="section-header">
                            <Wallet size={16} />
                            <span className="form-label">Active in Wallets</span>
                        </div>
                        <div className="wallet-activation-list">
                            {walletActivations.map(wa => (
                                <div key={wa.wallet_id} className="wallet-activation-item">
                                    <div className="wallet-info">
                                        <div className="wallet-icon">
                                            {renderIconFromId(wa.wallets?.icon_id, 16)}
                                        </div>
                                        <span className="wallet-name">{wa.wallets?.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`activation-toggle ${wa.active ? 'active' : ''}`}
                                        onClick={() => handleToggleWallet(wa.wallet_id, wa.active)}
                                    >
                                        {wa.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Merge Section - Only for existing categories with transactions */}
                {category && (
                    <div className="form-section merge-section">
                        <button
                            type="button"
                            className="section-toggle"
                            onClick={() => setShowMergeSection(!showMergeSection)}
                        >
                            <div className="section-toggle-left">
                                <GitMerge size={16} />
                                <span>Merge Category</span>
                            </div>
                            <ChevronRight size={16} className={`chevron ${showMergeSection ? 'open' : ''}`} />
                        </button>

                        {showMergeSection && (
                            <div className="merge-content">
                                <p className="merge-info">
                                    Merge this category into another. All {transactionCount} transactions
                                    will be moved to the target category.
                                </p>
                                <select
                                    value={mergeTargetId}
                                    onChange={(e) => setMergeTargetId(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Select target category</option>
                                    {mergeableCategorties.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleMerge}
                                    disabled={!mergeTargetId || isLoading}
                                    className="merge-button"
                                >
                                    <GitMerge size={16} />
                                    Merge & Archive
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {category ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
