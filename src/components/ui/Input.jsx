import { forwardRef } from 'react';
import clsx from 'clsx';
import './Input.css';

const Input = forwardRef(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={clsx('input-wrapper', fullWidth && 'input-full', className)}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                    {props.required && <span className="input-required">*</span>}
                </label>
            )}

            <div className={clsx('input-container', error && 'input-error')}>
                {leftIcon && <span className="input-icon-left">{leftIcon}</span>}

                <input
                    ref={ref}
                    id={inputId}
                    className={clsx(
                        'input',
                        leftIcon && 'input-with-left-icon',
                        rightIcon && 'input-with-right-icon'
                    )}
                    {...props}
                />

                {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
            </div>

            {(error || helperText) && (
                <p className={clsx('input-hint', error && 'input-hint-error')}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
