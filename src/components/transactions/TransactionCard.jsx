import { MoreVertical, Edit, Trash2, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useTransactionStore } from '../../stores/transactionStore';
import { formatCurrency } from '../../utils/currency';
import Card from '../ui/Card';
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
        <Card className="transaction-card" hover>
            <div className="transaction-main">
                <div className="transaction-left">
                    <div className={`transaction-icon ${typeColor}`}>
                        {transaction.category?.icon_id ? (
                            <Icon iconId={transaction.category.icon_id} size={20} />
                        ) : (
                            getTypeIcon(transaction.type)
                        )}
                    </div>

                    <div className="transaction-details">
                        <div className="transaction-description">
                            {transaction.description || `${transaction.type} Transaction`}
                        </div>

                        <div className="transaction-meta text-tertiary">
                            {transaction.type === 'Transfer' ? (
                                <span>
                                    {transaction.from_wallet?.name} → {transaction.to_wallet?.name}
                                </span>
                            ) : (
                                <>
                                    {transaction.wallet?.name && <span>{transaction.wallet.name}</span>}
                                    {transaction.category?.name && <span> • {transaction.category.name}</span>}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="transaction-right">
                    <div className={`transaction-amount ${typeColor}`}>
                        {transaction.type === 'Expense' && '−'}
                        {transaction.type === 'Income' && '+'}
                        {formatCurrency(transaction.amount, 'INR')}
                    </div>

                    <div className="transaction-date text-tertiary">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </div>
                </div>
            </div>

            <div className="transaction-menu">
                <button
                    className="menu-trigger"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="Transaction options"
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

                            <div className="menu-divider" />

                            <button className="menu-item danger" onClick={handleDelete}>
                                <Trash2 size={16} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
