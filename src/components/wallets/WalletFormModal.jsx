import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';
import { useWalletStore } from '../../stores/walletStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import IconPicker from '../ui/IconPicker';
import { WALLET_TYPES } from '../../constants/currencies';
import './WalletFormModal.css';

const walletSchema = z.object({
    name: z.string().min(1, 'Wallet name is required').max(50, 'Name too long'),
    type: z.enum(['Bank', 'Credit Card', 'Cash', 'Wallet/UPI', 'Investment', 'Other']),
    openingBalance: z.number().optional(),
});

// Helper to render icon from icon ID
const renderIconFromId = (iconId, size = 20) => {
    if (!iconId) return <LucideIcons.Wallet size={size} />;

    const iconName = iconId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={size} /> : <LucideIcons.Wallet size={size} />;
};

export default function WalletFormModal({ wallet, currency, onClose, onSuccess }) {
    const { createWallet, updateWallet } = useWalletStore();
    const [isLoading, setIsLoading] = useState(false);
    const [includedInTotal, setIncludedInTotal] = useState(wallet?.included_in_total ?? true);
    const [selectedIcon, setSelectedIcon] = useState(wallet?.icon_id || 'wallet');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(walletSchema),
        defaultValues: {
            name: wallet?.name || '',
            type: wallet?.type || 'Bank',
            openingBalance: wallet?.opening_balance || 0,
        },
    });

    const selectedType = watch('type');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (wallet) {
                // Update existing wallet
                await updateWallet(wallet.id, {
                    name: data.name,
                    type: data.type,
                    icon_id: selectedIcon,
                    included_in_total: includedInTotal,
                });
            } else {
                // Create new wallet
                await createWallet({
                    name: data.name,
                    type: data.type,
                    iconId: selectedIcon,
                    currency: currency,
                    openingBalance: data.openingBalance || 0,
                    includedInTotal,
                });
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Failed to save wallet');
            setIsLoading(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="modal-header">
                <h2 className="font-display">{wallet ? 'Edit Wallet' : 'Add Wallet'}</h2>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="wallet-form">
                {/* Icon Picker Section */}
                <div className="form-group">
                    <label className="form-label">Wallet Icon</label>
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
                    label="Wallet Name"
                    placeholder="e.g., Main Bank Account"
                    error={errors.name?.message}
                    fullWidth
                    autoFocus
                />

                <div className="form-group">
                    <label className="form-label">Wallet Type</label>
                    <div className="type-selector-grid">
                        {WALLET_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                className={`type-option ${selectedType === type.value ? 'active' : ''}`}
                                onClick={() => setValue('type', type.value)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!wallet && (
                    <Input
                        {...register('openingBalance', { valueAsNumber: true })}
                        type="number"
                        label="Opening Balance"
                        placeholder="0.00"
                        helperText={`Initial balance in ${currency}`}
                        error={errors.openingBalance?.message}
                        fullWidth
                        step="0.01"
                    />
                )}

                <label className="form-checkbox">
                    <input
                        type="checkbox"
                        checked={includedInTotal}
                        onChange={(e) => setIncludedInTotal(e.target.checked)}
                    />
                    <div className="form-checkbox-label">
                        Include in total balance
                        <div className="text-tertiary text-xs mt-1" style={{ fontSize: '10px', opacity: 0.7 }}>
                            (Uncheck if you don't want this counted in your total)
                        </div>
                    </div>
                </label>

                <div className="modal-actions">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {wallet ? 'Update Wallet' : 'Create Wallet'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
