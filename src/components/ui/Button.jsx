import clsx from 'clsx';
import './Button.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={clsx(
                'btn',
                `btn-${variant}`,
                `btn-${size}`,
                fullWidth && 'btn-full',
                isLoading && 'btn-loading',
                className
            )}
            {...props}
        >
            {isLoading ? (
                <span className="btn-spinner" />
            ) : (
                <>
                    {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
                    <span>{children}</span>
                    {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}
