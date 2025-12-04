import { MoreVertical, Edit, Trash2, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTransactionStore } from '../../stores/transactionStore';
import { formatCurrency } from '../../utils/currency';
import Icon from '../ui/Icon';
import './TransactionCard.css';

export default function TransactionCard({ transaction, onEdit }) {
    const [showMenu, setShowMenu] = useState(false);
    const { deleteTransaction } = useTransactionStore();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this transaction? This will update your wallet balance.')) {
            return;
        }

        try {
            await deleteTransaction(transaction.id);
            toast.success('Transaction deleted');
        } catch (error) {
            toast.error(error.message || 'Failed to delete transaction');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Income':
                return <ArrowUpRight size={20} />;
            case 'Expense':
                return <ArrowDownRight size={20} />;
            case 'Transfer':
                return <ArrowRightLeft size={20} />;
            default:
                return null;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Income':
                return 'income';
            case 'Expense':
                return 'expense';
            case 'Transfer':
                return 'transfer';
            default:
                return 'default';
        }
    };

    const typeColor = getTypeColor(transaction.type);

    return (
        <div className="transaction-card">
            <div className={`transaction-icon ${typeColor}`}>
                {transaction.category?.icon_id ? (
                    <Icon iconId={transaction.category.icon_id} size={20} />
                ) : (
                    getTypeIcon(transaction.type)
                )}
            </div>

            <div className="transaction-details">
                <div className="transaction-title">
                    {transaction.type === 'Transfer' ? (
                        <span>{transaction.from_wallet?.name} → {transaction.to_wallet?.name}</span>
                    ) : (
                        <span>{transaction.category?.name || transaction.type}</span>
                    )}
                </div>

                {transaction.description && (
                    <div className="transaction-subtitle">
                        {transaction.description}
                    </div>
                )}

                {transaction.type !== 'Transfer' && transaction.wallet?.name && (
                    <div className="transaction-wallet">
                        {transaction.wallet.name}
                    </div>
                )}
            </div>

            <div className={`transaction-amount ${typeColor}`}>
                {transaction.type === 'Expense' && '−'}
                {transaction.type === 'Income' && '+'}
                {formatCurrency(transaction.amount, 'INR')}
            </div>

            <div className="transaction-menu">
                <button
                    className="menu-trigger"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="Transaction options"
                >
                    <MoreVertical size={18} />
                </button>

                {showMenu && (
                    <>
                        <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                        <div className="menu-dropdown">
                            <button className="menu-item" onClick={() => { onEdit(); setShowMenu(false); }}>
                                <Edit size={16} />
                                <span>Edit</span>
                            </button>

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
    );
}
