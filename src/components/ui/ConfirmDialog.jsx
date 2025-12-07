import Button from './Button';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // danger, warning, info
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertTriangle className="confirm-dialog-icon danger" />;
            case 'warning':
                return <AlertCircle className="confirm-dialog-icon warning" />;
            case 'info':
            default:
                return <ArrowRight className="confirm-dialog-icon info" />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={isLoading ? undefined : onClose} size="sm">
            <div className="confirm-dialog-content">
                {getIcon()}

                <h3 className="confirm-dialog-title">
                    {title}
                </h3>

                <p className="confirm-dialog-message">
                    {message}
                </p>

                <div className="confirm-dialog-actions">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="confirm-btn cancel"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`confirm-btn ${variant}`}
                    >
                        {isLoading ? (
                            <div className="spinner" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;