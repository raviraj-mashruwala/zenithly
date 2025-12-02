import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
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
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            toast.error(error.message || 'Failed to sign in with Google');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1 className="font-display">MonoLife</h1>
                    <p className="text-secondary">Welcome back to your money manager</p>
                </div>

                <Card padding="lg" className="auth-card">
                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <Input
                            {...register('email')}
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            leftIcon={<Mail />}
                            error={errors.email?.message}
                            fullWidth
                            autoComplete="email"
                        />

                        <Input
                            {...register('password')}
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            leftIcon={<Lock />}
                            error={errors.password?.message}
                            fullWidth
                            autoComplete="current-password"
                        />

                        <Link to="/forgot-password" className="auth-link">
                            Forgot password?
                        </Link>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={handleGoogleSignIn}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.96C.347 6.173 0 7.548 0 9s.348 2.827.96 4.042l3.004-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.96 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>
                    </form>
                </Card>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-link-strong">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
