import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useTransactionStore } from '../../stores/transactionStore';
import { useWalletStore } from '../../stores/walletStore';
import { useCategoryStore } from '../../stores/categoryStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import './TransactionFormModal.css';

const transactionSchema = z.object({
    type: z.enum(['Income', 'Expense', 'Transfer']),
    amount: z.number().positive('Amount must be greater than 0'),
    date: z.string(),
    description: z.string().optional(),
    walletId: z.string().optional(),
    categoryId: z.string().optional(),
    fromWalletId: z.string().optional(),
    toWalletId: z.string().optional(),
}).refine(
    (data) => {
        if (data.type === 'Transfer') {
            return data.fromWalletId && data.toWalletId && data.fromWalletId !== data.toWalletId;
        }
        return data.walletId && data.categoryId;
    },
    {
        message: 'Required fields missing or invalid',
    }
);

const TRANSACTION_TYPES = [
    { value: 'Expense', label: 'Expense', color: 'expense' },
    { value: 'Income', label: 'Income', color: 'income' },
    { value: 'Transfer', label: 'Transfer', color: 'transfer' },
];

export default function TransactionFormModal({ transaction, onClose, onSuccess }) {
    const { createTransaction, updateTransaction } = useTransactionStore();
    const { wallets } = useWalletStore();
    const { categories } = useCategoryStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: transaction?.type || 'Expense',
            amount: transaction?.amount || 0,
            date: transaction?.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            description: transaction?.description || '',
            walletId: transaction?.wallet_id || '',
            categoryId: transaction?.category_id || '',
            fromWalletId: transaction?.from_wallet_id || '',
            toWalletId: transaction?.to_wallet_id || '',
        },
    });

    const selectedType = watch('type');
    const activeWallets = wallets.filter(w => w.status === 'Active');

    // Filter categories by type
    const availableCategories = categories.filter(c => {
        if (selectedType === 'Transfer') return false;
        if (selectedType === 'Income') return c.type === 'Income' && c.is_active;
        if (selectedType === 'Expense') return (c.type === 'Expense' || c.type === 'Debt/Loan') && c.is_active;
        return c.is_active;
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const transactionData = {
                type: data.type,
                amount: data.amount,
                date: data.date,
                description: data.description,
            };

            if (data.type === 'Transfer') {
                transactionData.fromWalletId = data.fromWalletId;
                transactionData.toWalletId = data.toWalletId;
            } else {
                transactionData.walletId = data.walletId;
                transactionData.categoryId = data.categoryId;
            }

            if (transaction) {
                await updateTransaction(transaction.id, transactionData);
            } else {
                await createTransaction(transactionData);
            }

            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Failed to save transaction');
            setIsLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} size="md">
            <div className="modal-header">
                <h2 className="font-display">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="transaction-form">
                {/* Transaction Type Tabs */}
                <div className="form-group">
                    <label className="form-label">Transaction Type</label>
                    <div className="type-selector">
                        {TRANSACTION_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                className={`type-option ${type.color} ${selectedType === type.value ? 'active' : ''}`}
                                onClick={() => setValue('type', type.value)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <Input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    label="Amount"
                    placeholder="0.00"
                    error={errors.amount?.message}
                    fullWidth
                    step="0.01"
                    min="0"
                />

                {/* Date */}
                <Input
                    {...register('date')}
                    type="date"
                    label="Date"
                    error={errors.date?.message}
                    fullWidth
                />

                {/* Conditional Fields based on Type */}
                {selectedType === 'Transfer' ? (
                    <>
                        <div className="form-group">
                            <label className="form-label">From Wallet</label>
                            <select
                                {...register('fromWalletId')}
                                className="form-select"
                            >
                                <option value="">Select wallet</option>
                                {activeWallets.map(wallet => (
                                    <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                                ))}
                            </select>
                            {errors.fromWalletId && (
                                <p className="error-message">{errors.fromWalletId.message}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">To Wallet</label>
                            <select
                                {...register('toWalletId')}
                                className="form-select"
                            >
                                <option value="">Select wallet</option>
                                {activeWallets.map(wallet => (
                                    <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                                ))}
                            </select>
                            {errors.toWalletId && (
                                <p className="error-message">{errors.toWalletId.message}</p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label className="form-label">Wallet</label>
                            <select
                                {...register('walletId')}
                                className="form-select"
                            >
                                <option value="">Select wallet</option>
                                {activeWallets.map(wallet => (
                                    <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                                ))}
                            </select>
                            {errors.walletId && (
                                <p className="error-message">{errors.walletId.message}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                {...register('categoryId')}
                                className="form-select"
                            >
                                <option value="">Select category</option>
                                {availableCategories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="error-message">{errors.categoryId.message}</p>
                            )}
                        </div>
                    </>
                )}

                {/* Description */}
                <Input
                    {...register('description')}
                    label="Description (Optional)"
                    placeholder="e.g., Grocery shopping at Walmart"
                    fullWidth
                />

                <div className="modal-actions">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {transaction ? 'Update Transaction' : 'Add Transaction'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
