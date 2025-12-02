import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'spinner-sm',
        md: 'spinner-md',
        lg: 'spinner-lg',
    };

    return (
        <Loader2
            className={`spinner ${sizeClasses[size]} ${className}`}
            aria-label="Loading"
        />
    );
}
