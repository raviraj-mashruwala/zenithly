import clsx from 'clsx';
import './Card.css';

export default function Card({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    ...props
}) {
    return (
        <div
            className={clsx(
                'card',
                `card-${variant}`,
                `card-padding-${padding}`,
                hover && 'card-hover',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
