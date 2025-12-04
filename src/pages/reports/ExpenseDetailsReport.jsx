import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { useWalletStore } from '../../stores/walletStore';
import { getCategoryBreakdown } from '../../services/report.service';
import { formatCompactCurrency } from '../../utils/currency';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PeriodSelector from '../../components/transactions/PeriodSelector';
import Icon from '../../components/ui/Icon';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import './ExpenseDetailsReport.css';

export default function ExpenseDetailsReport() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { stats, fetchStats } = useTransactionStore();
    const { wallets, fetchWallets } = useWalletStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWallet, setSelectedWallet] = useState('all');
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const periodStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const periodEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    useEffect(() => {
        if (user) {
            fetchWallets();
            fetchData();
        }
    }, [user, currentDate, selectedWallet]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await fetchStats(periodStart, periodEnd);

            const expenseData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Expense');

            // Calculate percentages
            const totalExpense = expenseData.reduce((sum, cat) => sum + cat.total, 0);

            const expenseWithPercent = expenseData.map(cat => ({
                ...cat,
                percentage: totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0,
            }));

            // Group small categories
            const groupedExpense = groupSmallCategories(expenseWithPercent);

            setExpenseCategories(groupedExpense);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Group categories with <3% into "Others"
    const groupSmallCategories = (categories) => {
        const significant = categories.filter(cat => cat.percentage >= 3);
        const small = categories.filter(cat => cat.percentage < 3);

        if (small.length === 0) return significant;

        const othersTotal = small.reduce((sum, cat) => sum + cat.total, 0);
        const othersPercentage = small.reduce((sum, cat) => sum + cat.percentage, 0);

        return [
            ...significant,
            {
                category: { name: 'Others', icon_id: 'more-horizontal' },
                total: othersTotal,
                count: small.reduce((sum, cat) => sum + cat.count, 0),
                percentage: othersPercentage,
            },
        ];
    };

    const totalExpense = stats ? stats.totalExpense : 0;

    // Calculate averages
    const daysInMonth = differenceInDays(endOfMonth(currentDate), startOfMonth(currentDate)) + 1;
    const dailyAverage = totalExpense / daysInMonth;

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container report-page expense-details-report">
            {/* Header */}
            <div className="report-header">
                <div>
                    <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate('/reports')} className="mb-4">
                        Back to Reports
                    </Button>
                    <h1 className="report-title">Expense Details</h1>
                    <p className="report-subtitle">Breakdown for {format(currentDate, 'MMMM yyyy')}</p>
                </div>

                <div className="flex flex-col gap-4 items-end">
                    {/* Period Selector */}
                    <PeriodSelector currentDate={currentDate} onDateChange={setCurrentDate} />

                    {/* Wallet Filter */}
                    <div className="wallet-filter">
                        <label className="filter-label">Wallet:</label>
                        <select
                            value={selectedWallet}
                            onChange={(e) => setSelectedWallet(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Wallets</option>
                            {wallets.filter(w => w.status === 'Active').map(wallet => (
                                <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card total">
                    <div className="summary-card-header">
                        <span className="summary-label">Total Expense</span>
                        <TrendingDown className="summary-icon" size={20} />
                    </div>
                    <div className="summary-value">
                        {formatCompactCurrency(totalExpense, 'INR')}
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-card-header">
                        <span className="summary-label">Daily Average</span>
                        <Calendar className="summary-icon" size={20} />
                    </div>
                    <div className="summary-value">
                        {formatCompactCurrency(dailyAverage, 'INR')}
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-card-header">
                        <span className="summary-label">Top Spending</span>
                        <BarChart3 className="summary-icon" size={20} />
                    </div>
                    <div className="summary-value text-xl">
                        {expenseCategories.length > 0 ? expenseCategories[0].category.name : '-'}
                    </div>
                </div>
            </div>

            {/* Breakdown Section */}
            <div className="breakdown-section">
                <div className="section-header">
                    <h2 className="section-title">Breakdown by Category</h2>
                </div>

                {/* Chart Section */}
                <div className="mb-8 flex justify-center">
                    <div className="w-full max-w-md">
                        <CategoryPieChart data={expenseCategories} type="expense" />
                    </div>
                </div>

                {expenseCategories.length > 0 ? (
                    <div className="category-list">
                        {expenseCategories.map((item, index) => (
                            <div key={index} className="category-item">
                                <div className="category-header">
                                    <div className="category-info">
                                        <div className="category-icon">
                                            <Icon iconId={item.category.icon_id || 'circle'} size={18} />
                                        </div>
                                        <span className="category-name">{item.category.name}</span>
                                    </div>
                                    <div className="category-stats">
                                        <span className="category-amount">
                                            {formatCompactCurrency(item.total, 'INR')}
                                        </span>
                                        <span className="category-percentage">
                                            {item.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-tertiary">
                        No expense transactions found for this period
                    </div>
                )}
            </div>
        </div>
    );
}
