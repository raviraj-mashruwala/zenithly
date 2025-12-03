import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={clsx(
                'button',
                `button-${variant}`,
                `button-${size}`,
                fullWidth && 'button-full',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Glitch effect overlay for primary buttons */}
            {variant === 'primary' && !disabled && (
                <div className="button-glitch" />
            )}

            <span className="button-content">
                {isLoading && <Loader2 className="button-loading" size={16} />}
                {children}
            </span>
        </motion.button>
    );
};

export default Button;
