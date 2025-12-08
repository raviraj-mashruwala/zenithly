import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import CurrencyStep from '../../components/onboarding/CurrencyStep';
import WalletStep from '../../components/onboarding/WalletStep';
import CategoriesStep from '../../components/onboarding/CategoriesStep';
import { DEFAULT_CATEGORIES } from '../../constants/defaultCategories';
import { createMappingsForNewWallet } from '../../services/categoryWalletMap.service';
import './Onboarding.css';

const STEPS = [
    { id: 1, title: 'Currency & Locale', description: 'Choose your default currency' },
    { id: 2, title: 'First Wallet', description: 'Set up your first account' },
    { id: 3, title: 'Categories', description: 'Import default categories' },
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { user, initialize } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState(0);

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
            setDirection(1);
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Step 1: Create or update user profile
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    display_name: user.user_metadata?.display_name || user.email.split('@')[0],
                    base_currency: currency,
                    locale: locale,
                });

            if (userError) throw userError;

            // Step 2: Create first wallet (or get existing ID)
            let walletId;
            const { data: existingWallets } = await supabase
                .from('wallets')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);

            if (existingWallets && existingWallets.length > 0) {
                walletId = existingWallets[0].id;
            } else {
                const { data: newWallet, error: walletError } = await supabase
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
                walletId = newWallet.id;
            }

            // Step 3: Seed default categories (only if not already exists)
            const { count: categoryCount } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (categoryCount === 0) {
                const allCategories = [
                    ...DEFAULT_CATEGORIES.expense,
                    ...DEFAULT_CATEGORIES.income,
                    ...DEFAULT_CATEGORIES.debtLoan,
                ].map(cat => ({
                    user_id: user.id,
                    name: cat.name,
                    type: cat.type,
                    icon_id: cat.iconId,
                    is_active_global: true,
                    parent_category_id: null,
                }));

                try {
                    const { error: categoriesError } = await supabase
                        .from('categories')
                        .insert(allCategories);

                    if (categoriesError) {
                        // Check if we hit a partial failure or constraint
                        console.error('Category insert error:', categoriesError);
                        throw categoriesError;
                    }
                } catch (catErr) {
                    console.error('Failed to insert categories:', catErr);
                    toast.error(`Category setup failed: ${catErr.message}`);
                    throw catErr;
                }
            }

            // Step 4: Create Wallet Mappings
            if (walletId) {
                try {
                    await createMappingsForNewWallet(walletId, user.id);
                } catch (mapErr) {
                    console.error('Failed to create wallet mappings:', mapErr);
                    // Log but don't block completion if mappings fail (categories exist, can be fixed later)
                }
            }

            // Refresh auth state to update isProfileComplete check
            await initialize();

            toast.success('Welcome to Zenithly! Your account is ready.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error(error.message || 'Failed to complete onboarding');
        } finally {
            setIsLoading(false);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    return (
        <div className="onboarding-page">
            {/* Ambient Background */}
            <div className="ambient-bg">
                <div className="onboarding-grid" />
                <div className="ambient-orb orb-1" />
                <div className="ambient-orb orb-2" />
                <div className="ambient-orb orb-3" />
            </div>

            <div className="onboarding-container">
                {/* Header */}
                <motion.div
                    className="onboarding-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="text-accent" size={24} />
                    </div>
                    <h1 className="onboarding-title">
                        Welcome to <span className="title-accent">Zenithly</span>
                    </h1>
                    <p className="onboarding-subtitle">
                        Let's personalize your financial experience
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="onboarding-steps">
                    {STEPS.map((step, index) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                <div className="step-indicator-wrapper">
                                    {isCompleted ? (
                                        <Check size={20} />
                                    ) : (
                                        <span className="step-number">{step.id}</span>
                                    )}
                                </div>

                                <div className="step-info">
                                    <span className="step-label">{step.title}</span>
                                </div>

                                {index < STEPS.length - 1 && (
                                    <div className="step-connector">
                                        <div
                                            className="step-connector-fill"
                                            style={{ width: isCompleted ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <motion.div
                    className="onboarding-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                        >
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
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="onboarding-actions">
                        {currentStep > 1 ? (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                leftIcon={<ChevronLeft size={18} />}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                        ) : (
                            <div /> // Spacer
                        )}

                        {currentStep < STEPS.length ? (
                            <Button
                                onClick={handleNext}
                                rightIcon={<ChevronRight size={18} />}
                                disabled={
                                    (currentStep === 2 && !walletData.name) || isLoading
                                }
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                rightIcon={<Check size={18} />}
                                isLoading={isLoading}
                            >
                                Complete Setup
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
