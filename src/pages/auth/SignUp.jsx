import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
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
            toast.success('Account created! Please check your email to verify.');
            navigate('/onboarding');
        } catch (error) {
            toast.error(error.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1 className="font-display">MonoLife</h1>
                    <p className="text-secondary">Start managing your money better</p>
                </div>

                <Card padding="lg" className="auth-card">
                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <Input
                            {...register('displayName')}
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            leftIcon={<User />}
                            error={errors.displayName?.message}
                            fullWidth
                            autoComplete="name"
                        />

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
                            helperText="At least 8 characters"
                            fullWidth
                            autoComplete="new-password"
                        />

                        <Input
                            {...register('confirmPassword')}
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            leftIcon={<Lock />}
                            error={errors.confirmPassword?.message}
                            fullWidth
                            autoComplete="new-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Create Account
                        </Button>
                    </form>
                </Card>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link-strong">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
