import { CURRENCY_OPTIONS } from '../../constants/currencies';
import './OnboardingSteps.css';

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
            <h2 className="font-display step-heading">Choose Your Currency</h2>
            <p className="step-subheading text-secondary">
                This will be your default currency for all transactions. You can't change this later.
            </p>

            <div className="currency-grid">
                {CURRENCY_OPTIONS.map((option) => (
                    <button
                        key={option.code}
                        type="button"
                        className={`currency-option ${currency === option.code ? 'selected' : ''}`}
                        onClick={() => handleCurrencySelect(option.code)}
                    >
                        <span className="currency-symbol">{option.symbol}</span>
                        <div className="currency-details">
                            <div className="currency-code">{option.code}</div>
                            <div className="currency-name">{option.name}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
