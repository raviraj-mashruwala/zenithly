import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Auth.css';

const signupSchema = z.object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export default function SignUp() {
    const navigate = useNavigate();
    const { signUp } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await signUp(data.email, data.password, data.displayName);
            toast.success('Identity Created. Verify Email.');
            navigate('/onboarding');
        } catch (error) {
            toast.error(error.message || 'Registration Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background Ambience */}
            <div className="auth-bg-glow-2" style={{ top: '-20%', right: '-10%' }} />
            <div className="auth-bg-glow-1" style={{ bottom: '-20%', left: '-10%' }} />

            <div className="auth-container">
                <div className="auth-header">
                    <h1>
                        ZENITH<span style={{ color: 'var(--color-acid-lime)' }}>LY</span>
                    </h1>
                    <p className="auth-subtitle">Create New Identity</p>
                </div>

                <Card className="auth-card">
                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <Input
                            {...register('displayName')}
                            type="text"
                            label="Display Name"
                            placeholder="John Doe"
                            leftIcon={<User size={18} />}
                            error={errors.displayName?.message}
                            fullWidth
                            autoComplete="name"
                        />

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

                        <Input
                            {...register('password')}
                            type="password"
                            label="Secret Key"
                            placeholder="••••••••"
                            leftIcon={<Lock size={18} />}
                            error={errors.password?.message}
                            helperText="Min 8 chars"
                            fullWidth
                            autoComplete="new-password"
                        />

                        <Input
                            {...register('confirmPassword')}
                            type="password"
                            label="Confirm Key"
                            placeholder="••••••••"
                            leftIcon={<Lock size={18} />}
                            error={errors.confirmPassword?.message}
                            fullWidth
                            autoComplete="new-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Initialize Account <ArrowRight size={16} />
                        </Button>
                    </form>
                </Card>

                <p className="auth-footer">
                    Already initialized?{' '}
                    <Link to="/login" className="auth-link">
                        Access System
                    </Link>
                </p>
            </div>
        </div>
    );
}
