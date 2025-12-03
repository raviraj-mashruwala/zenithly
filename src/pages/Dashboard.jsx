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
    const [categoryPeriod, setCategoryPeriod] = useState('month');

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
            <div className="empty-state" style={{ height: '24rem' }}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Your financial command center</p>
                </div>
                <Button onClick={() => navigate('/transactions')} variant="primary">
                    <Plus size={18} /> Add Transaction
                </Button>
            </div>

            {/* Total Balance Card */}
            <Card className="balance-card">
                <div className="balance-icon">
                    <Wallet size={120} />
                </div>

                <div className="balance-content">
                    <div className="balance-header">
                        <div className="balance-label">Total Balance</div>
                        <button onClick={() => setShowBalance(!showBalance)} className="balance-toggle">
                            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>

                    <div className="balance-amount">
                        {showBalance ? formatCompactCurrency(totalBalance, 'INR') : '••••••'}
                    </div>

                    <div className="balance-status">
                        <div className="status-indicator" />
                        {activeWallets.filter(w => w.included_in_total).length} active wallets connected
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            {stats && (
                <div className="stats-grid">
                    <Card className="stat-card income-card">
                        <div className="stat-header">
                            <div className="stat-icon income">
                                <ArrowUpRight size={20} />
                            </div>
                            <span className="stat-label">Income</span>
                        </div>
                        <div className="stat-value">
                            {formatCompactCurrency(stats.totalIncome, 'INR')}
                        </div>
                    </Card>

                    <Card className="stat-card expense-card">
                        <div className="stat-header">
                            <div className="stat-icon expense">
                                <ArrowDownRight size={20} />
                            </div>
                            <span className="stat-label">Expense</span>
                        </div>
                        <div className="stat-value">
                            {formatCompactCurrency(stats.totalExpense, 'INR')}
                        </div>
                    </Card>

                    <Card className="stat-card net-card">
                        <div className="stat-header">
                            <div className="stat-icon net">
                                <TrendingUp size={20} />
                            </div>
                            <span className="stat-label">Net Flow</span>
                        </div>
                        <div className={`stat-value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                            {formatCompactCurrency(netIncome, 'INR')}
                        </div>
                    </Card>

                    <Card className="stat-card clickable" onClick={() => navigate('/reports/income')}>
                        <div className="stat-cta">
                            <div className="stat-cta-content">
                                <div className="stat-icon neutral">
                                    <BarChart3 size={20} />
                                </div>
                                <span className="stat-cta-label">View Reports</span>
                            </div>
                            <ArrowUpRight size={18} className="stat-cta-label" />
                        </div>
                    </Card>
                </div>
            )}

            <div className="dashboard-grid">
                {/* My Wallets Widget */}
                <Card className="widget">
                    <div className="widget-header">
                        <h2 className="widget-title">My Wallets</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/wallets')}>
                            View All
                        </Button>
                    </div>

                    {activeWallets.length > 0 ? (
                        <div className="wallet-list">
                            {activeWallets.slice(0, 4).map((wallet) => (
                                <div key={wallet.id} className="wallet-item">
                                    <div className="wallet-info">
                                        <div className="wallet-icon">
                                            <Icon iconId={wallet.icon_id || 'wallet'} size={18} />
                                        </div>
                                        <div className="wallet-details">
                                            <div className="wallet-name">{wallet.name}</div>
                                            <div className="wallet-type">{wallet.type}</div>
                                        </div>
                                    </div>
                                    <div className="wallet-balance">
                                        {showBalance ? formatCurrency(wallet.current_balance, 'INR') : '••••'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-message">No wallets initialized</p>
                            <Button size="sm" onClick={() => navigate('/wallets')}>
                                Create Wallet
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Top Spending Categories Widget */}
                <Card className="widget">
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
                        <div className="category-list">
                            {topCategories.map((item) => (
                                <div key={item.category.id} className="category-item">
                                    <div className="category-header">
                                        <div className="category-name">
                                            <div className="category-dot" />
                                            <span>{item.category.name}</span>
                                        </div>
                                        <div className="category-amount">
                                            {formatCompactCurrency(item.total, 'INR')}
                                        </div>
                                    </div>
                                    <div className="category-bar">
                                        <div className="category-bar-fill" style={{ width: `${item.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                            <div style={{ paddingTop: '1rem', marginTop: 'auto' }}>
                                <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/reports/expenses')}>
                                    Detailed Analysis
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-message">No data recorded</p>
                            <Button size="sm" onClick={() => navigate('/transactions')}>
                                Log Expense
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Recent Transactions Widget */}
                <Card className="widget">
                    <div className="widget-header">
                        <h2 className="widget-title">Recent Activity</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                            History
                        </Button>
                    </div>

                    {recentTransactions.length > 0 ? (
                        <div className="transaction-list">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="transaction-item">
                                    <div className="transaction-info">
                                        <div className={`transaction-icon ${transaction.type.toLowerCase()}`}>
                                            {transaction.category?.icon_id ? (
                                                <Icon iconId={transaction.category.icon_id} size={14} />
                                            ) : (
                                                transaction.type === 'Income' ? <ArrowUpRight size={14} /> :
                                                    transaction.type === 'Expense' ? <ArrowDownRight size={14} /> : <Wallet size={14} />
                                            )}
                                        </div>
                                        <div className="transaction-details">
                                            <div className="transaction-description">
                                                {transaction.description || transaction.type}
                                            </div>
                                            <div className="transaction-date">
                                                {format(new Date(transaction.date), 'MMM dd')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${transaction.type.toLowerCase()}`}>
                                        {transaction.type === 'Expense' && '−'}
                                        {transaction.type === 'Income' && '+'}
                                        {formatCompactCurrency(transaction.amount, 'INR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-message">No activity yet</p>
                            <Button size="sm" onClick={() => navigate('/transactions')}>
                                New Entry
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Empty State for New Users */}
            {activeWallets.length === 0 && (
                <Card className="welcome-card">
                    <div className="empty-icon">🚀</div>
                    <h3 className="welcome-title">Welcome to Zenithly</h3>
                    <p className="welcome-message">
                        Initialize your financial command center by creating your first wallet.
                    </p>
                    <div className="empty-actions">
                        <Button onClick={() => navigate('/wallets')}>
                            <Plus size={16} /> Create Wallet
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/categories')}>
                            Configure Categories
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
