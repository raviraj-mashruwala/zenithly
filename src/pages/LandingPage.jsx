import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, TrendingUp, PieChart, Shield, BarChart3,
    Target, Zap, ArrowRight, Sparkles, CreditCard,
    Layers, ChevronRight
} from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import './LandingPage.css';

export default function LandingPage() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');

    const openLogin = () => {
        setAuthModalTab('login');
        setAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthModalTab('signup');
        setAuthModalOpen(true);
    };

    const features = [
        {
            icon: Wallet,
            title: 'Multi-Wallet System',
            description: 'Manage bank accounts, credit cards, cash, and investments—all in one elegant dashboard.',
        },
        {
            icon: Target,
            title: 'Smart Categories',
            description: 'Organize your finances with customizable categories and intelligent auto-classification.',
        },
        {
            icon: BarChart3,
            title: 'Visual Reports',
            description: 'Beautiful charts and analytics that make understanding your money a pleasure.',
        },
        {
            icon: TrendingUp,
            title: 'Trend Insights',
            description: 'Track spending patterns over time and discover opportunities to save.',
        },
        {
            icon: CreditCard,
            title: 'Transaction Tracking',
            description: 'Every transaction logged with search, filters, and seamless categorization.',
        },
        {
            icon: Shield,
            title: 'Bank-Level Security',
            description: 'Your data encrypted and protected with industry-leading security standards.',
        }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <div className="landing-page">
            {/* Ambient Background */}
            <div className="ambient-bg">
                <div className="ambient-orb orb-1" />
                <div className="ambient-orb orb-2" />
                <div className="ambient-orb orb-3" />
            </div>

            {/* Navigation */}
            <motion.nav
                className="landing-nav"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="container nav-container">
                    <div className="nav-brand">
                        <Sparkles className="brand-icon" size={24} />
                        <span className="brand-name">Zenithly</span>
                    </div>
                    <div className="nav-actions">
                        <button className="nav-link" onClick={openLogin}>
                            Sign In
                        </button>
                        <button className="nav-cta" onClick={openSignup}>
                            Get Started
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div className="hero-badge" variants={fadeInUp}>
                            <Sparkles size={14} />
                            <span>Personal Finance, Reimagined</span>
                        </motion.div>

                        <motion.h1 className="hero-title" variants={fadeInUp}>
                            Your Money,
                            <br />
                            <span className="title-accent">Beautifully Managed</span>
                        </motion.h1>

                        <motion.p className="hero-description" variants={fadeInUp}>
                            Track expenses, manage wallets, and gain insights into your financial health
                            with an interface designed for clarity and delight.
                        </motion.p>

                        <motion.div className="hero-ctas" variants={fadeInUp}>
                            <button className="cta-primary" onClick={openSignup}>
                                <span>Start Free</span>
                                <ArrowRight size={18} />
                            </button>
                            <button className="cta-secondary" onClick={openLogin}>
                                <span>I have an account</span>
                            </button>
                        </motion.div>

                        <motion.div className="hero-stats" variants={fadeInUp}>
                            <div className="stat-item">
                                <span className="stat-value">100%</span>
                                <span className="stat-label">Free to Use</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">∞</span>
                                <span className="stat-label">Wallets</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">Secure</span>
                                <span className="stat-label">Always</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-tag">Features</span>
                        <h2 className="section-title">
                            Everything You Need
                        </h2>
                        <p className="section-description">
                            Powerful tools wrapped in a beautiful experience
                        </p>
                    </motion.div>

                    <motion.div
                        className="features-grid"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                variants={fadeInUp}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            >
                                <div className="feature-icon">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="cta-content">
                            <h2 className="cta-title">Ready to take control?</h2>
                            <p className="cta-description">
                                Join thousands who've transformed their relationship with money.
                            </p>
                            <div className="cta-buttons">
                                <button className="cta-primary" onClick={openSignup}>
                                    <Zap size={18} />
                                    <span>Get Started Free</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="cta-decoration">
                            <Layers size={120} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <Sparkles className="brand-icon" size={20} />
                            <span className="footer-logo">Zenithly</span>
                        </div>
                        <div className="footer-info">
                            <span>© 2025</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialTab={authModalTab}
            />
        </div>
    );
}
