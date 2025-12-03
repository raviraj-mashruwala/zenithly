import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings as SettingsIcon, LogOut, Trash2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { CURRENCY_OPTIONS } from '../constants/currencies';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import './Settings.css';

const profileSchema = z.object({
    displayName: z.string().min(1, 'Name is required'),
});

const DATE_FORMATS = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (2024-12-31)' },
];

export default function Settings() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [baseCurrency, setBaseCurrency] = useState('INR');
    const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.user_metadata?.display_name || user?.user_metadata?.name || '',
        },
    });

    const onSubmitProfile = async (data) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: data.displayName },
            });

            if (error) throw error;

            // Also update users table
            await supabase
                .from('users')
                .update({ display_name: data.displayName })
                .eq('id', user.id);

            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        setIsLoading(true);
        try {
            // Delete user data
            await supabase.from('transactions').delete().eq('user_id', user.id);
            await supabase.from('categories').delete().eq('user_id', user.id);
            await supabase.from('wallets').delete().eq('user_id', user.id);
            await supabase.from('users').delete().eq('id', user.id);

            // Delete auth user (this will cascade delete everything)
            // Note: This needs to be done via Supabase admin API in production
            toast.success('Account deleted successfully');
            await logout();
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Failed to delete account');
            setIsLoading(false);
        }
    };

    const handleCurrencyChange = async (newCurrency) => {
        if (baseCurrency !== newCurrency && baseCurrency) {
            const confirmed = window.confirm(
                'Changing your base currency will not convert existing transaction amounts. Are you sure?'
            );
            if (!confirmed) return;
        }

        try {
            await supabase
                .from('users')
                .update({ base_currency: newCurrency })
                .eq('id', user.id);

            setBaseCurrency(newCurrency);
            toast.success('Currency updated');
        } catch (error) {
            toast.error('Failed to update currency');
        }
    };

    return (
        <div className="page-container settings-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="font-display">Settings</h1>
                    <p className="text-secondary">Manage your account and preferences</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* Profile Section */}
                <Card className="settings-section">
                    <div className="section-header">
                        <User size={24} className="section-icon" />
                        <h2 className="section-title">Profile</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitProfile)} className="settings-form">
                        <Input
                            {...register('displayName')}
                            label="Display Name"
                            placeholder="Enter your name"
                            error={errors.displayName?.message}
                            fullWidth
                        />

                        <Input
                            label="Email"
                            value={user?.email || ''}
                            disabled
                            fullWidth
                            helperText="Email cannot be changed"
                        />

                        <Button type="submit" isLoading={isLoading} leftIcon={<Save />}>
                            Save Profile
                        </Button>
                    </form>
                </Card>

                {/* App Settings Section */}
                <Card className="settings-section">
                    <div className="section-header">
                        <SettingsIcon size={24} className="section-icon" />
                        <h2 className="section-title">App Settings</h2>
                    </div>

                    <div className="settings-form">
                        <div className="form-group">
                            <label className="form-label">Base Currency</label>
                            <select
                                value={baseCurrency}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                className="form-select"
                            >
                                {CURRENCY_OPTIONS.map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                            <p className="form-helper-text text-tertiary">
                                ⚠️ Changing currency won't convert existing amounts
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date Format</label>
                            <select
                                value={dateFormat}
                                onChange={(e) => setDateFormat(e.target.value)}
                                className="form-select"
                            >
                                {DATE_FORMATS.map(format => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Account Management Section */}
                <Card className="settings-section danger-section">
                    <div className="section-header">
                        <h2 className="section-title">Account Management</h2>
                    </div>

                    <div className="settings-actions">
                        <div className="action-item">
                            <div>
                                <div className="action-title">Logout</div>
                                <p className="action-description text-secondary">
                                    Sign out of your account on this device
                                </p>
                            </div>
                            <Button variant="outline" onClick={handleLogout} leftIcon={<LogOut />}>
                                Logout
                            </Button>
                        </div>

                        <div className="action-item danger">
                            <div>
                                <div className="action-title danger-text">Delete Account</div>
                                <p className="action-description text-secondary">
                                    Permanently delete your account and all data. This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                variant="danger"
                                onClick={() => setIsDeleteModalOpen(true)}
                                leftIcon={<Trash2 />}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* App Info */}
            <Card padding="md" className="app-info">
                <div className="app-info-content">
                    <div className="app-name">MonoLife Money Manager</div>
                    <div className="app-version text-tertiary">Version 1.0.0 MVP</div>
                </div>
            </Card>

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <Modal onClose={() => setIsDeleteModalOpen(false)} size="sm">
                    <div className="modal-header">
                        <h2 className="font-display danger-text">Delete Account</h2>
                    </div>

                    <div className="modal-content">
                        <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                            This will permanently delete:
                        </p>
                        <ul className="delete-list">
                            <li>All your wallets</li>
                            <li>All your categories</li>
                            <li>All your transactions</li>
                            <li>Your account data</li>
                        </ul>
                        <p className="text-secondary" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <strong>This action cannot be undone.</strong> Type <code>DELETE</code> to confirm:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            className="delete-confirm-input"
                        />
                    </div>

                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            isLoading={isLoading}
                            disabled={deleteConfirmText !== 'DELETE'}
                        >
                            Delete My Account
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
