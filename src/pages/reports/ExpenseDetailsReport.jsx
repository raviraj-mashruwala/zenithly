import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { getCategoryBreakdown } from '../../services/report.service';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PeriodSelector from '../../components/transactions/PeriodSelector';
import Icon from '../../components/ui/Icon';
import './ExpenseDetailsReport.css';

export default function ExpenseDetailsReport() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [threeMonthAverage, setThreeMonthAverage] = useState(0);

    const periodStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const periodEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, currentDate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Get expense categories for current month
            const expenseData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Expense');

            const totalExpense = expenseData.reduce((sum, cat) => sum + cat.total, 0);

            const categoriesWithPercent = expenseData.map(cat => ({
                ...cat,
                percentage: totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0,
            }));

            setCategories(categoriesWithPercent);

            // Calculate 3-month average
            const month1 = await getCategoryBreakdown(
                user.id,
                format(startOfMonth(subMonths(currentDate, 2)), 'yyyy-MM-dd'),
                format(endOfMonth(subMonths(currentDate, 2)), 'yyyy-MM-dd'),
                'Expense'
            );
            const month2 = await getCategoryBreakdown(
                user.id,
                format(startOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd'),
                format(endOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd'),
                'Expense'
            );
            const month3 = expenseData;

            const total1 = month1.reduce((sum, cat) => sum + cat.total, 0);
            const total2 = month2.reduce((sum, cat) => sum + cat.total, 0);
            const total3 = month3.reduce((sum, cat) => sum + cat.total, 0);

            setThreeMonthAverage((total1 + total2 + total3) / 3);
        } catch (error) {
            console.error('Failed to fetch expense data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalExpense = categories.reduce((sum, cat) => sum + cat.total, 0);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dailyAverage = totalExpense / daysInMonth;
    const comparison = threeMonthAverage > 0 ? ((totalExpense - threeMonthAverage) / threeMonthAverage) * 100 : 0;

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
        <div className="page-container report-page expense-report">
            {/* Header */}
            <div className="report-header">
                <div>
                    <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate(-1)} className="mb-4">
                        Back
                    </Button>
                    <h1 className="report-title">Expense Details</h1>
                    <p className="report-subtitle">Track your spending patterns</p>
                </div>

                <div className="flex flex-col gap-4 items-end">
                    {/* Period Selector */}
                    <PeriodSelector currentDate={currentDate} onDateChange={setCurrentDate} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card total-card">
                    <div className="summary-icon expense">
                        <TrendingDown size={64} />
                    </div>
                    <div className="summary-content">
                        <div className="summary-label">Total Expense</div>
                        <div className="summary-value expense">
                            {formatCurrency(totalExpense, 'INR')}
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-content">
                        <div className="summary-label">Daily Average</div>
                        <div className="summary-value">
                            {formatCompactCurrency(dailyAverage, 'INR')}
                        </div>
                        <div className="summary-subtitle">
                            ÷ {daysInMonth} days
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-content">
                        <div className="summary-label">3-Month Average</div>
                        <div className="summary-value">
                            {formatCompactCurrency(threeMonthAverage, 'INR')}
                        </div>
                        <div className={`summary-subtitle ${comparison >= 0 ? 'negative' : 'positive'}`}>
                            {comparison >= 0 ? '+' : ''}{comparison.toFixed(1)}% vs avg
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="breakdown-section">
                <div className="breakdown-header">
                    <h2 className="section-title">Breakdown by Category</h2>
                    <div className="breakdown-total">
                        Total: <span className="total-amount expense">{formatCompactCurrency(totalExpense, 'INR')}</span>
                    </div>
                </div>

                {categories.length > 0 ? (
                    <div className="expense-categories">
                        {categories.map((item, index) => (
                            <div key={index} className="expense-category-item">
                                <div className="category-row">
                                    <div className="category-left">
                                        <div className="category-rank">{index + 1}</div>
                                        <div className="category-icon-box expense">
                                            <Icon iconId={item.category.icon_id || 'circle'} size={20} />
                                        </div>
                                        <div className="category-info-col">
                                            <div className="category-name-text">{item.category.name}</div>
                                            <div className="category-count text-tertiary">
                                                {item.count} transaction{item.count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="category-right">
                                        <div className="category-amount-large expense">
                                            {formatCurrency(item.total, 'INR')}
                                        </div>
                                        <div className="category-percentage">
                                            {item.percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="category-bar-full">
                                    <div
                                        className="category-fill expense"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-breakdown">
                        <p className="text-secondary">No expense transactions for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
}
