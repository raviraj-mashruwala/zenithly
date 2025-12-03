import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import { useTransactionStore } from '../../stores/transactionStore';
import { useWalletStore } from '../../stores/walletStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/currency';
import { groupTransactionsByDay, calculateOpeningBalance } from '../../utils/transactions';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TransactionCard from '../../components/transactions/TransactionCard';
import TransactionFormModal from '../../components/transactions/TransactionFormModal';
import PeriodSelector from '../../components/transactions/PeriodSelector';
import './TransactionsList.css';

const TRANSACTION_TYPES = [
    { value: 'all', label: 'All Transactions' },
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Transfer', label: 'Transfer' },
];

export default function TransactionsList() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        transactions,
        stats,
        isLoading,
        fetchTransactions,
        fetchStats,
    } = useTransactionStore();

    const { wallets, fetchWallets, getTotalBalance } = useWalletStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [filters, setFilters] = useState({
        type: 'all',
        walletId: 'all',
        categoryId: 'all',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Calculate period dates
    const periodStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const periodEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    useEffect(() => {
        if (user) {
            const fetchOptions = {
                startDate: periodStart,
                endDate: periodEnd,
            };
            if (filters.type !== 'all') fetchOptions.type = filters.type;
            if (filters.walletId !== 'all') fetchOptions.walletId = filters.walletId;
            if (filters.categoryId !== 'all') fetchOptions.categoryId = filters.categoryId;

            fetchTransactions(fetchOptions);
            fetchStats(periodStart, periodEnd);
            fetchWallets();
            fetchCategories();
        }
    }, [user, currentDate, filters]);

    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSuccess = () => {
        fetchTransactions();
        fetchStats(periodStart, periodEnd);
        handleCloseModal();
        toast.success(editingTransaction ? 'Transaction updated' : 'Transaction added');
    };

    // Group transactions by day
    const groupedTransactions = groupTransactionsByDay(transactions);

    // Calculate balances
    const openingBalance = calculateOpeningBalance(wallets, transactions, periodStart);
    const currentBalance = getTotalBalance();

    if (isLoading && transactions.length === 0) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container transactions-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="font-display">Transactions</h1>
                    <p className="text-secondary">Track all your income and expenses</p>
                </div>
                <Button onClick={handleAddTransaction} leftIcon={<Plus />}>
                    Add Transaction
                </Button>
            </div>

            {/* Period Selector */}
            <PeriodSelector
                currentDate={currentDate}
                onDateChange={setCurrentDate}
            />

            {/* Opening/Closing Balance */}
            <div className="balance-summary">
                <Card padding="md" className="balance-card">
                    <div className="balance-label text-tertiary">Opening Balance</div>
                    <div className="balance-value">{formatCurrency(openingBalance, 'INR')}</div>
                </Card>

                <Card padding="md" className="balance-card current-balance">
                    <div className="balance-label text-tertiary">Current Balance</div>
                    <div className="balance-value accent">{formatCurrency(currentBalance, 'INR')}</div>
                </Card>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <Card padding="md" className="stat-card income-stat">
                        <div className="stat-label text-secondary">Income</div>
                        <div className="stat-value income">
                            {formatCurrency(stats.totalIncome, 'INR')}
                        </div>
                    </Card>

                    <Card padding="md" className="stat-card expense-stat">
                        <div className="stat-label text-secondary">Expense</div>
                        <div className="stat-value expense">
                            {formatCurrency(stats.totalExpense, 'INR')}
                        </div>
                    </Card>

                    <Card padding="md" className="stat-card net-stat">
                        <div className="stat-label text-secondary">Net Income</div>
                        <div className={`stat-value ${stats.netIncome >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(stats.netIncome, 'INR')}
                        </div>
                    </Card>

                    <Card padding="md" className="stat-card count-stat">
                        <div className="stat-label text-secondary">Transactions</div>
                        <div className="stat-value">{stats.transactionCount}</div>
                    </Card>
                </div>
            )}

            {/* Report CTA */}
            <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<BarChart3 />}
                onClick={() => navigate('/reports/expenses')}
            >
                View Detailed Reports
            </Button>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filters-group">
                    <Filter size={20} />
                    <span className="filters-label">Filter:</span>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="filter-select"
                    >
                        {TRANSACTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.walletId}
                        onChange={(e) => setFilters({ ...filters, walletId: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">All Wallets</option>
                        {wallets.filter(w => w.status === 'Active').map(wallet => (
                            <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.categoryId}
                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">All Categories</option>
                        {categories.filter(c => c.is_active).map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Transactions List - Grouped by Day */}
            {groupedTransactions.length > 0 ? (
                <div className="transactions-by-day">
                    {groupedTransactions.map((group) => (
                        <div key={group.date.toISOString()} className="day-group">
                            <div className="day-header">
                                <span className="day-date">
                                    {isSameDay(group.date, new Date())
                                        ? 'Today'
                                        : format(group.date, 'EEEE, MMMM dd')}
                                </span>
                                <span className="day-count text-tertiary">
                                    {group.transactions.length} transaction{group.transactions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="day-transactions">
                                {group.transactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        onEdit={() => handleEditTransaction(transaction)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card padding="xl" className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No Transactions for This Period</h3>
                    <p className="text-secondary">
                        Start tracking your finances by adding your first transaction
                    </p>
                    <Button onClick={handleAddTransaction} leftIcon={<Plus />}>
                        Add Transaction
                    </Button>
                </Card>
            )}

            {/* Transaction Form Modal */}
            {isModalOpen && (
                <TransactionFormModal
                    transaction={editingTransaction}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
