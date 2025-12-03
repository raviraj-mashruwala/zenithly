import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek } from 'date-fns';
import { useWalletStore } from '../stores/walletStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useAuthStore } from '../stores/authStore';
import { getTopSpendingCategories } from '../services/report.service';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Icon from '../components/ui/Icon';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { wallets, isLoading: walletsLoading, fetchWallets, getTotalBalance } = useWalletStore();
    const { transactions, stats, fetchTransactions, fetchStats } = useTransactionStore();

    const [showBalance, setShowBalance] = useState(true);
    const [topCategories, setTopCategories] = useState([]);
    const [categoryPeriod, setCategoryPeriod] = useState('month'); // 'week' or 'month'

    // Current month date range
    const currentMonth = {
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    };

    useEffect(() => {
        if (user) {
            fetchWallets();
            fetchTransactions({ limit: 5 });
            fetchStats(currentMonth.start, currentMonth.end);
        }
    }, [user, fetchWallets, fetchTransactions, fetchStats]);

    // Fetch top spending categories
    useEffect(() => {
        if (user) {
            const fetchTopCategories = async () => {
                const endDate = format(new Date(), 'yyyy-MM-dd');
                const startDate = categoryPeriod === 'week'
                    ? format(startOfWeek(new Date()), 'yyyy-MM-dd')
                    : currentMonth.start;

                try {
                    const categories = await getTopSpendingCategories(user.id, startDate, endDate, 3);
                    setTopCategories(categories);
                } catch (error) {
                    console.error('Failed to fetch top categories:', error);
                }
            };

            fetchTopCategories();
        }
    }, [user, categoryPeriod]);

    const totalBalance = getTotalBalance();
    const activeWallets = wallets.filter(w => w.status === 'Active');
    const recentTransactions = transactions.slice(0, 5);
    const netIncome = stats ? stats.netIncome : 0;

    if (walletsLoading && wallets.length === 0) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container dashboard-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="font-display">Dashboard</h1>
                    <p className="text-secondary">Your financial overview</p>
                </div>
                <Button onClick={() => navigate('/transactions')} leftIcon={<Plus />}>
                    Add Transaction
                </Button>
            </div>

            {/* Total Balance Card */}
            <Card variant="elevated" padding="lg" className="total-balance-widget">
                <div className="balance-header">
                    <div>
                        <div className="balance-label text-secondary">Total Balance</div>
                        <div className="balance-amount">
                            {showBalance ? (
                                formatCompactCurrency(totalBalance, 'INR')
                            ) : (
                                <span className="masked-amount">••••••</span>
                            )}
                        </div>
                        <div className="balance-wallets text-tertiary">
                            {activeWallets.filter(w => w.included_in_total).length} wallets included
                        </div>
                    </div>
                    <button
                        className="balance-toggle"
                        onClick={() => setShowBalance(!showBalance)}
                        aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    >
                        {showBalance ? <Eye size={24} /> : <EyeOff size={24} />}
                    </button>
                </div>
            </Card>

            {/* Stats Grid */}
            {stats && (
                <div className="stats-grid">
                    <Card padding="md" className="stat-card income-card">
                        <div className="stat-icon income">
                            <ArrowUpRight size={20} />
                        </div>
                        <div className="stat-label text-secondary">This Month Income</div>
                        <div className="stat-value income">
                            {formatCompactCurrency(stats.totalIncome, 'INR')}
                        </div>
                    </Card>

                    <Card padding="md" className="stat-card expense-card">
                        <div className="stat-icon expense">
                            <ArrowDownRight size={20} />
                        </div>
                        <div className="stat-label text-secondary">This Month Expense</div>
                        <div className="stat-value expense">
                            {formatCompactCurrency(stats.totalExpense, 'INR')}
                        </div>
                    </Card>

                    <Card padding="md" className="stat-card net-card">
                        <div className="stat-icon">
                            <TrendingUp size={20} />
                        </div>
                        <div className="stat-label text-secondary">Net Income</div>
                        <div className={`stat-value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                            {formatCompactCurrency(netIncome, 'INR')}
                        </div>
                    </Card>

                    <Card padding="md" className="stat-card report-cta-card" hover onClick={() => navigate('/reports/income')}>
                        <div className="stat-icon">
                            <BarChart3 size={20} />
                        </div>
                        <div className="stat-label text-secondary">View Reports</div>
                        <div className="stat-cta">Detailed Analysis →</div>
                    </Card>
                </div>
            )}

            <div className="dashboard-grid">
                {/* My Wallets Widget */}
                <Card className="dashboard-widget">
                    <div className="widget-header">
                        <h2 className="widget-title">My Wallets</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/wallets')}>
                            View All
                        </Button>
                    </div>

                    {activeWallets.length > 0 ? (
                        <div className="wallets-list">
                            {activeWallets.slice(0, 4).map((wallet) => (
                                <div key={wallet.id} className="wallet-item">
                                    <div className="wallet-info">
                                        <div className="wallet-icon-small">
                                            <Icon iconId={wallet.icon_id || 'wallet'} size={20} />
                                        </div>
                                        <div className="wallet-details">
                                            <div className="wallet-name">{wallet.name}</div>
                                            <div className="wallet-type text-tertiary">{wallet.type}</div>
                                        </div>
                                    </div>
                                    <div className="wallet-balance">
                                        {showBalance ? formatCurrency(wallet.current_balance, 'INR') : '••••'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-widget">
                            <p className="text-secondary">No wallets yet</p>
                            <Button size="sm" onClick={() => navigate('/wallets')}>
                                Add Wallet
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Top Spending Categories Widget */}
                <Card className="dashboard-widget">
                    <div className="widget-header">
                        <h2 className="widget-title">Top Spending</h2>
                        <div className="period-tabs">
                            <button
                                className={`period-tab ${categoryPeriod === 'week' ? 'active' : ''}`}
                                onClick={() => setCategoryPeriod('week')}
                            >
                                Week
                            </button>
                            <button
                                className={`period-tab ${categoryPeriod === 'month' ? 'active' : ''}`}
                                onClick={() => setCategoryPeriod('month')}
                            >
                                Month
                            </button>
                        </div>
                    </div>

                    {topCategories.length > 0 ? (
                        <div className="top-categories-list">
                            {topCategories.map((item) => (
                                <div key={item.category.id} className="category-spending-item">
                                    <div className="category-info">
                                        <div className="category-icon-small expense">
                                            <Icon iconId={item.category.icon_id || 'circle'} size={16} />
                                        </div>
                                        <div className="category-details">
                                            <div className="category-name-spending">{item.category.name}</div>
                                            <div className="category-percentage text-tertiary">
                                                {item.percentage.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="category-amount">
                                        {formatCompactCurrency(item.total, 'INR')}
                                    </div>
                                    <div className="category-bar-container">
                                        <div
                                            className="category-bar"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                fullWidth
                                onClick={() => navigate('/reports/expenses')}
                            >
                                View Details
                            </Button>
                        </div>
                    ) : (
                        <div className="empty-widget">
                            <p className="text-secondary">No expenses yet</p>
                            <Button size="sm" onClick={() => navigate('/transactions')}>
                                Add Expense
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Recent Transactions Widget */}
                <Card className="dashboard-widget">
                    <div className="widget-header">
                        <h2 className="widget-title">Recent Transactions</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                            View All
                        </Button>
                    </div>

                    {recentTransactions.length > 0 ? (
                        <div className="transactions-list-widget">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="transaction-item-widget">
                                    <div className="transaction-info">
                                        <div className={`transaction-icon-small ${transaction.type.toLowerCase()}`}>
                                            {transaction.category?.icon_id ? (
                                                <Icon iconId={transaction.category.icon_id} size={16} />
                                            ) : (
                                                transaction.type === 'Income' ? <ArrowUpRight size={16} /> :
                                                    transaction.type === 'Expense' ? <ArrowDownRight size={16} /> : <Wallet size={16} />
                                            )}
                                        </div>
                                        <div className="transaction-details">
                                            <div className="transaction-desc">
                                                {transaction.description || `${transaction.type} Transaction`}
                                            </div>
                                            <div className="transaction-date text-tertiary">
                                                {format(new Date(transaction.date), 'MMM dd')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount-widget ${transaction.type.toLowerCase()}`}>
                                        {transaction.type === 'Expense' && '−'}
                                        {transaction.type === 'Income' && '+'}
                                        {formatCompactCurrency(transaction.amount, 'INR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-widget">
                            <p className="text-secondary">No transactions yet</p>
                            <Button size="sm" onClick={() => navigate('/transactions')}>
                                Add Transaction
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Empty State for New Users */}
            {activeWallets.length === 0 && (
                <Card padding="xl" className="empty-state-dashboard">
                    <div className="empty-icon">🎯</div>
                    <h3>Welcome to MonoLife!</h3>
                    <p className="text-secondary">
                        Get started by creating your first wallet and start tracking your finances
                    </p>
                    <div className="empty-actions">
                        <Button onClick={() => navigate('/wallets')} leftIcon={<Plus />}>
                            Add Wallet
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/categories')}>
                            Setup Categories
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
