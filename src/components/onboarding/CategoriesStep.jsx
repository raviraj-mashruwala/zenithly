import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../constants/defaultCategories';
import './OnboardingSteps.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function CategoriesStep() {
    const totalCategories =
        DEFAULT_CATEGORIES.expense.length +
        DEFAULT_CATEGORIES.income.length +
        DEFAULT_CATEGORIES.debtLoan.length;

    return (
        <div className="step-content-wrapper">
            <h2 className="step-heading">Default Categories</h2>
            <p className="step-subheading">
                We'll set up these categories to help you organize your transactions immediately.
            </p>

            <motion.div
                className="categories-container"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* Expenses */}
                <motion.div className="category-group" variants={item}>
                    <div className="category-group-header">
                        <div className="category-badge expense">Expenses</div>
                        <span className="category-count">
                            {DEFAULT_CATEGORIES.expense.length} categories
                        </span>
                    </div>
                    <div className="category-chips">
                        {DEFAULT_CATEGORIES.expense.slice(0, 8).map((cat) => (
                            <div key={cat.name} className="category-chip">
                                <Check size={14} className="text-success" />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                        {DEFAULT_CATEGORIES.expense.length > 8 && (
                            <div className="category-chip more">
                                + {DEFAULT_CATEGORIES.expense.length - 8} more
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Income */}
                <motion.div className="category-group" variants={item}>
                    <div className="category-group-header">
                        <div className="category-badge income">Income</div>
                        <span className="category-count">
                            {DEFAULT_CATEGORIES.income.length} categories
                        </span>
                    </div>
                    <div className="category-chips">
                        {DEFAULT_CATEGORIES.income.slice(0, 8).map((cat) => (
                            <div key={cat.name} className="category-chip">
                                <Check size={14} className="text-success" />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                        {DEFAULT_CATEGORIES.income.length > 8 && (
                            <div className="category-chip more">
                                + {DEFAULT_CATEGORIES.income.length - 8} more
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Debt & Loans */}
                <motion.div className="category-group" variants={item}>
                    <div className="category-group-header">
                        <div className="category-badge debt">Debt & Loans</div>
                        <span className="category-count">
                            {DEFAULT_CATEGORIES.debtLoan.length} categories
                        </span>
                    </div>
                    <div className="category-chips">
                        {DEFAULT_CATEGORIES.debtLoan.map((cat) => (
                            <div key={cat.name} className="category-chip">
                                <Check size={14} className="text-success" />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="summary-footer" variants={item}>
                    <div className="summary-stat">{totalCategories}</div>
                    <div className="summary-text">Total Categories Ready</div>
                </motion.div>
            </motion.div>
        </div>
    );
}
