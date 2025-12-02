import { Check } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../constants/defaultCategories';
import './OnboardingSteps.css';

export default function CategoriesStep() {
    const totalCategories =
        DEFAULT_CATEGORIES.expense.length +
        DEFAULT_CATEGORIES.income.length +
        DEFAULT_CATEGORIES.debtLoan.length;

    return (
        <div className="step-content-wrapper">
            <h2 className="font-display step-heading">Default Categories</h2>
            <p className="step-subheading text-secondary">
                We'll set up these categories to help you organize your transactions
            </p>

            <div className="categories-preview">
                <div className="category-section">
                    <div className="category-section-header">
                        <div className="category-badge expense">Expenses</div>
                        <span className="category-count">
                            {DEFAULT_CATEGORIES.expense.length} categories
                        </span>
                    </div>
                    <div className="category-list">
                        {DEFAULT_CATEGORIES.expense.slice(0, 6).map((cat) => (
                            <div key={cat.name} className="category-item">
                                <Check size={16} />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                        {DEFAULT_CATEGORIES.expense.length > 6 && (
                            <div className="category-item more">
                                + {DEFAULT_CATEGORIES.expense.length - 6} more
                            </div>
                        )}
                    </div>
                </div>

                <div className="category-section">
                    <div className="category-section-header">
                        <div className="category-badge income">Income</div>
                        <span className="category-count">
                            {DEFAULT_CATEGORIES.income.length} categories
                        </span>
                    </div>
                    <div className="category-list">
                        {DEFAULT_CATEGORIES.income.slice(0, 5).map((cat) => (
                            <div key={cat.name} className="category-item">
                                <Check size={16} />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                        {DEFAULT_CATEGORIES.income.length > 5 && (
                            <div className="category-item more">
                                + {DEFAULT_CATEGORIES.income.length - 5} more
                            </div>
                        )}
                    </div>
                </div>

                <div className="category-section">
                    <div className="category-section-header">
                        <div className="category-badge debt">Debt & Loans</div>
                        <span className="category-count">
                            {DEFAULT_CATEGORIES.debtLoan.length} categories
                        </span>
                    </div>
                    <div className="category-list">
                        {DEFAULT_CATEGORIES.debtLoan.map((cat) => (
                            <div key={cat.name} className="category-item">
                                <Check size={16} />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="categories-summary">
                <div className="summary-card">
                    <div className="summary-number">{totalCategories}</div>
                    <div className="summary-label">Total Categories</div>
                </div>
                <p className="summary-note text-secondary">
                    You can add, edit, or remove categories anytime from settings
                </p>
            </div>
        </div>
    );
}
