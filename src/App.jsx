import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Onboarding = lazy(() => import('./pages/auth/Onboarding'));

// Protected pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WalletsList = lazy(() => import('./pages/wallets/WalletsList'));
const CategoriesList = lazy(() => import('./pages/categories/CategoriesList'));
const TransactionsList = lazy(() => import('./pages/transactions/TransactionsList'));
const NetIncomeReport = lazy(() => import('./pages/reports/NetIncomeReport'));
const ExpenseDetailsReport = lazy(() => import('./pages/reports/ExpenseDetailsReport'));
const Settings = lazy(() => import('./pages/Settings'));

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
    const { initialize, isLoading } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="loading-container"><LoadingSpinner size="lg" /></div>}>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected routes */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/wallets" element={<ProtectedRoute><WalletsList /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoriesList /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionsList /></ProtectedRoute>} />
                <Route path="/reports/income" element={<ProtectedRoute><NetIncomeReport /></ProtectedRoute>} />
                <Route path="/reports/expenses" element={<ProtectedRoute><ExpenseDetailsReport /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
