import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Auth.css';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
    const { resetPassword } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await resetPassword(data.email);
            setEmailSent(true);
            toast.success('Password reset email sent!');
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1 className="font-display">Reset Password</h1>
                    <p className="text-secondary">
                        {emailSent
                            ? 'Check your email for reset instructions'
                            : 'Enter your email to receive a password reset link'
                        }
                    </p>
                </div>

                {!emailSent ? (
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

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    </Card>
                ) : (
                    <Card padding="lg" className="auth-card">
                        <div style={{ textAlign: 'center' }}>
                            <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                                We've sent a password reset link to your email. Please check your inbox and follow the instructions.
                            </p>
                            <Button as={Link} to="/" variant="secondary" fullWidth>
                                Back to Login
                            </Button>
                        </div>
                    </Card>
                )}

                <p className="auth-footer">
                    <Link to="/" className="auth-link-strong">
                        <ArrowLeft size={16} style={{ display: 'inline', marginRight: '4px' }} />
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}
