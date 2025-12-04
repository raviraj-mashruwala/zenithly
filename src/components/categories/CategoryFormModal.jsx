import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../stores/categoryStore';
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
    const { createCategory, updateCategory } = useCategoryStore();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(category?.icon_id || getDefaultIconForType(defaultType));
    const [showIconPicker, setShowIconPicker] = useState(false);

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

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (category) {
                // Update existing category
                await updateCategory(category.id, {
                    name: data.name,
                    type: data.type,
                    icon_id: selectedIcon,
                });
            } else {
                // Create new category
                await createCategory({
                    name: data.name,
                    type: data.type,
                    iconId: selectedIcon,
                });
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Failed to save category');
            setIsLoading(false);
        }
    };

    return (
        <Modal onClose={onClose}>
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
