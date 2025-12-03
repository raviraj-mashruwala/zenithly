import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Auth.css';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
    const navigate = useNavigate();
    const { signIn, signInWithGoogle } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await signIn(data.email, data.password);
            toast.success('Access Granted');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Access Denied');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            toast.error(error.message || 'Google Sign-In Failed');
        }
    };

    return (
        <div className="auth-page">
            {/* Background Ambience */}
            <div className="auth-bg-glow-1" />
            <div className="auth-bg-glow-2" />

            <div className="auth-container">
                <div className="auth-header">
                    <h1>
                        ZENITH<span style={{ color: 'var(--color-accent)' }}>LY</span>
                    </h1>
                    <p className="auth-subtitle">Initialize Session</p>
                </div>

                <Card className="auth-card">
                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <Input
                            {...register('email')}
                            type="email"
                            label="Email Identity"
                            placeholder="user@zenithly.com"
                            leftIcon={<Mail size={18} />}
                            error={errors.email?.message}
                            fullWidth
                            autoComplete="email"
                        />

                        <div>
                            <Input
                                {...register('password')}
                                type="password"
                                label="Access Key"
                                placeholder="••••••••"
                                leftIcon={<Lock size={18} />}
                                error={errors.password?.message}
                                fullWidth
                                autoComplete="current-password"
                            />
                            <div className="forgot-password-link">
                                <Link to="/forgot-password">
                                    Recover Key?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Authenticate <ArrowRight size={16} />
                        </Button>

                        <div className="auth-divider">
                            <span>Or</span>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={handleGoogleSignIn}
                        >
                            <svg style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>
                    </form>
                </Card>

                <p className="auth-footer">
                    New to the system?{' '}
                    <Link to="/signup" className="auth-link">
                        Initialize Account
                    </Link>
                </p>
            </div>
        </div>
    );
}
