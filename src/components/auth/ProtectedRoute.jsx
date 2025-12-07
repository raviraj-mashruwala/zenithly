import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading, isProfileComplete } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Redirect to onboarding if profile is not complete and user is not already on onboarding
    if (!isProfileComplete && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
