import { motion } from 'framer-motion';
import clsx from 'clsx';
import './Card.css';

const Card = ({ children, className = '', hover = false, ...props }) => {
    const Component = hover ? motion.div : 'div';

    return (
        <Component
            className={clsx('card', hover && 'card-hover', className)}
            {...props}
        >
            {/* Subtle gradient noise overlay */}
            <div className="card-overlay" />

            <div className="card-content">
                {children}
            </div>
        </Component>
    );
};

export default Card;
