import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ChevronRight, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { getCategoryBreakdown } from '../../services/report.service';
import { formatCompactCurrency } from '../../utils/currency';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PeriodSelector from '../../components/transactions/PeriodSelector';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import './ReportsOverview.css';

export default function ReportsOverview() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { stats, fetchStats } = useTransactionStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);

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
            await fetchStats(periodStart, periodEnd);

            const incomeData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Income');
            const expenseData = await getCategoryBreakdown(user.id, periodStart, periodEnd, 'Expense');

            setIncomeCategories(incomeData);
            setExpenseCategories(expenseData);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setIsLoading(false);
        }
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
            <div className="report-header">
                <div>
                    <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate('/dashboard')} className="mb-4">
                        Back to Dashboard
                    </Button>
                    <h1 className="report-title">Financial Reports</h1>
                    <p className="report-subtitle">Overview & Analysis</p>
                </div>

                <div className="flex flex-col gap-4 items-end">
                    <PeriodSelector currentDate={currentDate} onDateChange={setCurrentDate} />
                </div>
            </div>

            {/* Net Income Card */}
            <div className="net-income-card">
                <div className="net-income-header">
                    <div className="net-income-icon">
                        <TrendingUp size={32} />
                    </div>
                    <div className="flex-1">
                        <div className="net-income-label">
                            Net Income
                            <HelpCircle size={14} className="text-tertiary cursor-help" />
                        </div>
                        <div className={`net-income-value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                            {formatCompactCurrency(netIncome, 'INR')}
                        </div>
                        <div className="text-sm text-tertiary tracking-wider uppercase">
                            Income - Expense for {format(currentDate, 'MMMM yyyy')}
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Category Reports Section */}
            <div className="category-reports-section">
                <h2 className="section-title">Category Report</h2>

                <div className="category-reports-grid">
                    {/* Income Report Card */}
                    <div
                        className="report-category-card income cursor-pointer group"
                        onClick={() => navigate('/reports/income')}
                    >
                        <div className="category-card-header">
                            <div>
                                <div className="category-card-label">Income</div>
                                <div className="category-card-amount">
                                    {formatCompactCurrency(totalIncome, 'INR')}
                                </div>
                            </div>
                            <ChevronRight className="text-tertiary group-hover:text-accent-secondary transition-colors" />
                        </div>

                        <div className="chart-visual">
                            <CategoryPieChart data={incomeCategories} type="income" />
                        </div>

                        <div className="card-action">
                            See report by categories
                        </div>
                    </div>

                    {/* Expense Report Card */}
                    <div
                        className="report-category-card expense cursor-pointer group"
                        onClick={() => navigate('/reports/expenses')}
                    >
                        <div className="category-card-header">
                            <div>
                                <div className="category-card-label">Expense</div>
                                <div className="category-card-amount">
                                    {formatCompactCurrency(totalExpense, 'INR')}
                                </div>
                            </div>
                            <ChevronRight className="text-tertiary group-hover:text-error transition-colors" />
                        </div>

                        <div className="chart-visual">
                            <CategoryPieChart data={expenseCategories} type="expense" />
                        </div>

                        <div className="card-action">
                            See report by categories
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
