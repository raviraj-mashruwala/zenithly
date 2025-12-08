import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import { User, Save, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AvatarIconPicker from './AvatarIconPicker';
import './ProfileModal.css';

const profileSchema = z.object({
    displayName: z.string().min(1, 'Name is required'),
});

export default function ProfileModal({ isOpen, onClose }) {
    const { user, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Sync selected icon with user data when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedIcon(user?.user_metadata?.avatar_icon || null);
            setShowIconPicker(false);
        }
    }, [isOpen, user?.user_metadata?.avatar_icon]);

    const displayName = user?.user_metadata?.display_name ||
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] || '';

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName,
        },
    });

    // Reset form when user data changes
    useEffect(() => {
        if (isOpen) {
            reset({ displayName });
        }
    }, [isOpen, displayName, reset]);

    const handleAvatarSelect = (iconId) => {
        setSelectedIcon(iconId);
        setShowIconPicker(false);
    };

    const handleRemoveAvatar = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIcon(null);
    };

    const onSubmit = async (data) => {
        console.log('1. Save clicked, starting submission...');
        if (isLoading) {
            console.log('submission blocked: already loading');
            return;
        }

        setIsLoading(true);
        // creating a timeout promise to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        try {
            console.log('2. Calling updateProfile with:', {
                display_name: data.displayName,
                avatar_icon: selectedIcon,
            });

            // Race against timeout
            await Promise.race([
                updateProfile({
                    display_name: data.displayName,
                    avatar_icon: selectedIcon,
                }),
                timeoutPromise
            ]);

            console.log('3. Profile update successful');
            toast.success('Profile updated successfully');
            // Force close immediately
            onClose();
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            console.log('4. Submission finished, resetting loading state');
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setShowIconPicker(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    const getInitial = () => {
        return displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
    };

    return (
        <Modal onClose={handleClose} size="sm">
            <div className="modal-header">
                <h2 className="font-display">Edit Profile</h2>
                <button
                    type="button"
                    className="modal-close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="profile-modal-form">
                {/* Avatar Section */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar-large">
                            {selectedIcon ? (
                                <Icon icon={selectedIcon} width={48} height={48} />
                            ) : (
                                <span className="avatar-initial">{getInitial()}</span>
                            )}
                        </div>
                        {selectedIcon && (
                            <button
                                type="button"
                                className="avatar-remove-btn"
                                onClick={handleRemoveAvatar}
                                title="Remove avatar icon"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<ImagePlus size={16} />}
                        onClick={(e) => {
                            e.preventDefault();
                            setShowIconPicker(!showIconPicker);
                        }}
                    >
                        {selectedIcon ? 'Change Avatar' : 'Choose Avatar'}
                    </Button>
                </div>

                {/* Icon Picker */}
                {showIconPicker && (
                    <div className="profile-icon-picker-wrapper">
                        <AvatarIconPicker
                            selectedIcon={selectedIcon}
                            onSelect={handleAvatarSelect}
                            onClose={() => setShowIconPicker(false)}
                        />
                    </div>
                )}

                {/* Form Fields */}
                <div className="profile-form-fields">
                    <Input
                        {...register('displayName')}
                        label="Display Name"
                        placeholder="Enter your name"
                        error={errors.displayName?.message}
                        leftIcon={<User size={16} />}
                        fullWidth
                    />

                    <Input
                        label="Email"
                        value={user?.email || ''}
                        disabled
                        fullWidth
                        helperText="Email cannot be changed"
                    />
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        leftIcon={<Save size={16} />}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
