import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';

// Auth pages
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Onboarding = lazy(() => import('./pages/auth/Onboarding'));

// Landing pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NewLandingPage = lazy(() => import('./pages/NewLandingPage'));

// Protected pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WalletsList = lazy(() => import('./pages/wallets/WalletsList'));
const CategoriesList = lazy(() => import('./pages/categories/CategoriesList'));
const TransactionsList = lazy(() => import('./pages/transactions/TransactionsList'));
const ReportsOverview = lazy(() => import('./pages/reports/ReportsOverview'));
const NetIncomeReport = lazy(() => import('./pages/reports/NetIncomeReport'));
const ExpenseDetailsReport = lazy(() => import('./pages/reports/ExpenseDetailsReport'));
const Settings = lazy(() => import('./pages/Settings'));

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import PageLoader from './components/ui/PageLoader';

function App() {
    const { initialize, isLoading, user, isProfileComplete } = useAuthStore();
    const { initTheme } = useThemeStore();
    const location = useLocation();

    useEffect(() => {
        initialize();
        initTheme();
    }, [initialize, initTheme]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Check if current route requires AppLayout (all protected routes except onboarding)
    const showLayout = user && location.pathname !== '/onboarding' &&
        !['/forgot-password'].includes(location.pathname);

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Onboarding - no layout */}
                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Onboarding />
                        </Suspense>
                    </ProtectedRoute>
                } />

                {/* Protected routes with layout */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <Dashboard />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/wallets" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <WalletsList />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/categories" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <CategoriesList />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/transactions" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <TransactionsList />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/reports" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <ReportsOverview />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/reports/income" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <NetIncomeReport />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/reports/expenses" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <ExpenseDetailsReport />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Suspense fallback={<PageLoader />}>
                                <Settings />
                            </Suspense>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                {/* Root route - Landing or Dashboard */}
                <Route path="/" element={
                    user ? (
                        isProfileComplete ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />
                    ) : (
                        <Suspense fallback={<div className="loading-container"><LoadingSpinner size="lg" /></div>}>
                            <NewLandingPage />
                        </Suspense>
                    )
                } />

                {/* Fallback auth routes (accessible directly) */}

                <Route path="/forgot-password" element={
                    user ? <Navigate to="/dashboard" replace /> : (
                        <Suspense fallback={<div className="loading-container"><LoadingSpinner size="lg" /></div>}>
                            <ForgotPassword />
                        </Suspense>
                    )
                } />

                {/* Catch-all redirect */}
                <Route path="*" element={
                    user ? (
                        isProfileComplete ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />
                    ) : <Navigate to="/" replace />
                } />
            </Routes>
        </AnimatePresence>
    );
}

export default App;
