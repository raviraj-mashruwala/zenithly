
import Button from './Button';
import Modal from './Modal';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // danger, warning, info
    isLoading = false
}) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <Trash2 className="text-danger" size={24} />;
            case 'warning':
                return <AlertTriangle className="text-warning" size={24} />;
            case 'info':
            default:
                return <Info className="text-info" size={24} />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case 'danger':
                return 'danger';
            case 'warning':
                return 'warning';
            case 'info':
            default:
                return 'primary';
        }
    };

    return (
        <Modal onClose={onClose} size="sm">
            <div className="flex flex-col items-center text-center p-4">
                <div className="mb-4 p-3 bg-primary-50 rounded-full dark:bg-dark-800">
                    {getIcon()}
                </div>

                <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>

                <p className="text-secondary mb-6">
                    {message}
                </p>

                <div className="flex gap-3 w-full justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmButtonVariant()}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
