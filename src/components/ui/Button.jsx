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
    leftIcon,
    rightIcon,
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
                {isLoading ? (
                    <Loader2 className="button-loading" size={16} />
                ) : (
                    leftIcon && <span className="button-icon">{leftIcon}</span>
                )}
                {children}
                {rightIcon && !isLoading && <span className="button-icon">{rightIcon}</span>}
            </span>
        </motion.button>
    );
};

export default Button;
