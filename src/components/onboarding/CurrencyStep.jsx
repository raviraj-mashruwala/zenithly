import { motion } from 'framer-motion';
import { CURRENCY_OPTIONS } from '../../constants/currencies';
import './OnboardingSteps.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function CurrencyStep({ currency, locale, onCurrencyChange, onLocaleChange }) {
    const handleCurrencySelect = (selectedCurrency) => {
        const currencyOption = CURRENCY_OPTIONS.find(opt => opt.code === selectedCurrency);
        onCurrencyChange(selectedCurrency);
        if (currencyOption) {
            onLocaleChange(currencyOption.locale);
        }
    };

    return (
        <div className="step-content-wrapper">
            <h2 className="step-heading">Choose Your Currency</h2>
            <p className="step-subheading">
                This will be your default currency for all transactions. You can't change this later.
            </p>

            <motion.div
                className="currency-grid"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {CURRENCY_OPTIONS.map((option) => (
                    <motion.button
                        key={option.code}
                        variants={item}
                        type="button"
                        className={`currency-option ${currency === option.code ? 'selected' : ''}`}
                        onClick={() => handleCurrencySelect(option.code)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="currency-symbol">{option.symbol}</span>
                        <div className="currency-details">
                            <div className="currency-code">{option.code}</div>
                            <div className="currency-name">{option.name}</div>
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
}
