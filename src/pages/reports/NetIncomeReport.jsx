import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
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
import './NetIncomeReport.css';

export default function NetIncomeReport() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { stats, fetchStats } = useTransactionStore();
    const { wallets, fetchWallets } = useWalletStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWallet, setSelectedWallet] = useState('all');
    const [incomeCategories, setIncomeCategories] = useState([]);
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

            const incomeData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Income');

            // Calculate percentages
            const totalIncome = incomeData.reduce((sum, cat) => sum + cat.total, 0);

            const incomeWithPercent = incomeData.map(cat => ({
                ...cat,
                percentage: totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0,
            }));

            // Group small categories
            const groupedIncome = groupSmallCategories(incomeWithPercent);

            setIncomeCategories(groupedIncome);
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

    const totalIncome = stats ? stats.totalIncome : 0;

    // Calculate averages
    const daysInMonth = differenceInDays(endOfMonth(currentDate), startOfMonth(currentDate)) + 1;
    const dailyAverage = totalIncome / daysInMonth;
    // For now, 3-month average is just a placeholder or could be calculated if we fetched more data
    // We'll stick to daily average for consistency with the expense report style

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
        <div className="page-container report-page">
            {/* Header */}
            <div className="report-header">
                <div>
                    <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate('/reports')} className="mb-4">
                        Back to Reports
                    </Button>
                    <h1 className="report-title">Income Details</h1>
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
                        <span className="summary-label">Total Income</span>
                        <TrendingUp className="summary-icon" size={20} />
                    </div>
                    <div className="summary-value">
                        {formatCompactCurrency(totalIncome, 'INR')}
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
                        <span className="summary-label">Top Source</span>
                        <BarChart3 className="summary-icon" size={20} />
                    </div>
                    <div className="summary-value text-xl">
                        {incomeCategories.length > 0 ? incomeCategories[0].category.name : '-'}
                    </div>
                </div>
            </div>

            {/* Breakdown Section */}
            <div className="breakdown-section">
                <div className="section-header">
                    <h2 className="section-title">Breakdown by Category</h2>
                </div>

                {incomeCategories.length > 0 ? (
                    <div className="category-list">
                        {incomeCategories.map((item, index) => (
                            <div key={index} className="income-category-item">
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
                        No income transactions found for this period
                    </div>
                )}
            </div>
        </div>
    );
}
