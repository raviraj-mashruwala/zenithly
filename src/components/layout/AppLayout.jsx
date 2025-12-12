import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import {
    LayoutDashboard,
    Wallet,
    Tags,
    PieChart,
    ArrowRightLeft,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import ProfileModal from '../profile/ProfileModal';
import './AppLayout.css';

const NavItem = ({ to, icon: Icon, label, isActive, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`nav-item ${isActive ? 'active' : ''}`}
    >
        <Icon size={20} />
        <span className="nav-item-label">{label}</span>
    </Link>
);

const AppLayout = ({ children }) => {
    const { signOut, user } = useAuthStore();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/wallets', label: 'Wallets', icon: Wallet },
        { path: '/categories', label: 'Categories', icon: Tags },
        { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
        { path: '/reports', label: 'Reports', icon: PieChart },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    // Get display name, fallback to email username if not set
    const displayName = user?.user_metadata?.display_name ||
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] || 'User';

    // Get avatar icon from user metadata
    const avatarIcon = user?.user_metadata?.avatar_icon;

    // Get initial for fallback avatar
    const getInitial = () => displayName?.[0]?.toUpperCase() || 'U';

    return (
        <div className="app-layout">
            {/* Desktop Sidebar */}
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">
                        ZENITH<span className="sidebar-logo-accent">LY</span>
                    </h1>
                    <p className="sidebar-subtitle">Financial Command</p>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.path}
                            to={item.path}
                            icon={item.icon}
                            label={item.label}
                            isActive={location.pathname.startsWith(item.path)}
                        />
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="user-profile-btn"
                        onClick={() => setIsProfileModalOpen(true)}
                        aria-label="Edit profile"
                    >
                        <div className="user-avatar">
                            {avatarIcon ? (
                                <Icon icon={avatarIcon} width={20} height={20} />
                            ) : (
                                getInitial()
                            )}
                        </div>
                        <div className="user-info">
                            <p className="user-name">{displayName}</p>
                            <p className="user-plan">Pro Plan</p>
                        </div>
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="signout-button"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="mobile-header">
                <h1 className="mobile-logo">
                    ZENITH<span className="sidebar-logo-accent">LY</span>
                </h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="mobile-menu-button"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mobile-menu-overlay"
                    >
                        <nav className="sidebar-nav">
                            {navItems.map((item) => (
                                <NavItem
                                    key={item.path}
                                    to={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={location.pathname.startsWith(item.path)}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                            ))}
                            <button
                                onClick={() => signOut()}
                                className="signout-button"
                                style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem' }}
                            >
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="app-main">
                {/* Background decorative elements */}
                <div className="bg-decorations">
                    <div className="bg-grid" />
                    <div className="bg-aurora" />
                    <div className="bg-glow-1" />
                    <div className="bg-glow-2" />
                </div>

                <div className="content-wrapper">
                    <AnimatePresence mode="wait">

                        <motion.div
                            key={location.pathname}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={{
                                initial: {
                                    opacity: 0,
                                    scale: 0.98,
                                    filter: 'blur(10px)',
                                    y: 10
                                },
                                animate: {
                                    opacity: 1,
                                    scale: 1,
                                    filter: 'blur(0px)',
                                    y: 0,
                                    transition: {
                                        duration: 0.4,
                                        ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for smooth glass feel
                                        filter: { duration: 0.3 }
                                    }
                                },
                                exit: {
                                    opacity: 0,
                                    scale: 0.98,
                                    filter: 'blur(10px)',
                                    y: -10,
                                    transition: {
                                        duration: 0.3,
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }
                                }
                            }}
                            style={{ height: '100%', originY: 0 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};

export default AppLayout;
