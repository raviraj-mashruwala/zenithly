import { Building2, CreditCard, Wallet, Smartphone, TrendingUp, Circle } from 'lucide-react';
import Input from '../ui/Input';
import { WALLET_TYPES } from '../../constants/currencies';
import './OnboardingSteps.css';

const ICON_MAP = {
    'building-2': Building2,
    'credit-card': CreditCard,
    wallet: Wallet,
    smartphone: Smartphone,
    'trending-up': TrendingUp,
    circle: Circle,
};

export default function WalletStep({ walletData, currency, onWalletChange }) {
    const handleChange = (field, value) => {
        onWalletChange({ ...walletData, [field]: value });
    };

    return (
        <div className="step-content-wrapper">
            <h2 className="font-display step-heading">Create Your First Wallet</h2>
            <p className="step-subheading text-secondary">
                A wallet is an account where you keep your money (bank account, credit card, cash, etc.)
            </p>

            <div className="wallet-form">
                <Input
                    label="Wallet Name"
                    placeholder="e.g., Main Bank Account"
                    value={walletData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    fullWidth
                    required
                />

                <div className="form-group">
                    <label className="form-label">Wallet Type</label>
                    <div className="wallet-types">
                        {WALLET_TYPES.map((type) => {
                            const Icon = ICON_MAP[type.icon];
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`wallet-type-option ${walletData.type === type.value ? 'selected' : ''
                                        }`}
                                    onClick={() => handleChange('type', type.value)}
                                >
                                    <Icon size={24} />
                                    <span>{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Input
                    type="number"
                    label="Opening Balance"
                    placeholder="0.00"
                    value={walletData.openingBalance}
                    onChange={(e) => handleChange('openingBalance', parseFloat(e.target.value) || 0)}
                    helperText={`Current balance in ${currency}`}
                    fullWidth
                    step="0.01"
                />

                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="includedInTotal"
                        checked={walletData.includedInTotal}
                        onChange={(e) => handleChange('includedInTotal', e.target.checked)}
                    />
                    <label htmlFor="includedInTotal">
                        Include in total balance
                        <span className="checkbox-help">
                            (Uncheck if you don't want this account counted in your total)
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}
