import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CurrencyStep from '../../components/onboarding/CurrencyStep';
import WalletStep from '../../components/onboarding/WalletStep';
import CategoriesStep from '../../components/onboarding/CategoriesStep';
import { DEFAULT_CATEGORIES } from '../../constants/defaultCategories';
import './Onboarding.css';

const STEPS = [
    { id: 1, title: 'Currency & Locale', description: 'Choose your default currency' },
    { id: 2, title: 'First Wallet', description: 'Set up your first account' },
    { id: 3, title: 'Categories', description: 'Import default categories' },
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Currency & Locale
    const [currency, setCurrency] = useState('INR');
    const [locale, setLocale] = useState('en-IN');

    // Step 2: First Wallet
    const [walletData, setWalletData] = useState({
        name: '',
        type: 'Bank',
        openingBalance: 0,
        includedInTotal: true,
    });

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Step 1: Create user profile
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    display_name: user.user_metadata?.display_name || user.email.split('@')[0],
                    base_currency: currency,
                    locale: locale,
                });

            if (userError) throw userError;

            // Step 2: Create first wallet
            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .insert({
                    user_id: user.id,
                    name: walletData.name,
                    type: walletData.type,
                    icon_id: 'wallet',
                    currency: currency,
                    current_balance: walletData.openingBalance,
                    opening_balance: walletData.openingBalance,
                    included_in_total: walletData.includedInTotal,
                    status: 'Active',
                })
                .select()
                .single();

            if (walletError) throw walletError;

            // Step 3: Seed default categories
            const allCategories = [
                ...DEFAULT_CATEGORIES.expense,
                ...DEFAULT_CATEGORIES.income,
                ...DEFAULT_CATEGORIES.debtLoan,
            ].map(cat => ({
                user_id: user.id,
                name: cat.name,
                type: cat.type,
                icon_id: cat.iconId,
                is_active: true,
                applicable_wallet_ids: null, // All wallets
            }));

            const { error: categoriesError } = await supabase
                .from('categories')
                .insert(allCategories);

            if (categoriesError) throw categoriesError;

            toast.success('Welcome to Zenithly! Your account is ready.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error(error.message || 'Failed to complete onboarding');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Header */}
                <div className="onboarding-header">
                    <h1 className="font-display">Welcome to <span className="text-acid-lime">Zenithly</span></h1>
                    <p className="text-secondary">Let's set up your account in 3 simple steps</p>
                </div>

                {/* Progress Steps */}
                <div className="onboarding-steps">
                    {STEPS.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''
                                }`}
                        >
                            <div className="step-indicator">
                                {currentStep > step.id ? (
                                    <Check size={20} />
                                ) : (
                                    <span>{step.id}</span>
                                )}
                            </div>
                            <div className="step-content">
                                <div className="step-title">{step.title}</div>
                                <div className="step-description">{step.description}</div>
                            </div>
                            {index < STEPS.length - 1 && <div className="step-connector" />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card padding="lg" className="onboarding-card">
                    {currentStep === 1 && (
                        <CurrencyStep
                            currency={currency}
                            locale={locale}
                            onCurrencyChange={setCurrency}
                            onLocaleChange={setLocale}
                        />
                    )}

                    {currentStep === 2 && (
                        <WalletStep
                            walletData={walletData}
                            currency={currency}
                            onWalletChange={setWalletData}
                        />
                    )}

                    {currentStep === 3 && <CategoriesStep />}
                </Card>

                {/* Navigation */}
                <div className="onboarding-actions">
                    {currentStep > 1 && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            leftIcon={<ChevronLeft />}
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                    )}

                    <div style={{ flex: 1 }} />

                    {currentStep < STEPS.length ? (
                        <Button
                            onClick={handleNext}
                            rightIcon={<ChevronRight />}
                            disabled={
                                (currentStep === 2 && !walletData.name) || isLoading
                            }
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleComplete}
                            rightIcon={<Check />}
                            isLoading={isLoading}
                        >
                            Complete Setup
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
