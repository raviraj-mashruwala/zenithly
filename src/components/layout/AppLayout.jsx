import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import './AppLayout.css';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
};

export default function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-main">
                <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="page-content"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
