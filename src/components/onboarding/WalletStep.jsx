import { Building2, CreditCard, Wallet, Smartphone, TrendingUp, Circle, Check } from 'lucide-react';
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
            <h2 className="step-heading">Create Your First Wallet</h2>
            <p className="step-subheading">
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
                    <label className="text-sm font-medium text-primary mb-2 block">Wallet Type</label>
                    <div className="wallet-types-grid">
                        {WALLET_TYPES.map((type) => {
                            const Icon = ICON_MAP[type.icon];
                            const isSelected = walletData.type === type.value;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`wallet-type-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleChange('type', type.value)}
                                >
                                    <Icon size={24} className={isSelected ? 'text-accent' : 'text-tertiary'} />
                                    <span className={`wallet-type-label ${isSelected ? 'text-accent' : 'text-secondary'}`}>
                                        {type.label}
                                    </span>
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

                <div
                    className="checkbox-wrapper"
                    onClick={() => handleChange('includedInTotal', !walletData.includedInTotal)}
                >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${walletData.includedInTotal ? 'bg-accent border-accent text-white' : 'border-default bg-surface'
                        }`}>
                        {walletData.includedInTotal && <Check size={14} />}
                    </div>
                    <div className="checkbox-content">
                        <span className="checkbox-label">Include in total balance</span>
                        <span className="checkbox-help">
                            Uncheck if you don't want this account counted in your total
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
