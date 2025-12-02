import { X } from 'lucide-react';
import { useEffect } from 'react';
import './Modal.css';

export default function Modal({ children, onClose, size = 'md' }) {
    useEffect(() => {
        // Prevent body scroll when modal is open
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
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content modal-${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
