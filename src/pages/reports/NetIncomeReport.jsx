import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { useWalletStore } from '../../stores/walletStore';
import { getCategoryBreakdown } from '../../services/report.service';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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

            const incomeData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Income');
            const expenseData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Expense');

            // Calculate percentages
            const totalIncome = incomeData.reduce((sum, cat) => sum + cat.total, 0);
            const totalExpense = expenseData.reduce((sum, cat) => sum + cat.total, 0);

            const incomeWithPercent = incomeData.map(cat => ({
                ...cat,
                percentage: totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0,
            }));

            const expenseWithPercent = expenseData.map(cat => ({
                ...cat,
                percentage: totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0,
            }));

            // Group small categories
            const groupedIncome = groupSmallCategories(incomeWithPercent);
            const groupedExpense = groupSmallCategories(expenseWithPercent);

            setIncomeCategories(groupedIncome);
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

    const netIncome = stats ? stats.netIncome : 0;
    const totalIncome = stats ? stats.totalIncome : 0;
    const totalExpense = stats ? stats.totalExpense : 0;
    const maxAmount = Math.max(totalIncome, totalExpense);

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
            <div className="page-header">
                <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
                    Back
                </Button>
                <div>
                    <h1 className="font-display">Net Income Report</h1>
                    <p className="text-secondary">Income vs Expense breakdown</p>
                </div>
                <div></div>
            </div>

            {/* Period Selector */}
            <PeriodSelector currentDate={currentDate} onDateChange={setCurrentDate} />

            {/* Wallet Filter */}
            <div className="wallet-filter">
                <label className="filter-label">Filter by Wallet:</label>
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

            {/* Net Income Card */}
            <Card padding="lg" className="net-income-card">
                <div className="net-income-header">
                    <div className="net-income-icon">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <div className="net-income-label">Net Income</div>
                        <div className={`net-income-value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                            {formatCompactCurrency(netIncome, 'INR')}
                        </div>
                        <div className="net-income-subtitle text-tertiary">
                            Income - Expense for {format(currentDate, 'MMMM yyyy')}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Income vs Expense Bars */}
            <div className="comparison-section">
                <h2 className="section-title">Income vs Expense</h2>

                <div className="comparison-bars">
                    <div className="comparison-row">
                        <div className="comparison-label">
                            <ArrowUpRight className="income-icon" size={20} />
                            <span>Income</span>
                        </div>
                        <div className="comparison-bar-container">
                            <div
                                className="comparison-bar income"
                                style={{ width: maxAmount > 0 ? `${(totalIncome / maxAmount) * 100}%` : '0%' }}
                            />
                        </div>
                        <div className="comparison-amount income">
                            {formatCompactCurrency(totalIncome, 'INR')}
                        </div>
                    </div>

                    <div className="comparison-row">
                        <div className="comparison-label">
                            <ArrowDownRight className="expense-icon" size={20} />
                            <span>Expense</span>
                        </div>
                        <div className="comparison-bar-container">
                            <div
                                className="comparison-bar expense"
                                style={{ width: maxAmount > 0 ? `${(totalExpense / maxAmount) * 100}%` : '0%' }}
                            />
                        </div>
                        <div className="comparison-amount expense">
                            {formatCompactCurrency(totalExpense, 'INR')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdowns */}
            <div className="categories-grid">
                {/* Income Categories */}
                <Card className="category-breakdown-card">
                    <h3 className="breakdown-title">Income by Category</h3>
                    {incomeCategories.length > 0 ? (
                        <div className="category-list">
                            {incomeCategories.map((item, index) => (
                                <div key={index} className="category-item">
                                    <div className="category-header">
                                        <div className="category-info-row">
                                            <div className="category-icon-container income">
                                                <Icon iconId={item.category.icon_id || 'circle'} size={16} />
                                            </div>
                                            <span className="category-name">{item.category.name}</span>
                                        </div>
                                        <div className="category-values">
                                            <span className="category-amount income">
                                                {formatCompactCurrency(item.total, 'INR')}
                                            </span>
                                            <span className="category-percent text-tertiary">
                                                {item.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="category-progress-bar">
                                        <div
                                            className="category-progress income"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary text-center">No income transactions</p>
                    )}
                </Card>

                {/* Expense Categories */}
                <Card className="category-breakdown-card">
                    <h3 className="breakdown-title">Expense by Category</h3>
                    {expenseCategories.length > 0 ? (
                        <div className="category-list">
                            {expenseCategories.map((item, index) => (
                                <div key={index} className="category-item">
                                    <div className="category-header">
                                        <div className="category-info-row">
                                            <div className="category-icon-container expense">
                                                <Icon iconId={item.category.icon_id || 'circle'} size={16} />
                                            </div>
                                            <span className="category-name">{item.category.name}</span>
                                        </div>
                                        <div className="category-values">
                                            <span className="category-amount expense">
                                                {formatCompactCurrency(item.total, 'INR')}
                                            </span>
                                            <span className="category-percent text-tertiary">
                                                {item.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="category-progress-bar">
                                        <div
                                            className="category-progress expense"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary text-center">No expense transactions</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
