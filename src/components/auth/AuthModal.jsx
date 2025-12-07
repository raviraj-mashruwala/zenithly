import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './AuthModal.css';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const navigate = useNavigate();
    const { signIn, signUp, signInWithGoogle } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
    });

    const signupForm = useForm({
        resolver: zodResolver(signupSchema),
    });

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            // Reset forms when modal opens
            loginForm.reset();
            signupForm.reset();
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (!isOpen) return;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLogin = async (data) => {
        setIsLoading(true);
        try {
            await signIn(data.email, data.password);
            toast.success('Access Granted');
            onClose();
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Access Denied');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (data) => {
        setIsLoading(true);
        try {
            const { session } = await signUp(data.email, data.password);

            if (session) {
                toast.success('Account Initialized');
                onClose();
                navigate('/onboarding');
            } else {
                // Email confirmation required
                toast.success('Please check your email to verify your account');
                onClose();
            }
        } catch (error) {
            toast.error(error.message || 'Initialization Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Google Authentication Failed');
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="auth-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Terminal Header */}
                <div className="auth-modal-header">
                    <div className="terminal-line">
                        <span className="terminal-prompt">$</span>
                        <span className="terminal-command">zenithly --auth</span>
                        <span className="terminal-cursor">_</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="auth-modal-tabs">
                    <button
                        className={`auth-modal-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        <span className="tab-bracket">[</span>
                        LOGIN
                        <span className="tab-bracket">]</span>
                    </button>
                    <button
                        className={`auth-modal-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        <span className="tab-bracket">[</span>
                        SIGNUP
                        <span className="tab-bracket">]</span>
                    </button>
                </div>

                {/* Forms */}
                <div className="auth-modal-body">
                    {activeTab === 'login' ? (
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="auth-modal-form">
                            <Input
                                {...loginForm.register('email')}
                                type="email"
                                label="Email Identity"
                                placeholder="user@zenithly.com"
                                leftIcon={<Mail size={18} />}
                                error={loginForm.formState.errors.email?.message}
                                fullWidth
                                autoComplete="email"
                            />

                            <Input
                                {...loginForm.register('password')}
                                type="password"
                                label="Access Key"
                                placeholder="••••••••"
                                leftIcon={<Lock size={18} />}
                                error={loginForm.formState.errors.password?.message}
                                fullWidth
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Authenticate <ArrowRight size={16} />
                            </Button>

                            <div className="auth-divider">
                                <span>OR</span>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={handleGoogleAuth}
                            >
                                <svg style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="auth-modal-form">
                            <Input
                                {...signupForm.register('email')}
                                type="email"
                                label="Email Identity"
                                placeholder="user@zenithly.com"
                                leftIcon={<Mail size={18} />}
                                error={signupForm.formState.errors.email?.message}
                                fullWidth
                                autoComplete="email"
                            />

                            <Input
                                {...signupForm.register('password')}
                                type="password"
                                label="Create Access Key"
                                placeholder="••••••••"
                                leftIcon={<Lock size={18} />}
                                error={signupForm.formState.errors.password?.message}
                                fullWidth
                                autoComplete="new-password"
                            />

                            <Input
                                {...signupForm.register('confirmPassword')}
                                type="password"
                                label="Confirm Access Key"
                                placeholder="••••••••"
                                leftIcon={<Lock size={18} />}
                                error={signupForm.formState.errors.confirmPassword?.message}
                                fullWidth
                                autoComplete="new-password"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Initialize System <ArrowRight size={16} />
                            </Button>

                            <div className="auth-divider">
                                <span>OR</span>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={handleGoogleAuth}
                            >
                                <svg style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
